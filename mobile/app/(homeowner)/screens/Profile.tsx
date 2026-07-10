import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const stats = [
  { label: 'Jobs Posted', value: '12' },
  { label: 'Balance', value: '₱250' },
  { label: 'Avg Rating', value: '4.9' },
];

const options = [
  { label: 'Edit Profile', subtitle: 'Update your personal info' },
  { label: 'Payment Methods', subtitle: 'Manage cards & billing' },
  { label: 'Notifications', subtitle: 'Alerts & preferences' },
  { label: 'App Settings', subtitle: 'Preferences & display' },
];

export default function Profile() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>AC</Text>
            </View>
            <View style={styles.heroText}>
              <Text style={styles.profileName}>Alex Chen</Text>
              <View style={styles.customerBadge}>
                <Text style={styles.customerBadgeText}>Customer</Text>
              </View>
            </View>
            <View style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>alex@example.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>+639876543218</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>Brgy. Sampaguita...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>March 2026</Text>
          </View>
        </View>

        <View style={styles.optionsCard}>
          {options.map((option) => (
            <View key={option.label} style={styles.optionRow}>
              <View style={styles.optionIcon} />
              <View style={styles.optionTextGroup}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </View>
          ))}
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
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  heroText: {
    flex: 1,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  customerBadge: {
    backgroundColor: '#ffffff22',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customerBadgeText: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#ffffff22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    color: '#ffffff',
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff11',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 6,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  accountTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  infoValue: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },
  optionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    marginRight: 14,
  },
  optionTextGroup: {
    flex: 1,
  },
  optionLabel: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionSubtitle: {
    color: '#64748b',
    fontSize: 13,
  },
  optionArrow: {
    color: '#94a3b8',
    fontSize: 18,
  },
});
