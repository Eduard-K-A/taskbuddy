/**
 * SPBottomNavBar.tsx
 * Service Provider 5-tab bottom navigation bar.
 * Matches Figma SP Navigation Tabs: Dashboard, My Jobs, (center), Calendar, Profile.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Shadows, Sizes } from '../constants/designTokens';
import { SPScreen } from '../types/navigation';

interface SPBottomNavBarProps {
  activeTab: SPScreen;
  onTabPress: (tab: SPScreen) => void;
}

const TABS: { key: SPScreen; label: string; icon: string }[] = [
  { key: 'Dashboard', label: 'Dashboard', icon: '⊞' },
  { key: 'My Jobs', label: 'My Jobs', icon: '📋' },
  { key: 'Calendar', label: '', icon: '+' },
  { key: 'Wallet', label: 'Wallet', icon: '💳' },
  { key: 'Profile', label: 'Profile', icon: '👤' },
];

export default function SPBottomNavBar({ activeTab, onTabPress }: SPBottomNavBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isCenter = tab.key === 'Calendar' && tab.icon === '+';
        const isActive = activeTab === tab.key;

        if (isCenter) {
          return (
            <TouchableOpacity
              key="center"
              style={styles.centerBtn}
              onPress={() => onTabPress('Calendar')}
              activeOpacity={0.85}
            >
              <Text style={styles.centerBtnText}>+</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBtn}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: Sizes.navBarHeight,
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(144, 153, 184, 0.15)',
    ...Shadows.navBar,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 3,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.muted,
    fontFamily: 'Inter',
  },
  tabLabelActive: {
    color: Colors.brandTeal,
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.brandTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  centerBtnText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});
