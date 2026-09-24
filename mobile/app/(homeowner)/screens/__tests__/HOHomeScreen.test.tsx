import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import HOHomeScreen from '../HOHomeScreen';
import { api } from '../../../../src/lib/api';
import { useAuth } from '../../../../src/context/AuthContext';

jest.mock('../../../../src/lib/api', () => ({
  api: {
    wallet: jest.fn(),
    myJobs: jest.fn(),
    categories: jest.fn(),
    notifications: jest.fn(),
    unreadNotificationCount: jest.fn(),
  },
}));

jest.mock('../../../../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('HOHomeScreen — empty state does not flash while jobs are still loading (QA #11)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ profile: { full_name: 'Alex', city: null, address: null } });
    (api.wallet as jest.Mock).mockResolvedValue({ balance: 0, available: 0, held: 0 });
    (api.categories as jest.Mock).mockResolvedValue([]);
    (api.notifications as jest.Mock).mockResolvedValue([]);
    (api.unreadNotificationCount as jest.Mock).mockResolvedValue({ count: 0 });
  });

  it('does not show "Need something done?" while only the jobs request is still pending', async () => {
    // Never resolves during this test — jobs.loading stays true while the
    // other three requests above resolve, so the whole-screen skeleton
    // (which requires ALL four loading) is no longer showing.
    (api.myJobs as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<HOHomeScreen onNavigate={jest.fn()} />);

    // Wait for the other three requests to settle and the main content to render.
    await waitFor(() => expect(screen.getByText('Alex')).toBeTruthy());

    expect(screen.queryByText('Need something done?')).toBeNull();
  });

  it('shows "Need something done?" once jobs have actually loaded with none active', async () => {
    (api.myJobs as jest.Mock).mockResolvedValue([]);

    render(<HOHomeScreen onNavigate={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('Need something done?')).toBeTruthy());
  });
});
