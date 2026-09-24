import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Replaces the fixed `Sizes.statusBarHeight` estimate (a bare `52` on iOS,
 * a tuned `StatusBar.currentHeight + 28` on Android — computed once at
 * import time, never reactive to rotation) with the real, per-device inset.
 * `+28` reproduces today's ~52dp visual baseline, same relationship
 * `useAuthLayout`'s `insets.top + 32` already uses.
 */
export function useHeaderTop(extra = 0) {
  const insets = useSafeAreaInsets();
  return insets.top + 28 + extra;
}
