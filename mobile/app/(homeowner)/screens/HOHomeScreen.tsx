/**
 * HOHomeScreen.tsx
 *
 * Figma Source: "HO - Main Dashboard" (id: 36:449)
 *
 * Design:
 * - Dark teal hero (264px) with greeting, wallet balance card
 * - Body: #F1F5F9 background
 * - "Book a Service" horizontal scroll of service cards
 * - "Active Jobs" list of job cards
 * - 5-tab bottom nav (see HOBottomNavBar)
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
  ArrowRight,
  Bell,
  BrushCleaning,
  MapPin,
  Package,
  Palette,
  Plus,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { HOScreen } from '../../../src/types/navigation';

const SERVICES = [
  { label: 'General\nCleaning', icon: BrushCleaning },
  { label: 'Painting', icon: Palette },
  { label: 'Deep\nCleaning', icon: Sparkles },
  { label: 'Moving', icon: Package },
  { label: 'Plumbing', icon: Wrench },
  { label: 'Electrical', icon: Zap },
];

const JOBS = [
  {
    title: 'Home Deep Clean',
    location: 'Brgy. Sabang, Lipa City, Batangas',
    amount: '₱850',
    status: 'Pending',
    statusColor: '#F59E0B',
    statusBg: '#FFF7ED',
    priority: 'High Priority',
    priorityBg: '#FEE2E2',
    priorityColor: '#EF4444',
    age: '45d ago',
  },
  {
    title: 'Office Cleaning',
    location: '1962 J.P. Laurel National High',
    amount: '₱685',
    status: 'In Progress',
    statusColor: '#22C55E',
    statusBg: '#F0FDF4',
    priority: 'Medium Priority',
    priorityBg: '#FEF9C3',
    priorityColor: '#CA8A04',
    age: '46d ago',
  },
];

interface HOHomeScreenProps {
  onNavigate: (screen: HOScreen) => void;
}

export default function HOHomeScreen({ onNavigate }: HOHomeScreenProps) {
  return (
    <View style={styles.screen}>
      {/* Hero Header */}
      <View style={styles.hero}>
        {/* Top row */}
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.userName}>Alex Chen</Text>
          </View>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => onNavigate('Notifications')}
              activeOpacity={0.8}
            >
              <Bell size={18} color={Colors.white} />
              <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>2</Text></View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => onNavigate('Profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>AC</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet card inside hero */}
        <View style={styles.walletCard}>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletAmount}>₱250.00</Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => onNavigate('Wallet')}
              activeOpacity={0.8}
            >
              <View style={styles.addBtnContent}>
                <Plus size={14} color={Colors.white} />
                <Text style={styles.addBtnText}>Add</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statusRow}>
            {[
              { dot: '#F59E0B', label: '1 pending' },
              { dot: '#22C55E', label: '1 active' },
              { dot: '#71C7FF', label: '2 done' },
            ].map((s) => (
              <View key={s.label} style={styles.statusChip}>
                <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
                <Text style={styles.statusText}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.locationRow}>
            <View style={styles.locationTextWrap}>
              <MapPin size={13} color={Colors.slate} />
              <Text style={styles.locationText}>Brgy. Sampaguita, ...</Text>
            </View>
            <Text style={styles.radiusText}>5 mi radius</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Book a Service */}
        <Text style={styles.sectionTitle}>Book a Service</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.servicesScroll}
          contentContainerStyle={styles.servicesContent}
        >
          {SERVICES.map((svc) => (
            <TouchableOpacity
              key={svc.label}
              style={styles.serviceCard}
              onPress={() => onNavigate('Create Job')}
              activeOpacity={0.85}
            >
              <svc.icon size={28} color={Colors.brandDark} />
              <Text style={styles.serviceLabel}>{svc.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Jobs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Jobs</Text>
          <TouchableOpacity onPress={() => onNavigate('My Jobs')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {JOBS.map((job) => (
          <TouchableOpacity
            key={job.title}
            style={styles.jobCard}
            onPress={() => onNavigate('Job Detail')}
            activeOpacity={0.9}
          >
            <View style={styles.jobCardHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={[styles.statusPill, { backgroundColor: job.statusBg }]}>
                <Text style={[styles.statusPillText, { color: job.statusColor }]}>{job.status}</Text>
              </View>
            </View>
            <View style={styles.jobLocationWrap}>
              <MapPin size={13} color={Colors.slate} />
              <Text style={styles.jobLocation}>{job.location}</Text>
            </View>
            <View style={styles.jobMetaRow}>
              <View style={[styles.priorityChip, { backgroundColor: job.priorityBg }]}>
                <Text style={[styles.priorityText, { color: job.priorityColor }]}>{job.priority}</Text>
              </View>
              <Text style={styles.ageText}>{job.age}</Text>
            </View>
            <View style={styles.jobFooter}>
              <Text style={styles.jobAmount}>{job.amount}</Text>
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
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  // Hero
  hero: {
    backgroundColor: Colors.brandDark,
    paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Inter', fontWeight: '500' },
  userName: { color: Colors.white, fontSize: 22, fontWeight: '800', fontFamily: 'Inter', marginTop: 2 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  notifBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.brandCyan,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 14, fontFamily: 'Inter' },

  // Wallet card (inside hero)
  walletCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    padding: 20,
    marginBottom: 0,
    ...Shadows.card,
  },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  walletLabel: { color: Colors.muted, fontSize: 13, fontFamily: 'Inter', marginBottom: 2 },
  walletAmount: { color: Colors.brandDark, fontSize: 32, fontWeight: '800', fontFamily: 'Inter' },
  addBtn: {
    backgroundColor: Colors.brandDark, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  addBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { color: Colors.white, fontWeight: '700', fontFamily: 'Inter', fontSize: 13 },

  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  statusChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },

  locationRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(144,153,184,0.2)', paddingTop: 12,
  },
  locationTextWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  radiusText: { color: Colors.brandTeal, fontSize: 12, fontWeight: '700', fontFamily: 'Inter' },

  // Body
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 24, paddingBottom: 20 },

  sectionTitle: { color: Colors.brandDark, fontSize: 18, fontWeight: '800', fontFamily: 'Inter', marginBottom: 14 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 24 },
  seeAll: { color: Colors.brandTeal, fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },

  servicesScroll: { marginBottom: 0 },
  servicesContent: { paddingRight: Spacing.screenH },
  serviceCard: {
    width: 100, height: 100, borderRadius: 20,
    marginRight: 12, padding: 14,
    backgroundColor: '#E8F5F9',
    justifyContent: 'space-between', alignItems: 'flex-start',
  },
  serviceLabel: { fontSize: 12, fontWeight: '700', color: Colors.brandDark, fontFamily: 'Inter', lineHeight: 16 },

  jobCard: {
    backgroundColor: Colors.white, borderRadius: Radii.card,
    padding: 18, marginBottom: 14, ...Shadows.card,
  },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobTitle: { color: Colors.brandDark, fontSize: 16, fontWeight: '700', fontFamily: 'Inter', flex: 1, marginRight: 10 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter' },
  jobLocationWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  jobLocation: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  jobMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  priorityChip: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  priorityText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter' },
  ageText: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobAmount: { color: Colors.brandDark, fontSize: 22, fontWeight: '800', fontFamily: 'Inter' },
  viewBtn: {
    backgroundColor: Colors.brandTeal, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  viewBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700', fontFamily: 'Inter' },
});
