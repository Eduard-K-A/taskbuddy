/**
 * HONotificationsScreen.tsx
 *
 * Figma Source: "HO - Notifications" (id: 46:886)
 *
 * Design:
 * - Teal header "Notifications"
 * - Notification items list (grouped by date)
 * - Read/unread state
 */

import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  BellRing,
  CircleCheckBig,
  Trophy,
} from 'lucide-react-native';
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

const ICON_BY_TYPE: Record<string, { icon: typeof BellRing; bg: string }> = {
  recommendation_invite: { icon: Trophy, bg: '#F5F3FF' },
  application_update: { icon: CircleCheckBig, bg: '#F0FDF4' },
  job_update: { icon: BellRing, bg: '#EFF6FF' },
};

interface HONotificationsProps {
  onBack: () => void;
}

export default function HONotificationsScreen({ onBack }: HONotificationsProps) {
  const { data, loading, error, reload } = useAsyncData(
    () => api.notifications() as Promise<NotificationRow[]>,
    [],
  );
  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    reload();
  };

  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    reload();
  };

  // Group by date bucket, preserving order (Today, Yesterday, Earlier).
  const groups: Record<string, NotificationRow[]> = {};
  notifications.forEach((n) => {
    const bucket = dateBucket(n.created_at);
    if (!groups[bucket]) groups[bucket] = [];
    groups[bucket].push(n);
  });

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <ArrowLeft size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.8}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} unread</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && <ActivityIndicator style={{ marginTop: 20 }} color={Colors.brandTeal} />}
        {!!error && !loading && <Text style={styles.stateText}>{error}</Text>}
        {!loading && !error && notifications.length === 0 && (
          <Text style={styles.stateText}>You have no notifications yet.</Text>
        )}
        {Object.entries(groups).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.dateGroup}>{date}</Text>
            {items.map((notif) => {
              const meta = ICON_BY_TYPE[notif.type] ?? { icon: BellRing, bg: '#EFF6FF' };
              const Icon = meta.icon;
              const isRead = !!notif.read_at;
              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notifCard, !isRead && styles.notifCardUnread]}
                  activeOpacity={0.85}
                  onPress={() => !isRead && markRead(notif.id)}
                >
                  <View style={[styles.notifIcon, { backgroundColor: meta.bg }]}>
                    <Icon size={20} color={Colors.brandDark} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      {!isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage}>{notif.body}</Text>
                    <Text style={styles.notifTime}>{timeAgo(notif.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
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
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, marginBottom: 10,
  },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '600' },
  markAllText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  unreadBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
  },
  unreadBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '600', fontFamily: 'Inter' },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },

  dateGroup: {
    color: Colors.muted, fontSize: 12, fontWeight: '700', fontFamily: 'Inter',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4,
  },
  stateText: { color: Colors.slate, fontSize: 14, fontFamily: 'Inter', textAlign: 'center', marginTop: 30 },

  notifCard: {
    backgroundColor: Colors.white, borderRadius: Radii.card,
    padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start',
    ...Shadows.card,
  },
  notifCardUnread: {
    borderLeftWidth: 4, borderLeftColor: Colors.brandTeal,
  },
  notifIcon: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  notifIconText: { fontSize: 22 },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { color: Colors.brandDark, fontSize: 14, fontWeight: '700', fontFamily: 'Inter', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brandTeal, marginLeft: 8 },
  notifMessage: { color: Colors.slate, fontSize: 13, fontFamily: 'Inter', lineHeight: 19, marginBottom: 6 },
  notifTime: { color: Colors.muted, fontSize: 11, fontFamily: 'Inter' },
});
