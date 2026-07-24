/**
 * SPNotificationsScreen.tsx
 *
 * Figma Source: "SP - Notifications" (id: 46:1012)
 */

import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, BriefcaseBusiness, CircleCheckBig } from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { useAsyncData } from '../../../src/hooks/useAsyncData';
import { api } from '../../../src/lib/api';
import { dateBucket, timeAgo } from '../../../src/lib/format';

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

const ICON_BY_TYPE: Record<string, { icon: typeof BriefcaseBusiness; bg: string }> = {
  recommendation_invite: { icon: BriefcaseBusiness, bg: '#EFF6FF' },
  application_update: { icon: CircleCheckBig, bg: '#F0FDF4' },
  job_update: { icon: AlertTriangle, bg: '#FFF5F5' },
};

interface SPNotificationsScreenProps {
  onBack: () => void;
}

export default function SPNotificationsScreen({ onBack }: SPNotificationsScreenProps) {
  const { data, loading, error, reload } = useAsyncData(
    () => api.notifications() as Promise<NotificationRow[]>,
    [],
  );
  const notifs = data ?? [];
  const unread = notifs.filter((n) => !n.read_at).length;

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    reload();
  };
  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    reload();
  };

  const groups: Record<string, NotificationRow[]> = {};
  notifs.forEach((n) => {
    const bucket = dateBucket(n.created_at);
    if (!groups[bucket]) groups[bucket] = [];
    groups[bucket].push(n);
  });

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
        {loading && <ActivityIndicator style={{ marginTop: 20 }} color={Colors.brandTeal} />}
        {!!error && !loading && <Text style={styles.stateText}>{error}</Text>}
        {!loading && !error && notifs.length === 0 && (
          <Text style={styles.stateText}>You have no notifications yet.</Text>
        )}
        {Object.entries(groups).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.dateLabel}>{date}</Text>
            {items.map((n) => (
              <NotificationCard key={n.id} notification={n} onPress={() => !n.read_at && markRead(n.id)} />
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
  stateText: { color: Colors.slate, fontSize: 14, fontFamily: 'Inter', textAlign: 'center', marginTop: 30 },
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

function NotificationCard({ notification: n, onPress }: { notification: NotificationRow; onPress: () => void }) {
  const meta = ICON_BY_TYPE[n.type] ?? { icon: BriefcaseBusiness, bg: '#EFF6FF' };
  const Icon = meta.icon;
  const isRead = !!n.read_at;

  return (
    <TouchableOpacity style={[styles.card, !isRead && styles.cardUnread]} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Icon size={22} color={Colors.brandTeal} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{n.title}</Text>
          {!isRead && <View style={styles.dot} />}
        </View>
        <Text style={styles.message}>{n.body}</Text>
        <Text style={styles.time}>{timeAgo(n.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}
