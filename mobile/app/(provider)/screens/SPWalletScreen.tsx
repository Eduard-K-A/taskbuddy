/**
 * SPWalletScreen.tsx
 *
 * Figma Source: "SP - Wallet" (id: 46:994) and "SP - Payment Transactions" (id: 234:732)
 */

import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, ArrowDownToLine, ArrowRightLeft, BarChart3, Building2, Sparkles } from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { useAsyncData } from '../../../src/hooks/useAsyncData';
import { api } from '../../../src/lib/api';
import { peso, shortDate } from '../../../src/lib/format';

interface SPWalletScreenProps {
  onBack?: () => void;
}

export default function SPWalletScreen({ onBack }: SPWalletScreenProps) {
  const { data, loading, error } = useAsyncData(() => api.wallet(), []);
  const transactions = data?.transactions ?? [];

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
              <ArrowLeft size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
          <Text style={styles.heroTitle}>Wallet</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{data ? peso(data.balance) : '—'}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <ArrowDownToLine size={18} color={Colors.white} />
              <Text style={styles.actionText}>Withdraw</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <ArrowRightLeft size={18} color={Colors.white} />
              <Text style={styles.actionText}>Transfer</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <BarChart3 size={18} color={Colors.white} />
              <Text style={styles.actionText}>Statement</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statsRow}>
          {[
            { label: 'Earned', value: peso(data?.total_credited ?? 0), color: '#22C55E' },
            { label: 'Paid Out', value: peso(data?.total_debited ?? 0), color: '#F59E0B' },
            { label: 'Pending', value: peso(data?.pending ?? 0), color: '#94A3B8' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {loading && <ActivityIndicator style={{ marginTop: 20 }} color={Colors.brandTeal} />}
        {!!error && !loading && <Text style={styles.stateText}>{error}</Text>}
        {!loading && !error && transactions.length === 0 && (
          <Text style={styles.stateText}>No transactions yet.</Text>
        )}
        {transactions.map((txn) => {
          const Icon = txn.direction === 'credit' ? Sparkles : Building2;
          const statusLabel = txn.status.charAt(0).toUpperCase() + txn.status.slice(1);
          return (
            <View key={txn.id} style={styles.txnCard}>
              <View style={styles.txnIcon}><Icon size={18} color={Colors.brandTeal} /></View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnTitle}>{txn.title}</Text>
                <Text style={styles.txnDate}>{shortDate(txn.created_at)} · {statusLabel}</Text>
              </View>
              <Text style={[styles.txnAmount, txn.direction === 'credit' ? styles.txnCredit : styles.txnDebit]}>
                {txn.direction === 'debit' ? '-' : '+'}{peso(txn.amount)}
              </Text>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  hero: { backgroundColor: Colors.brandDark, paddingTop: Sizes.statusBarHeight, paddingHorizontal: Spacing.screenH, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 20 },
  heroTitle: { color: Colors.white, fontSize: 20, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '600' },
  balanceCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 20, marginBottom: 16 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter', marginBottom: 4 },
  balanceAmount: { color: Colors.white, fontSize: 36, fontWeight: '800', fontFamily: 'Inter', marginBottom: 16 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', fontFamily: 'Inter' },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '800', fontFamily: 'Inter', marginBottom: 2 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'Inter' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },
  sectionTitle: { color: Colors.brandDark, fontSize: 16, fontWeight: '800', fontFamily: 'Inter', marginBottom: 14 },
  stateText: { color: Colors.slate, fontSize: 14, fontFamily: 'Inter', textAlign: 'center', marginTop: 20 },
  txnCard: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', ...Shadows.card },
  txnIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txnIconText: { fontSize: 22 },
  txnInfo: { flex: 1 },
  txnTitle: { color: Colors.brandDark, fontSize: 14, fontWeight: '700', fontFamily: 'Inter', marginBottom: 2 },
  txnDate: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  txnAmount: { fontSize: 15, fontWeight: '800', fontFamily: 'Inter' },
  txnCredit: { color: '#22C55E' },
  txnDebit: { color: Colors.error },
});
