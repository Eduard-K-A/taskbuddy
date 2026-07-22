/**
 * SPJobDetailScreen.tsx
 *
 * Figma Source: "SP - Accepted Job Details" (id: 234:714)
 * Also covers: "SP - Urgent Posted Job Detail Screen" (id: 46:1084) via isUrgent prop
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, ArrowLeft, CalendarDays, Clock3, FileText, Map, MapPin, MessageCircle, MoreVertical, Star, Wrench, Zap } from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { SPScreen } from '../../../src/types/navigation';

interface SPJobDetailScreenProps {
  onBack: () => void;
  onNavigate: (screen: SPScreen) => void;
  isUrgent?: boolean;
}

export default function SPJobDetailScreen({ onBack, onNavigate, isUrgent = false }: SPJobDetailScreenProps) {
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <ArrowLeft size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <TouchableOpacity style={styles.moreBtn} activeOpacity={0.8}>
            <MoreVertical size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.jobOverview}>
          {isUrgent && (
            <View style={styles.urgentTag}>
              <View style={styles.urgentTagContent}>
                <AlertTriangle size={14} color={Colors.error} />
                <Text style={styles.urgentTagText}>URGENT</Text>
              </View>
            </View>
          )}
          <Text style={styles.jobTitle}>{isUrgent ? 'Emergency Pipe Fix' : 'Kitchen Deep Clean'}</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.jobBudget}>{isUrgent ? '₱1,200' : '₱850'}</Text>
            <Text style={styles.budgetLabel}>budget</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {/* Client info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Posted by</Text>
          <View style={styles.clientRow}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientAvatarText}>AC</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>Alex Chen</Text>
              <View style={styles.clientRatingRow}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.clientRating}>4.7 · 12 jobs posted</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => onNavigate('Chat')}
              activeOpacity={0.8}
            >
              <View style={styles.chatBtnContent}>
                <MessageCircle size={15} color={Colors.white} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Details</Text>
          {[
            { icon: Wrench, label: 'Service Type', value: isUrgent ? 'Plumbing / Emergency' : 'Deep Cleaning' },
            { icon: MapPin, label: 'Location', value: isUrgent ? 'Brgy. Sabang, Lipa City, Batangas' : 'Brgy. Sampaguita, Lipa City, Batangas' },
            { icon: CalendarDays, label: 'Date', value: isUrgent ? 'Today — ASAP' : 'May 20, 2026' },
            { icon: Clock3, label: 'Time', value: isUrgent ? 'Immediately' : '10:00 AM' },
            { icon: FileText, label: 'Description', value: isUrgent ? 'Burst pipe under the kitchen sink — water flooding. Need urgent plumber.' : '3-bedroom apartment full deep clean. Include bathroom, kitchen, and all rooms.' },
          ].map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <item.icon size={18} color={Colors.brandTeal} />
              <View style={styles.detailBody}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Earnings</Text>
          {[
            { label: 'Job Budget', value: isUrgent ? '₱1,200' : '₱850' },
            { label: 'Platform Fee (8%)', value: isUrgent ? '-₱96' : '-₱68' },
          ].map((item) => (
            <View key={item.label} style={styles.payRow}>
              <Text style={styles.payLabel}>{item.label}</Text>
              <Text style={styles.payValue}>{item.value}</Text>
            </View>
          ))}
          <View style={[styles.payRow, styles.payTotalRow]}>
            <Text style={styles.payTotalLabel}>You receive</Text>
            <Text style={styles.payTotalValue}>{isUrgent ? '₱1,104' : '₱782'}</Text>
          </View>
        </View>

        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <Map size={28} color={Colors.brandTeal} />
          <Text style={styles.mapText}>View on Map</Text>
        </View>

        {/* CTA */}
        {isUrgent ? (
          <TouchableOpacity style={styles.urgentClaimBtn} activeOpacity={0.85}>
              <View style={styles.urgentClaimContent}>
                <Zap size={17} color={Colors.white} fill={Colors.white} />
                <Text style={styles.urgentClaimText}>Claim Urgent Job — {isUrgent ? '₱1,200' : '₱850'}</Text>
              </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.acceptRow}>
            <TouchableOpacity style={styles.declineBtn} activeOpacity={0.85}>
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85}>
              <Text style={styles.acceptBtnText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.brandDark, paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH, paddingBottom: 24,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 16 },
  headerTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  jobOverview: { gap: 6 },
  urgentTag: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  urgentTagContent: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  urgentTagText: { color: '#EF4444', fontSize: 12, fontWeight: '800', fontFamily: 'Inter' },
  jobTitle: { color: Colors.white, fontSize: 22, fontWeight: '800', fontFamily: 'Inter' },
  budgetRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  jobBudget: { color: Colors.brandCyan, fontSize: 28, fontWeight: '800', fontFamily: 'Inter' },
  budgetLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'Inter' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },
  card: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 18, marginBottom: 14, ...Shadows.card },
  cardTitle: { color: Colors.brandDark, fontSize: 15, fontWeight: '800', fontFamily: 'Inter', marginBottom: 14 },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clientAvatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.brandCyan, alignItems: 'center', justifyContent: 'center' },
  clientAvatarText: { color: Colors.white, fontSize: 16, fontWeight: '800', fontFamily: 'Inter' },
  clientInfo: { flex: 1 },
  clientName: { color: Colors.brandDark, fontSize: 15, fontWeight: '700', fontFamily: 'Inter', marginBottom: 2 },
  clientRating: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  clientRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chatBtn: { backgroundColor: Colors.brandTeal, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  chatBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chatBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700', fontFamily: 'Inter' },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  detailBody: { flex: 1 },
  detailLabel: { color: Colors.muted, fontSize: 11, fontWeight: '600', fontFamily: 'Inter', marginBottom: 2 },
  detailValue: { color: Colors.brandDark, fontSize: 14, fontFamily: 'Inter', lineHeight: 20 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(144,153,184,0.15)' },
  payLabel: { color: Colors.slate, fontSize: 13, fontFamily: 'Inter' },
  payValue: { color: Colors.brandDark, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  payTotalRow: { borderBottomWidth: 0, marginTop: 4 },
  payTotalLabel: { color: Colors.brandDark, fontSize: 15, fontWeight: '800', fontFamily: 'Inter' },
  payTotalValue: { color: '#22C55E', fontSize: 20, fontWeight: '800', fontFamily: 'Inter' },
  mapPlaceholder: { backgroundColor: Colors.white, borderRadius: Radii.card, height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 14, ...Shadows.card, gap: 6, flexDirection: 'row' },
  mapText: { color: Colors.brandTeal, fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
  acceptRow: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, borderWidth: 1, borderColor: Colors.muted, borderRadius: 24, padding: 15, alignItems: 'center' },
  declineBtnText: { color: Colors.muted, fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
  acceptBtn: { flex: 2, backgroundColor: Colors.brandTeal, borderRadius: 24, padding: 15, alignItems: 'center', shadowColor: Colors.brandTeal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  acceptBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
  urgentClaimBtn: { backgroundColor: '#EF4444', borderRadius: 24, padding: 15, alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  urgentClaimContent: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  urgentClaimText: { color: Colors.white, fontSize: 15, fontWeight: '800', fontFamily: 'Inter' },
});
