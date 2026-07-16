/**
 * AppHeader.tsx
 * Reusable teal hero header with optional back button, title, subtitle, and right action.
 * Matches Figma "Header" pattern used across both HO and SP screens.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, Radii, Spacing, Sizes } from '../constants/designTokens';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  /** If true the header shows a taller hero section (264px) like the dashboard */
  heroMode?: boolean;
  children?: React.ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  onBack,
  rightElement,
  style,
  heroMode = false,
  children,
}: AppHeaderProps) {
  return (
    <View style={[styles.header, heroMode && styles.headerHero, style]}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightElement ? (
          <View style={styles.rightSlot}>{rightElement}</View>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.brandDark,
    paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.headerPad,
    paddingBottom: 20,
    borderBottomLeftRadius: Radii.header,
    borderBottomRightRadius: Radii.header,
  },
  headerHero: {
    paddingBottom: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  backPlaceholder: {
    width: 36,
  },
  rightPlaceholder: {
    width: 36,
  },
  titleBlock: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
});
