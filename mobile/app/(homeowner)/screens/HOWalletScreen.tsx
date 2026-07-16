/**
 * HOWalletScreen.tsx
 *
 * Figma Source: "HO - Payment Transactions" (id: 46:958)
 *
 * Design:
 * - Teal hero with wallet balance prominently displayed
 * - Add Money / Send Money quick action buttons
 * - Transaction history list
 * - Voucher section
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

const TRANSACTIONS = [
  { id: '1', title: 'Home Deep Clean', type: 'debit', amount: '₱850', date: 'May 13, 2026', status: 'Completed', icon: '🧹' },
  { id: '2', title: 'Added via GCash', type: 'credit', amount: '+₱500', date: 'May 12, 2026', status: 'Successful', icon: '💳' },
  { id: '3', title: 'Office Cleaning', type: 'debit', amount: '₱685', date: 'May 10, 2026', status: 'In Progress', icon: '🏢' },
  { id: '4', title: 'Added via Maya', type: 'credit', amount: '+₱1,000', date: 'May 8, 2026', status: 'Successful', icon: '💰' },
  { id: '5', title: 'Airbnb Turnover', type: 'debit', amount: '₱895', date: 'May 7, 2026', status: 'Completed', icon: '🏠' },
];

interface HOWalletScreenProps {
  onBack?: () => void;
}

export default function HOWalletScreen({ onBack }: HOWalletScreenProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');

  const filtered = activeTab === 'all'
    ? TRANSACTIONS
    : TRANSACTIONS.filter((t) => t.type === activeTab);

  return (
    <View style={styles.screen}>
      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.heroTitle}>Wallet</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₱250.00</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
              <Text style={styles.quickActionIcon}>⬆️</Text>
              <Text style={styles.quickActionText}>Add Money</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
              <Text style={styles.quickActionIcon}>⬇️</Text>
              <Text style={styles.quickActionText}>Withdraw</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
              <Text style={styles.quickActionIcon}>🔄</Text>
              <Text style={styles.quickActionText}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Spent', value: '₱2,430', color: '#F59E0B' },
            { label: 'Added', value: '₱1,500', color: '#22C55E' },
            { label: 'Pending', value: '₱850', color: '#94A3B8' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Transaction list */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter tabs */}
        <View style={styles.tabRow}>
          {(['all', 'credit', 'debit'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === 'all' ? 'All' : t === 'credit' ? 'Added' : 'Spent'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>

        {filtered.map((txn) => (
          <View key={txn.id} style={styles.txnCard}>
            <View style={styles.txnIcon}>
              <Text style={styles.txnIconText}>{txn.icon}</Text>
            </View>
            <View style={styles.txnInfo}>
              <Text style={styles.txnTitle}>{txn.title}</Text>
              <Text style={styles.txnDate}>{txn.date} · {txn.status}</Text>
            </View>
            <Text style={[
              styles.txnAmount,
              txn.type === 'credit' ? styles.txnCredit : styles.txnDebit,
            ]}>
              {txn.type === 'debit' ? '-' : ''}{txn.amount}
            </Text>
          </View>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, marginBottom: 20,
  },
  heroTitle: { color: Colors.white, fontSize: 20, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '600' },

  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20,
    padding: 20, marginBottom: 16,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter', marginBottom: 4 },
  balanceAmount: { color: Colors.white, fontSize: 36, fontWeight: '800', fontFamily: 'Inter', marginBottom: 16 },
  quickActions: { flexDirection: 'row', alignItems: 'center' },
  quickActionBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  quickActionIcon: { fontSize: 22, marginBottom: 4 },
  quickActionText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', fontFamily: 'Inter' },
  actionDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },

  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', fontFamily: 'Inter', marginBottom: 2 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'Inter' },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(144,153,184,0.15)',
  },
  tabActive: { backgroundColor: Colors.brandDark },
  tabText: { color: Colors.muted, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  tabTextActive: { color: Colors.white },

  sectionTitle: { color: Colors.brandDark, fontSize: 16, fontWeight: '800', fontFamily: 'Inter', marginBottom: 14 },

  txnCard: {
    backgroundColor: Colors.white, borderRadius: Radii.card,
    padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    ...Shadows.card,
  },
  txnIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  txnIconText: { fontSize: 22 },
  txnInfo: { flex: 1 },
  txnTitle: { color: Colors.brandDark, fontSize: 14, fontWeight: '700', fontFamily: 'Inter', marginBottom: 2 },
  txnDate: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  txnAmount: { fontSize: 15, fontWeight: '800', fontFamily: 'Inter' },
  txnCredit: { color: '#22C55E' },
  txnDebit: { color: Colors.brandDark },
});
