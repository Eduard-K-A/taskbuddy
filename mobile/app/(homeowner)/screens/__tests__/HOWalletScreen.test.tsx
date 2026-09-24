import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import HOWalletScreen from '../HOWalletScreen';
import { api } from '../../../../src/lib/api';
import { showToast } from '../../../../src/components/Toast';
import { clearAsyncDataCache } from '../../../../src/hooks/useAsyncData';

jest.mock('../../../../src/lib/api', () => ({
  api: {
    wallet: jest.fn(),
    withdrawals: jest.fn(),
  },
}));

jest.mock('../../../../src/components/Toast', () => ({
  showToast: jest.fn(),
  ToastHost: () => null,
}));

describe('HOWalletScreen — Withdraw when the wallet failed to load (QA #19)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // useAsyncData's cache is a module-level singleton shared by every it()
    // in this file — without this, a prior test's cached wallet data would
    // leak into the next test's first render.
    clearAsyncDataCache();
    (api.withdrawals as jest.Mock).mockResolvedValue([]);
  });

  it('shows a "couldn\'t load" toast, not "no funds", when the wallet request failed', async () => {
    (api.wallet as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<HOWalletScreen />);

    await waitFor(() => expect(screen.getByText('Withdraw')).toBeTruthy());

    fireEvent.press(screen.getByText('Withdraw'));

    expect(showToast).toHaveBeenCalledWith(
      expect.stringMatching(/couldn.t load your wallet/i),
    );
    expect(showToast).not.toHaveBeenCalledWith(
      expect.stringMatching(/no funds/i),
    );
  });

  it('still shows the real "no funds" message once the wallet has actually loaded at zero', async () => {
    (api.wallet as jest.Mock).mockResolvedValue({ balance: 0, available: 0, held: 0 });

    render(<HOWalletScreen />);

    await waitFor(() => expect(screen.getByText('Withdraw')).toBeTruthy());

    fireEvent.press(screen.getByText('Withdraw'));

    expect(showToast).toHaveBeenCalledWith(
      expect.stringMatching(/no funds available to withdraw/i),
    );
  });

  it('does not block Withdraw when a valid cached balance is showing but a background refresh just failed', async () => {
    // First mount: a normal successful load, seeding useAsyncData's cache
    // under the 'ho-wallet' key with a positive, withdrawable balance.
    (api.wallet as jest.Mock).mockResolvedValue({ balance: 500, available: 500, held: 0 });
    const { unmount } = render(<HOWalletScreen />);
    await waitFor(() => expect(screen.getByText('₱500.00')).toBeTruthy());
    unmount();

    // Remount (a real tab revisit): the cache seeds `data` synchronously
    // with the same good balance, rendered immediately, while the request
    // this mount actually makes fails in the background.
    (api.wallet as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<HOWalletScreen />);

    // The stale-but-valid balance is already on screen from cache.
    expect(screen.getByText('₱500.00')).toBeTruthy();
    // Wait for this mount's own (failing) request to settle.
    await waitFor(() => expect(api.wallet as jest.Mock).toHaveBeenCalledTimes(2));

    fireEvent.press(screen.getByText('Withdraw'));

    expect(showToast).not.toHaveBeenCalledWith(
      expect.stringMatching(/couldn.t load your wallet/i),
    );
    // The withdraw modal opened (its body copy is unique — the button and
    // the modal title both just say "Withdraw").
    expect(
      screen.getByText(/Send a request to withdraw your available wallet balance/),
    ).toBeTruthy();
  });
});
