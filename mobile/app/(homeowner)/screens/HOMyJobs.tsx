/**
 * MyJobs.tsx (HO - My Jobs List)
 *
 * Figma Source: "HO - My Jobs List" (id: 46:850)
 *
 * Design:
 * - Dark teal header with title "My Jobs" and filter tabs
 * - Job cards list with status indicators
 * - Floating action button for creating new job
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CalendarDays,
  MapPin,
  Plus,
  UserRound,
} from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { HOScreen } from '../../../src/types/navigation';

const FILTER_TABS = ['All', 'Active', 'Pending', 'Completed'];

const JOBS = [
  {
    id: '1',
    title: 'Home Deep Clean',
    category: 'Deep Cleaning',
    location: 'Brgy. Sabang, Lipa City, Batangas',
    amount: '₱850',
    status: 'Pending',
    statusColor: '#F59E0B',
    statusBg: '#FFF7ED',
    date: 'May 13, 2026',
    time: '10:00 AM',
    provider: 'Juan dela Cruz',
    barColor: '#F59E0B',
  },
  {
    id: '2',
    title: 'Office Cleaning',
    category: 'General Cleaning',
    location: '1962 J.P. Laurel National High',
    amount: '₱685',
    status: 'In Progress',
    statusColor: '#22C55E',
    statusBg: '#F0FDF4',
    date: 'May 14, 2026',
    time: '2:00 PM',
    provider: 'Maria Santos',
    barColor: '#22C55E',
  },
  {
    id: '3',
    title: 'Airbnb Turnover',
    category: 'Deep Cleaning',
    location: 'Brgy. Sampaguita, Lipa City',
    amount: '₱895',
    status: 'Completed',
    statusColor: '#3B82F6',
    statusBg: '#EFF6FF',
    date: 'May 8, 2026',
    time: '3:00 PM',
    provider: 'Rosa Villanueva',
    barColor: '#3B82F6',
  },
  {
    id: '4',
    title: 'Plumbing Repair',
    category: 'Plumbing',
    location: 'Brgy. Tambo, Lipa City',
    amount: '₱1,200',
    status: 'Pending',
    statusColor: '#F59E0B',
    statusBg: '#FFF7ED',
    date: 'May 20, 2026',
    time: '9:00 AM',
    provider: 'Pending Assignment',
    barColor: '#F59E0B',
  },
];

interface MyJobsProps {
  onNavigate: (screen: HOScreen) => void;
}

export default function MyJobs({ onNavigate }: MyJobsProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? JOBS
    : JOBS.filter((j) => j.status === activeFilter || (activeFilter === 'Active' && j.status === 'In Progress'));

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerSubtitle}>Customer · Calendar</Text>
            <Text style={styles.headerTitle}>My Jobs</Text>
          </View>
          <View style={styles.jobsBadge}>
            <Text style={styles.jobsBadgeText}>{JOBS.length} jobs</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Jobs list */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            onPress={() => onNavigate('Job Detail')}
            activeOpacity={0.9}
          >
            <View style={[styles.jobBar, { backgroundColor: job.barColor }]} />
            <View style={styles.jobContent}>
              <View style={styles.jobCardHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <View style={[styles.statusPill, { backgroundColor: job.statusBg }]}>
                  <Text style={[styles.statusPillText, { color: job.statusColor }]}>{job.status}</Text>
                </View>
              </View>
              <Text style={styles.jobCategory}>{job.category}</Text>
              <View style={styles.jobLocationRow}>
                <MapPin size={13} color={Colors.slate} />
                <Text style={styles.jobLocation}>{job.location}</Text>
              </View>
              <View style={styles.jobMetaRow}>
                <View style={styles.jobMetaItem}>
                  <CalendarDays size={13} color={Colors.slate} />
                  <Text style={styles.jobMeta}>{job.date} · {job.time}</Text>
                </View>
              </View>
              <View style={styles.jobFooter}>
                <View style={styles.jobProviderRow}>
                  <UserRound size={13} color={Colors.muted} />
                  <Text style={styles.jobProvider}>{job.provider}</Text>
                </View>
                <Text style={styles.jobAmount}>{job.amount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* FAB - Create Job */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => onNavigate('Create Job')}
        activeOpacity={0.85}
      >
        <Plus size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.brandDark,
    paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 16,
  },
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Inter', marginBottom: 2 },
  headerTitle: { color: Colors.white, fontSize: 24, fontWeight: '800', fontFamily: 'Inter' },
  jobsBadge: {
    backgroundColor: Colors.brandTeal, borderRadius: 16,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  jobsBadgeText: { color: Colors.white, fontWeight: '700', fontSize: 13, fontFamily: 'Inter' },

  filterTabsContent: { gap: 8, paddingRight: 4 },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  filterTabActive: { backgroundColor: Colors.white },
  filterTabText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  filterTabTextActive: { color: Colors.brandDark },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 28, paddingBottom: 80 },

  jobCard: {
    backgroundColor: Colors.white, borderRadius: Radii.card,
    marginBottom: 14, flexDirection: 'row', overflow: 'hidden',
    ...Shadows.card,
  },
  jobBar: { width: 5, borderRadius: 0 },
  jobContent: { flex: 1, padding: 16 },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  jobTitle: { color: Colors.brandDark, fontSize: 15, fontWeight: '700', fontFamily: 'Inter', flex: 1, marginRight: 8 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter' },
  jobCategory: { color: Colors.brandTeal, fontSize: 12, fontWeight: '600', fontFamily: 'Inter', marginBottom: 4 },
  jobLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  jobLocation: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  jobMetaRow: { marginBottom: 10 },
  jobMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobMeta: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobProviderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobProvider: { color: Colors.muted, fontSize: 12, fontFamily: 'Inter' },
  jobAmount: { color: Colors.brandDark, fontSize: 18, fontWeight: '800', fontFamily: 'Inter' },

  fab: {
    position: 'absolute', bottom: 24, right: Spacing.screenH,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.brandTeal,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.brandTeal, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  fabText: { color: Colors.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
