/**
 * SPHomeScreen.tsx (SP - New Dashboard / SP - Main Dashboard)
 *
 * Figma Source: "SP - New Dashboard" (id: 305:819) and "SP - Main Dashboard" (id: 36:467)
 *
 * Design:
 * - Dark teal hero header with earnings overview
 * - Stats: Earnings, Rating, Jobs Done
 * - Available/Urgent jobs feed
 * - 5-tab bottom nav (handled by parent)
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  Star,
  Clock3,
  UserRound,
  CircleAlert,
  Wallet,
  RefreshCw,
} from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { SPScreen } from '../../../src/types/navigation';

const AVAILABLE_JOBS = [
  {
    id: '1',
    title: 'Kitchen Deep Clean',
    category: 'Deep Cleaning',
    location: 'Brgy. Sampaguita, Lipa City',
    budget: '₱850',
    time: '10:00 AM, May 20',
    postedBy: 'Alex C.',
    distance: '1.2 km',
    isUrgent: false,
    tags: ['Home', '3BR'],
  },
  {
    id: '2',
    title: 'Emergency Pipe Fix',
    category: 'Plumbing',
    location: 'Brgy. Sabang, Lipa City',
    budget: '₱1,200',
    time: 'ASAP',
    postedBy: 'Maria S.',
    distance: '2.5 km',
    isUrgent: true,
    tags: ['Urgent', 'Emergency'],
  },
  {
    id: '3',
    title: 'House Interior Paint',
    category: 'Painting',
    location: 'Brgy. Mataas na Lupa',
    budget: '₱3,500',
    time: 'May 22, Flexible',
    postedBy: 'Jose R.',
    distance: '3.8 km',
    isUrgent: false,
    tags: ['Interior', '4 days'],
  },
];

interface SPHomeScreenProps {
  onNavigate: (screen: SPScreen) => void;
}

export default function SPHomeScreen({ onNavigate }: SPHomeScreenProps) {
  return (
    <View style={styles.screen}>
      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.providerName}>Juan dela Cruz</Text>
          </View>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => onNavigate('Notifications')}
              activeOpacity={0.8}
            >
              <Bell size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => onNavigate('Profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>JD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsRow}>
            <View>
              <Text style={styles.earningsLabel}>Total Earnings</Text>
              <Text style={styles.earningsAmount}>₱12,450</Text>
            </View>
            <TouchableOpacity
              style={styles.walletBtn}
              onPress={() => onNavigate('Wallet')}
              activeOpacity={0.8}
            >
              <View style={styles.walletBtnContent}>
                <Wallet size={14} color={Colors.white} />
                <Text style={styles.walletBtnText}>Wallet</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Jobs Done', value: '47', icon: CheckCircle2 },
              { label: 'Rating', value: '4.8', icon: Star },
              { label: 'Active', value: '2', icon: RefreshCw },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <View key={s.label} style={styles.statItem}>
                  <Icon size={18} color={Colors.white} />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Status / availability toggle */}
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Available for Jobs</Text>
          <View style={styles.statusToggleTrack}>
            <View style={styles.statusToggleThumb} />
          </View>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search radius */}
        <View style={styles.locationRow}>
          <View style={styles.locationTextRow}>
            <MapPin size={14} color={Colors.brandTeal} />
            <Text style={styles.locationText}>Lipa City, Batangas</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.radiusText}>5 km radius ›</Text>
          </TouchableOpacity>
        </View>

        {/* Available jobs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Available Jobs</Text>
          <TouchableOpacity onPress={() => onNavigate('My Jobs')} activeOpacity={0.8}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {AVAILABLE_JOBS.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            onPress={() => onNavigate(job.isUrgent ? 'Urgent Job' : 'Job Detail')}
            activeOpacity={0.9}
          >
            {job.isUrgent && (
              <View style={styles.urgentBanner}>
                <CircleAlert size={14} color={Colors.error} />
                <Text style={styles.urgentBannerText}>URGENT JOB</Text>
              </View>
            )}
            <View style={styles.jobCardHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobBudget}>{job.budget}</Text>
            </View>
            <Text style={styles.jobCategory}>{job.category}</Text>
            <View style={styles.jobInfoRow}>
              <View style={styles.metaItem}>
                <MapPin size={14} color={Colors.brandTeal} />
                <Text style={styles.jobInfo}>{job.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock3 size={14} color={Colors.brandTeal} />
                <Text style={styles.jobInfo}>{job.time}</Text>
              </View>
            </View>
            <View style={styles.jobMetaRow}>
              <View style={styles.metaItem}>
                <UserRound size={14} color={Colors.brandTeal} />
                <Text style={styles.jobPoster}>{job.postedBy}</Text>
              </View>
              <View style={styles.metaItem}>
                <BriefcaseBusiness size={14} color={Colors.brandTeal} />
                <Text style={styles.jobDistance}>{job.distance}</Text>
              </View>
            </View>
            <View style={styles.tagsRow}>
              {job.tags.map((tag) => (
                <View key={tag} style={[styles.tag, job.isUrgent && styles.tagUrgent]}>
                  <Text style={[styles.tagText, job.isUrgent && styles.tagTextUrgent]}>{tag}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.claimBtn, job.isUrgent && styles.claimBtnUrgent]}
              onPress={() => onNavigate(job.isUrgent ? 'Urgent Job' : 'Job Detail')}
              activeOpacity={0.85}
            >
              <Text style={styles.claimBtnText}>
                {job.isUrgent ? `Claim Urgent Job — ${job.budget}` : 'View Details'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  hero: {
    backgroundColor: Colors.brandDark,
    paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, paddingBottom: 16,
  },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter', fontWeight: '500' },
  providerName: { color: Colors.white, fontSize: 20, fontWeight: '800', fontFamily: 'Inter', marginTop: 2 },
  heroActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  notifBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.brandCyan, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '800', fontSize: 14, fontFamily: 'Inter' },

  earningsCard: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, marginBottom: 12,
  },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  earningsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter', marginBottom: 2 },
  earningsAmount: { color: Colors.white, fontSize: 30, fontWeight: '800', fontFamily: 'Inter' },
  walletBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  walletBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 2 },
  statIcon: { fontSize: 18 },
  statValue: { color: Colors.white, fontSize: 18, fontWeight: '800', fontFamily: 'Inter' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Inter' },

  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
    marginBottom: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  statusText: { flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  statusToggleTrack: {
    width: 44, height: 26, borderRadius: 13, backgroundColor: Colors.brandTeal,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  statusToggleThumb: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.white, alignSelf: 'flex-end',
  },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },

  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  locationText: { color: Colors.slate, fontSize: 13, fontFamily: 'Inter' },
  radiusText: { color: Colors.brandTeal, fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: Colors.brandDark, fontSize: 18, fontWeight: '800', fontFamily: 'Inter' },
  seeAll: { color: Colors.brandTeal, fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },

  jobCard: {
    backgroundColor: Colors.white, borderRadius: Radii.card,
    padding: 16, marginBottom: 14, ...Shadows.card, overflow: 'hidden',
  },
  urgentBanner: {
    backgroundColor: '#FEE2E2', marginHorizontal: -16, marginTop: -16,
    paddingVertical: 6, paddingHorizontal: 16, marginBottom: 12,
  },
  urgentBannerText: { color: '#EF4444', fontSize: 12, fontWeight: '800', fontFamily: 'Inter' },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  jobTitle: { color: Colors.brandDark, fontSize: 15, fontWeight: '700', fontFamily: 'Inter', flex: 1 },
  jobBudget: { color: Colors.brandTeal, fontSize: 16, fontWeight: '800', fontFamily: 'Inter' },
  jobCategory: { color: Colors.muted, fontSize: 12, fontWeight: '600', fontFamily: 'Inter', marginBottom: 8 },
  jobInfoRow: { marginBottom: 6, gap: 4 },
  jobInfo: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  jobMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  jobPoster: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  jobDistance: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tag: { backgroundColor: Colors.backgroundAlt, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagUrgent: { backgroundColor: '#FEE2E2' },
  tagText: { color: Colors.slate, fontSize: 11, fontWeight: '600', fontFamily: 'Inter' },
  tagTextUrgent: { color: '#EF4444' },
  claimBtn: {
    backgroundColor: Colors.brandTeal, borderRadius: 14, padding: 12, alignItems: 'center',
  },
  claimBtnUrgent: { backgroundColor: '#EF4444' },
  claimBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },
});
