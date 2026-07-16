/**
 * HOJobDetailScreen.tsx
 *
 * Figma Source: "HO - My Jobs Details" (id: 46:832)
 *
 * Design:
 * - Teal header with job title and status
 * - Provider info card with rating and chat button
 * - Job details (location, date, time, service type)
 * - Payment breakdown
 * - Action buttons: Chat, Cancel, Dispute
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/designTokens';
import { HOScreen } from '../../../src/types/navigation';

interface HOJobDetailScreenProps {
  onBack: () => void;
  onNavigate: (screen: HOScreen) => void;
}

export default function HOJobDetailScreen({ onBack, onNavigate }: HOJobDetailScreenProps) {
  const [showDispute, setShowDispute] = useState(false);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <TouchableOpacity style={styles.moreBtn} activeOpacity={0.8}>
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Job overview */}
        <View style={styles.jobOverview}>
          <Text style={styles.jobTitle}>Home Deep Clean</Text>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>In Progress</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Provider card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Provider</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>JD</Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>Juan dela Cruz</Text>
              <Text style={styles.providerRating}>⭐ 4.8 · 47 jobs completed</Text>
            </View>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => onNavigate('Chat')}
              activeOpacity={0.8}
            >
              <Text style={styles.chatBtnIcon}>💬</Text>
              <Text style={styles.chatBtnText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Details</Text>
          {[
            { icon: '🔧', label: 'Service', value: 'Deep Cleaning' },
            { icon: '📍', label: 'Location', value: 'Brgy. Sabang, Lipa City, Batangas' },
            { icon: '📅', label: 'Date', value: 'May 13, 2026' },
            { icon: '🕙', label: 'Time', value: '10:00 AM' },
            { icon: '📝', label: 'Description', value: '3-bedroom apartment, full deep clean including bathroom and kitchen' },
          ].map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <Text style={styles.detailIcon}>{item.icon}</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          {[
            { label: 'Service Fee', value: '₱800' },
            { label: 'Platform Fee (5%)', value: '₱40' },
            { label: 'Voucher Applied', value: '-₱0' },
          ].map((item) => (
            <View key={item.label} style={styles.payRow}>
              <Text style={styles.payLabel}>{item.label}</Text>
              <Text style={styles.payValue}>{item.value}</Text>
            </View>
          ))}
          <View style={[styles.payRow, styles.payTotal]}>
            <Text style={styles.payTotalLabel}>Total</Text>
            <Text style={styles.payTotalValue}>₱840</Text>
          </View>
          <View style={styles.escrowNote}>
            <Text style={styles.escrowIcon}>🔒</Text>
            <Text style={styles.escrowText}>Payment held in escrow until job completion</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          {[
            { label: 'Job Posted', date: 'May 10, 2026', done: true },
            { label: 'Provider Accepted', date: 'May 11, 2026', done: true },
            { label: 'In Progress', date: 'May 13, 2026', done: true },
            { label: 'Completed', date: '—', done: false },
            { label: 'Payment Released', date: '—', done: false },
          ].map((item, i) => (
            <View key={item.label} style={styles.timelineRow}>
              <View style={[styles.timelineDot, item.done && styles.timelineDotDone]} />
              {i < 4 && <View style={[styles.timelineLine, item.done && styles.timelineLineDone]} />}
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, item.done && styles.timelineLabelDone]}>{item.label}</Text>
                <Text style={styles.timelineDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.chatFullBtn}
          onPress={() => onNavigate('Chat')}
          activeOpacity={0.85}
        >
          <Text style={styles.chatFullBtnText}>💬 Open Chat with Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.disputeBtn}
          onPress={() => setShowDispute(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.disputeBtnText}>⚠️ File a Dispute</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.brandDark,
    paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, marginBottom: 16,
  },
  headerTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '600' },
  moreBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  moreIcon: { color: Colors.white, fontSize: 18 },

  jobOverview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { color: Colors.white, fontSize: 20, fontWeight: '800', fontFamily: 'Inter', flex: 1 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  statusText: { color: '#22C55E', fontSize: 12, fontWeight: '700', fontFamily: 'Inter' },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },

  card: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 18, marginBottom: 14, ...Shadows.card },
  cardTitle: { color: Colors.brandDark, fontSize: 15, fontWeight: '800', fontFamily: 'Inter', marginBottom: 14 },

  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  providerAvatar: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.brandCyan, alignItems: 'center', justifyContent: 'center',
  },
  providerAvatarText: { color: Colors.white, fontSize: 16, fontWeight: '800', fontFamily: 'Inter' },
  providerInfo: { flex: 1 },
  providerName: { color: Colors.brandDark, fontSize: 15, fontWeight: '700', fontFamily: 'Inter', marginBottom: 2 },
  providerRating: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  chatBtn: {
    backgroundColor: Colors.brandTeal, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', gap: 2,
  },
  chatBtnIcon: { fontSize: 16 },
  chatBtnText: { color: Colors.white, fontSize: 11, fontWeight: '700', fontFamily: 'Inter' },

  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  detailIcon: { fontSize: 18, width: 24 },
  detailContent: { flex: 1 },
  detailLabel: { color: Colors.muted, fontSize: 11, fontWeight: '600', fontFamily: 'Inter', marginBottom: 2 },
  detailValue: { color: Colors.brandDark, fontSize: 14, fontFamily: 'Inter', lineHeight: 20 },

  payRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(144,153,184,0.15)' },
  payLabel: { color: Colors.slate, fontSize: 13, fontFamily: 'Inter' },
  payValue: { color: Colors.brandDark, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  payTotal: { borderBottomWidth: 0, marginTop: 4 },
  payTotalLabel: { color: Colors.brandDark, fontSize: 15, fontWeight: '800', fontFamily: 'Inter' },
  payTotalValue: { color: Colors.brandDark, fontSize: 18, fontWeight: '800', fontFamily: 'Inter' },
  escrowNote: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8, backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10 },
  escrowIcon: { fontSize: 16 },
  escrowText: { color: '#22C55E', fontSize: 12, fontFamily: 'Inter', flex: 1 },

  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, position: 'relative' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: 'rgba(144,153,184,0.4)', backgroundColor: Colors.white, marginTop: 2, marginRight: 12 },
  timelineDotDone: { backgroundColor: Colors.brandTeal, borderColor: Colors.brandTeal },
  timelineLine: { position: 'absolute', left: 6, top: 16, width: 2, height: 28, backgroundColor: 'rgba(144,153,184,0.3)' },
  timelineLineDone: { backgroundColor: Colors.brandTeal },
  timelineContent: { flex: 1 },
  timelineLabel: { color: Colors.muted, fontSize: 13, fontWeight: '600', fontFamily: 'Inter', marginBottom: 1 },
  timelineLabelDone: { color: Colors.brandDark },
  timelineDate: { color: Colors.muted, fontSize: 11, fontFamily: 'Inter' },

  chatFullBtn: {
    backgroundColor: Colors.brandTeal, borderRadius: 24, padding: 15,
    alignItems: 'center', marginBottom: 10,
    shadowColor: Colors.brandTeal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  chatFullBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
  disputeBtn: {
    borderWidth: 1, borderColor: '#EF4444', borderRadius: 24, padding: 15,
    alignItems: 'center', marginBottom: 10,
  },
  disputeBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
});
