import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SPHomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <View>
            <Text style={styles.title}>Service Provider</Text>
            <Text style={styles.subtitle}>Manage requests and active jobs.</Text>
          </View>
          <View style={styles.badge}> 
            <Text style={styles.badgeText}>4 active</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.itemCard}>
            <Text style={styles.itemTitle}>Kitchen Cleaning</Text>
            <Text style={styles.itemMeta}>Brgy. Sampaguita · 1:00 PM</Text>
          </View>
          <View style={styles.itemCard}>
            <Text style={styles.itemTitle}>Garden Maintenance</Text>
            <Text style={styles.itemMeta}>Brgy. Sabang · 3:00 PM</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf3fb',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  topCard: {
    backgroundColor: '#0f172a',
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  badge: {
    backgroundColor: '#38bdf8',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  badgeText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
  },
  itemTitle: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 8,
  },
  itemMeta: {
    color: '#64748b',
    fontSize: 13,
  },
});
