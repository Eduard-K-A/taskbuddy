import React from 'react';
import { AppState } from 'react-native';
import { render } from '@testing-library/react-native';
import { useRefreshOnForeground } from '../useRefreshOnForeground';

function Harness({ callback, enabled }: { callback: () => void; enabled: boolean }) {
  useRefreshOnForeground(callback, enabled);
  return null;
}

describe('useRefreshOnForeground (P2.1)', () => {
  let listeners: Array<(state: string) => void>;
  let removeSpy: jest.Mock;

  beforeEach(() => {
    listeners = [];
    removeSpy = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
      listeners.push(handler as (state: string) => void);
      return { remove: removeSpy } as never;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls the callback when the app transitions from background to active', () => {
    const callback = jest.fn();
    render(<Harness callback={callback} enabled />);

    listeners[0]('background');
    listeners[0]('active');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not subscribe or call the callback while disabled', () => {
    const callback = jest.fn();
    render(<Harness callback={callback} enabled={false} />);

    // The hook's own effect must not register a listener while disabled —
    // unrelated RN internals may still call addEventListener for other
    // reasons, so assert on `listeners` (populated only by *our* mock calls)
    // rather than on the spy's overall call count.
    expect(listeners).toHaveLength(0);
    expect(callback).not.toHaveBeenCalled();
  });

  it('removes the listener on unmount', () => {
    const callback = jest.fn();
    const { unmount } = render(<Harness callback={callback} enabled />);

    unmount();

    expect(removeSpy).toHaveBeenCalledTimes(1);
  });
});
