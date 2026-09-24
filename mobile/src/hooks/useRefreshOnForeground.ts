import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Runs `callback` whenever the app comes back to the foreground (background
 * or inactive -> active), while `enabled` is true.
 *
 * Built for state that changes server-side while the app is backgrounded and
 * has no other trigger to notice it — e.g. a provider's verification being
 * approved by a webhook while they're off the Verification screen (QA P2.1):
 * without this, the "Verify to Apply" banner only clears on the next full
 * app restart or a revisit to that screen.
 */
export function useRefreshOnForeground(callback: () => void, enabled: boolean) {
  const appState = useRef(AppState.currentState);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      // currentState is nullable until the native constant resolves — guard
      // rather than assume it's always a string (a null/undefined previous
      // state is "not active", so it still counts as "coming to foreground").
      const previous = appState.current;
      const cameToForeground = previous !== 'active' && next === 'active';
      appState.current = next;
      if (cameToForeground) callbackRef.current();
    });

    return () => subscription.remove();
  }, [enabled]);
}
