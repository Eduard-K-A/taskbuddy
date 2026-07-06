import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenKey, bottomTabs } from '../types/navigation';

type BottomNavBarProps = {
  activeTab: ScreenKey;
  onTabPress?: (tab: ScreenKey) => void;
};

export default function BottomNavBar({ activeTab, onTabPress }: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      {bottomTabs.map((key) => {
        const isActive = key === activeTab;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onTabPress?.(key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{key}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#0f172a',
  },
  tabText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
  },
});
