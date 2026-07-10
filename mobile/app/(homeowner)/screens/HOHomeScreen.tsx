import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const services = [
  { label: 'General Cleaning' },
  { label: 'Painting' },
  { label: 'Deep Cleaning' },
  { label: 'Moving' },
  { label: 'Plumbing' },
];

const jobs = [
  {
    title: 'Home Deep Clean',
    location: 'Brgy. Sabang, Lipa City, Batangas',
    amount: '₱850',
    status: 'Pending',
    statusColor: '#f59e0b',
    priority: 'High Priority',
    priorityColor: '#fca5a5',
    age: '45d ago',
  },
  {
    title: 'Office Cleaning',
    location: '1962 J.P. Laurel National High',
    amount: '₱685',
    status: 'In Progress',
    statusColor: '#34d399',
    priority: 'Medium Priority',
    priorityColor: '#fde68a',
    age: '46d ago',
  },
];

export default function HOHomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.userName}>Alex Chen</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeText}>2</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>AC</Text>
            </View>
          </View>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletAmount}>₱250.00</Text>
            </View>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletStatusRow}>
            <View style={styles.statusChip}>
              <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.statusText}>1 pending</Text>
            </View>
            <View style={styles.statusChip}>
              <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.statusText}>1 active</Text>
            </View>
            <View style={styles.statusChip}>
              <View style={[styles.dot, { backgroundColor: '#71c7ff' }]} />
              <Text style={styles.statusText}>2 done</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.locationText}>Brgy. Sampaguita, ...</Text>
            <Text style={styles.radiusText}>Search Radius 5 mi</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Book a Service</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceScroll}>
          {services.map((service) => (
            <View key={service.label} style={styles.serviceCard}>
              <View style={styles.serviceIcon} />
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderWithAction}>
          <Text style={styles.sectionTitle}>Active Jobs</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {jobs.map((job) => (
          <View key={job.title} style={styles.jobCard}>
            <View style={styles.jobCardHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={[styles.statusPill, { backgroundColor: `${job.statusColor}22` }]}> 
                <Text style={[styles.statusPillText, { color: job.statusColor }]}>{job.status}</Text>
              </View>
            </View>
            <Text style={styles.jobLocation}>{job.location}</Text>
            <View style={styles.jobMetaRow}>
              <View style={[styles.priorityChip, { backgroundColor: job.priorityColor }]}>
                <Text style={styles.priorityText}>{job.priority}</Text>
              </View>
              <Text style={styles.ageText}>{job.age}</Text>
            </View>
            <Text style={styles.jobAmount}>{job.amount}</Text>
          </View>
        ))}

        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navButton, styles.navButtonActive]} activeOpacity={0.8}>
            <Text style={[styles.navButtonText, styles.navButtonTextActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
            <Text style={styles.navButtonText}>My Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, styles.floatingButton]} activeOpacity={0.8}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
            <Text style={styles.navButtonText}>Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
            <Text style={styles.navButtonText}>Profile</Text>
          </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#334155',
    fontSize: 15,
  },
  userName: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  walletCard: {
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 22,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 4,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  walletLabel: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 4,
  },
  walletAmount: {
    color: '#0f172a',
    fontSize: 36,
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  walletStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#475569',
    fontSize: 12,
  },
  locationRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationText: {
    color: '#475569',
    fontSize: 13,
  },
  radiusText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionHeaderWithAction: {
    marginTop: 10,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    color: '#2563eb',
    fontWeight: '700',
  },
  serviceScroll: {
    marginBottom: 24,
  },
  serviceCard: {
    width: 118,
    height: 118,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    marginRight: 14,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 3,
  },
  serviceIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
  },
  serviceLabel: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  jobLocation: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 14,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  priorityChip: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  priorityText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  ageText: {
    color: '#64748b',
    fontSize: 12,
  },
  jobAmount: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 22,
  },
  bottomNav: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  navButtonActive: {
    backgroundColor: '#2563eb',
  },
  navButtonText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  navButtonTextActive: {
    color: '#ffffff',
  },
  floatingButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0f172a',
    marginHorizontal: 4,
  },
  floatingButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
});
