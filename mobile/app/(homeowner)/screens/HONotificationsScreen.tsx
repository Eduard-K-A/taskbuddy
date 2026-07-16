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

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/designTokens';

const NOTIFICATIONS = [
  {
    id: '1',
    icon: '✅',
    iconBg: '#F0FDF4',
    title: 'Job Accepted',
    message: 'Juan dela Cruz has accepted your Home Deep Clean request.',
    time: '10 mins ago',
    read: false,
    date: 'Today',
  },
  {
    id: '2',
    icon: '💬',
    iconBg: '#EFF6FF',
    title: 'New Message',
    message: 'Maria Santos sent you a message regarding your Office Cleaning job.',
    time: '1 hour ago',
    read: false,
    date: 'Today',
  },
  {
    id: '3',
    icon: '💰',
    iconBg: '#FFF7ED',
    title: 'Payment Processed',
    message: 'Your payment of ₱850 for Home Deep Clean has been processed.',
    time: '3 hours ago',
    read: true,
    date: 'Today',
  },
  {
    id: '4',
    icon: '⭐',
    iconBg: '#FFFBEB',
    title: 'Rate Your Experience',
    message: 'How was Rosa Villanueva\'s Airbnb Turnover service? Leave a review.',
    time: 'Yesterday',
    read: true,
    date: 'Yesterday',
  },
  {
    id: '5',
    icon: '🎉',
    iconBg: '#F5F3FF',
    title: 'Welcome to TaskBuddy!',
    message: 'Your account is set up. Start posting jobs and find the best service providers.',
    time: 'May 10',
    read: true,
    date: 'Earlier',
  },
];

interface HONotificationsProps {
  onBack: () => void;
}

export default function HONotificationsScreen({ onBack }: HONotificationsProps) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Group by date
  const groups: Record<string, typeof NOTIFICATIONS> = {};
  notifications.forEach((n) => {
    if (!groups[n.date]) groups[n.date] = [];
    groups[n.date].push(n);
  });

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backIcon}>←</Text>
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
        {Object.entries(groups).map(([date, items]) => (
          <View key={date}>
            <Text style={styles.dateGroup}>{date}</Text>
            {items.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                activeOpacity={0.85}
                onPress={() => setNotifications((prev) =>
                  prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
                )}
              >
                <View style={[styles.notifIcon, { backgroundColor: notif.iconBg }]}>
                  <Text style={styles.notifIconText}>{notif.icon}</Text>
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    {!notif.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
              </TouchableOpacity>
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
