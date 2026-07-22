/**
 * SPNotificationsScreen.tsx
 *
 * Figma Source: "SP - Notifications" (id: 46:1012)
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, BriefcaseBusiness, CircleCheckBig, MessageCircle, Star } from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';

const NOTIFICATIONS = [
  { id: '1', icon: '🆕', iconBg: '#EFF6FF', title: 'New Job Available', message: 'A Deep Cleaning job was posted near you — ₱1,200. Check it out now!', time: '5 mins ago', read: false, date: 'Today' },
  { id: '2', icon: '✅', iconBg: '#F0FDF4', title: 'Payment Received', message: '₱750 has been credited to your wallet for Kitchen Cleaning.', time: '1 hour ago', read: false, date: 'Today' },
  { id: '3', icon: '⭐', iconBg: '#FFFBEB', title: 'New Review', message: 'Alex Chen left you a 5-star review: "Excellent work, very thorough!"', time: '3 hours ago', read: true, date: 'Today' },
  { id: '4', icon: '🚨', iconBg: '#FFF5F5', title: 'Urgent Job Posted', message: 'Emergency plumbing repair — ₱1,200 in Brgy. Sabang. Claim now!', time: 'Yesterday', read: true, date: 'Yesterday' },
  { id: '5', icon: '💬', iconBg: '#F5F3FF', title: 'New Message', message: 'Maria Santos: "Can you start an hour earlier?"', time: 'Yesterday', read: true, date: 'Yesterday' },
];

interface SPNotificationsScreenProps {
  onBack: () => void;
}

export default function SPNotificationsScreen({ onBack }: SPNotificationsScreenProps) {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));

  const groups: Record<string, typeof NOTIFICATIONS> = {};
  notifs.forEach((n) => { if (!groups[n.date]) groups[n.date] = []; groups[n.date].push(n); });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unread > 0
            ? <TouchableOpacity onPress={markAllRead}><Text style={styles.markAll}>Mark all read</Text></TouchableOpacity>
            : <View style={{ width: 80 }} />}
        </View>
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unread} unread</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {Object.entries(groups).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.dateLabel}>{date}</Text>
            {items.map((n) => (
              <NotificationCard key={n.id} notification={n} onPress={() => setNotifs((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x))} />
            ))}
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.brandDark, paddingTop: Sizes.statusBarHeight, paddingHorizontal: Spacing.screenH, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 10 },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '600' },
  markAll: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  unreadBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  unreadText: { color: Colors.white, fontSize: 12, fontWeight: '600', fontFamily: 'Inter' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },
  dateLabel: { color: Colors.muted, fontSize: 12, fontWeight: '700', fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', ...Shadows.card },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: Colors.brandTeal },
  iconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconText: { fontSize: 22 },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { color: Colors.brandDark, fontSize: 14, fontWeight: '700', fontFamily: 'Inter', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brandTeal, marginLeft: 8 },
  message: { color: Colors.slate, fontSize: 13, fontFamily: 'Inter', lineHeight: 19, marginBottom: 6 },
  time: { color: Colors.muted, fontSize: 11, fontFamily: 'Inter' },
});

function NotificationCard({ notification: n, onPress }: { notification: typeof NOTIFICATIONS[number]; onPress: () => void }) {
  const Icon = [BriefcaseBusiness, CircleCheckBig, Star, AlertTriangle, MessageCircle][Number(n.id) - 1];

  return (
    <TouchableOpacity style={[styles.card, !n.read && styles.cardUnread]} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: n.iconBg }]}>
        <Icon size={22} color={Colors.brandTeal} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{n.title}</Text>
          {!n.read && <View style={styles.dot} />}
        </View>
        <Text style={styles.message}>{n.message}</Text>
        <Text style={styles.time}>{n.time}</Text>
      </View>
    </TouchableOpacity>
  );
}
