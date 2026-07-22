import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Shadows, Sizes } from '../constants/theme';

export type BottomNavItem<T extends string> = {
  key: T;
  label: string;
  icon: LucideIcon;
  /** Renders this tab as the raised primary action. */
  primary?: boolean;
};

type BottomNavBarProps<T extends string> = {
  activeTab: T;
  tabs: readonly BottomNavItem<T>[];
  onTabPress: (tab: T) => void;
};

/** Shared, icon-based bottom navigation for both application roles. */
export default function BottomNavBar<T extends string>({
  activeTab,
  tabs,
  onTabPress,
}: BottomNavBarProps<T>) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === activeTab;

        if (tab.primary) {
          return (
            <TouchableOpacity
              key={tab.key}
              accessibilityLabel={tab.label}
              style={styles.primaryButton}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.85}
            >
              <Icon size={28} color={Colors.white} strokeWidth={2.25} />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityLabel={tab.label}
            style={styles.tabButton}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.8}
          >
            <Icon
              size={20}
              color={isActive ? Colors.brandTeal : Colors.muted}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
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
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 8,
  },
  tabLabel: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  tabLabelActive: {
    color: Colors.brandTeal,
  },
  primaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
