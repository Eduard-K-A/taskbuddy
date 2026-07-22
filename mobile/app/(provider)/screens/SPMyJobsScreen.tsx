/**
 * SPMyJobsScreen.tsx
 *
 * Figma Source: "SP - My Jobs" (id: 46:976)
 *
 * Design:
 * - Teal header with job count
 * - Filter tabs: All, Active, Upcoming, Completed
 * - Job cards with accept/view actions
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowRight, CalendarDays, MapPin, MessageCircle } from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { SPScreen } from '../../../src/types/navigation';

const FILTERS = ['All', 'Active', 'Upcoming', 'Completed'];

const JOBS = [
  {
    id: '1', title: 'Kitchen Cleaning', category: 'General Cleaning',
    location: 'Brgy. Sampaguita, Lipa City', amount: '₱750',
    date: 'May 13, 2026', time: '1:00 PM',
    status: 'Active', statusColor: '#22C55E', statusBg: '#F0FDF4',
    client: 'Alex Chen', clientAvatar: 'AC',
  },
  {
    id: '2', title: 'Garden Maintenance', category: 'Landscaping',
    location: 'Brgy. Sabang, Lipa City', amount: '₱500',
    date: 'May 13, 2026', time: '3:00 PM',
    status: 'Active', statusColor: '#22C55E', statusBg: '#F0FDF4',
    client: 'Maria Santos', clientAvatar: 'MS',
  },
  {
    id: '3', title: 'House Painting', category: 'Painting',
    location: 'Brgy. Tambo, Lipa City', amount: '₱3,500',
    date: 'May 18, 2026', time: '8:00 AM',
    status: 'Upcoming', statusColor: '#3B82F6', statusBg: '#EFF6FF',
    client: 'Jose Reyes', clientAvatar: 'JR',
  },
  {
    id: '4', title: 'Deep Cleaning', category: 'Deep Cleaning',
    location: 'Brgy. Mataas na Lupa', amount: '₱1,200',
    date: 'May 5, 2026', time: '9:00 AM',
    status: 'Completed', statusColor: '#6B7280', statusBg: '#F3F4F6',
    client: 'Rosa Villa', clientAvatar: 'RV',
  },
];

interface SPMyJobsScreenProps {
  onNavigate: (screen: SPScreen) => void;
}

export default function SPMyJobsScreen({ onNavigate }: SPMyJobsScreenProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? JOBS
    : JOBS.filter((j) => j.status === activeFilter);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerSub}>Provider · Jobs</Text>
            <Text style={styles.headerTitle}>My Jobs</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{JOBS.length} jobs</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
            <View style={styles.jobHeader}>
              <View style={styles.jobClientRow}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>{job.clientAvatar}</Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{job.client}</Text>
                  <Text style={styles.jobCategory}>{job.category}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: job.statusBg }]}>
                  <Text style={[styles.statusPillText, { color: job.statusColor }]}>{job.status}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.jobDetails}>
              <View style={styles.jobDetailRow}>
                <MapPin size={14} color={Colors.brandTeal} />
                <Text style={styles.jobDetail}>{job.location}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <CalendarDays size={14} color={Colors.brandTeal} />
                <Text style={styles.jobDetail}>{job.date} · {job.time}</Text>
              </View>
            </View>
            <View style={styles.jobFooter}>
              <Text style={styles.jobAmount}>{job.amount}</Text>
              <View style={styles.jobActions}>
                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => onNavigate('Chat')}
                  activeOpacity={0.8}
                >
                  <MessageCircle size={18} color={Colors.brandTeal} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => onNavigate('Job Detail')}
                  activeOpacity={0.8}
                >
                  <View style={styles.viewBtnContent}>
                    <Text style={styles.viewBtnText}>View Job</Text>
                    <ArrowRight size={14} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.brandDark, paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH, paddingBottom: 16,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 14 },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Inter', marginBottom: 2 },
  headerTitle: { color: Colors.white, fontSize: 24, fontWeight: '800', fontFamily: 'Inter' },
  countBadge: { backgroundColor: Colors.brandTeal, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 14 },
  countBadgeText: { color: Colors.white, fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },
  filtersContent: { gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' },
  filterTabActive: { backgroundColor: Colors.white },
  filterText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  filterTextActive: { color: Colors.brandDark },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },
  jobCard: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 16, marginBottom: 14, ...Shadows.card },
  jobHeader: { marginBottom: 10 },
  jobClientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clientAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brandCyan, alignItems: 'center', justifyContent: 'center' },
  clientAvatarText: { color: Colors.white, fontSize: 14, fontWeight: '800', fontFamily: 'Inter' },
  clientInfo: { flex: 1 },
  clientName: { color: Colors.brandDark, fontSize: 14, fontWeight: '700', fontFamily: 'Inter', marginBottom: 1 },
  jobCategory: { color: Colors.muted, fontSize: 12, fontFamily: 'Inter' },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter' },
  jobTitle: { color: Colors.brandDark, fontSize: 16, fontWeight: '800', fontFamily: 'Inter', marginBottom: 8 },
  jobDetails: { gap: 4, marginBottom: 12 },
  jobDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jobDetail: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobAmount: { color: Colors.brandTeal, fontSize: 20, fontWeight: '800', fontFamily: 'Inter' },
  jobActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chatBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' },
  viewBtn: { backgroundColor: Colors.brandTeal, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  viewBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  viewBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700', fontFamily: 'Inter' },
});
