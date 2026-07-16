/**
 * app/index.tsx
 * Navigation entry point — all routing is handled by App.tsx at the root.
 * This file is kept to satisfy Expo Router's file-based routing,
 * but it is never rendered because App.tsx controls the navigation tree.
 */
import React from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  return <View />;
}
