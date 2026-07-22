import React, { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Shared application frame.
 *
 * `useWindowDimensions` updates when the device size or orientation changes.
 * The frame is edge-to-edge so each screen can paint behind the iOS status and
 * home-indicator areas. The centred content column still prevents the UI from
 * becoming uncomfortably wide on tablets or large/foldable displays.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 600);

  return (
    <View style={styles.root}>
      <View style={[styles.content, { width: contentWidth }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    maxWidth: 600,
    overflow: 'hidden',
  },
});
