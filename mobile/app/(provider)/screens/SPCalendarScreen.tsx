/**
 * SPCalendarScreen.tsx
 *
 * Figma Source: "SP - Calendar View" (id: 305:852 and 46:1066)
 *
 * Design:
 * - Teal header with month/year navigation
 * - Calendar grid (week view)
 * - Job schedule list below
 */

import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { useAsyncData } from '../../../src/hooks/useAsyncData';
import { api } from '../../../src/lib/api';
import { timeOfDay } from '../../../src/lib/format';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BAR_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6'];

interface SPCalendarScreenProps {
  onBack?: () => void;
}

export default function SPCalendarScreen({ onBack }: SPCalendarScreenProps) {
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTH_DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Fetch this month's bookings once; filter to the selected day client-side.
  const from = new Date(year, month, 1).toISOString();
  const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  const { data, loading } = useAsyncData(() => api.bookings({ from, to }), []);
  const bookings = data ?? [];

  const daySchedule = bookings
    .filter((b) => new Date(b.scheduled_at).getDate() === selectedDay)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>My Calendar</Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.monthTitle}>{monthLabel}</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} activeOpacity={0.8}><Text style={styles.navBtnText}>←</Text></TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
            {MONTH_DAYS.map((day) => {
              const isSelected = day === selectedDay;
              const dayOfWeek = DAYS[new Date(year, month, day).getDay()];
              return (
                <TouchableOpacity key={day} style={[styles.dayBtn, isSelected && styles.dayBtnActive]} onPress={() => setSelectedDay(day)} activeOpacity={0.8}>
                  <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{dayOfWeek}</Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={styles.navBtn} activeOpacity={0.8}><Text style={styles.navBtnText}>→</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          Schedule — {now.toLocaleDateString('en-US', { month: 'short' })} {selectedDay}
        </Text>
        {loading && <ActivityIndicator style={{ marginTop: 10 }} color={Colors.brandTeal} />}
        {!loading && daySchedule.length === 0 && (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotText}>No bookings scheduled for this day.</Text>
          </View>
        )}
        {daySchedule.map((booking, i) => {
          const hrs = booking.duration_minutes / 60;
          const durationLabel = `${hrs % 1 === 0 ? hrs : hrs.toFixed(1)} hr${hrs === 1 ? '' : 's'}`;
          const clientName = booking.client?.full_name ?? 'Client';
          return (
            <View key={booking.id} style={styles.scheduleCard}>
              <View style={[styles.scheduleBar, { backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }]} />
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTime}>{timeOfDay(booking.scheduled_at)} · {durationLabel}</Text>
                <Text style={styles.scheduleTitle}>{booking.jobs?.title ?? 'Booking'}</Text>
                <View style={styles.scheduleClientRow}>
                  <UserRound size={13} color={Colors.slate} />
                  <Text style={styles.scheduleClientLabel}>{clientName}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.detailArrow} activeOpacity={0.8}>
                <Text style={styles.detailArrowText}>›</Text>
              </TouchableOpacity>
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
  header: {
    backgroundColor: Colors.brandDark, paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH, paddingBottom: 16,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 12 },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: Colors.white, fontSize: 24, fontWeight: '300' },
  monthTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter', marginBottom: 10 },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  navBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { color: Colors.white, fontSize: 16 },
  daysScroll: { gap: 4, paddingHorizontal: 4 },
  dayBtn: { width: 44, alignItems: 'center', paddingVertical: 6, borderRadius: 12 },
  dayBtnActive: { backgroundColor: Colors.white },
  dayLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontFamily: 'Inter', marginBottom: 2 },
  dayLabelActive: { color: Colors.brandDark },
  dayNum: { color: Colors.white, fontSize: 16, fontWeight: '700', fontFamily: 'Inter' },
  dayNumActive: { color: Colors.brandDark },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },
  sectionTitle: { color: Colors.brandDark, fontSize: 16, fontWeight: '800', fontFamily: 'Inter', marginBottom: 14 },
  scheduleCard: { backgroundColor: Colors.white, borderRadius: Radii.card, flexDirection: 'row', marginBottom: 12, overflow: 'hidden', ...Shadows.card },
  scheduleBar: { width: 5 },
  scheduleContent: { flex: 1, padding: 16 },
  scheduleTime: { color: Colors.muted, fontSize: 12, fontFamily: 'Inter', marginBottom: 4 },
  scheduleTitle: { color: Colors.brandDark, fontSize: 15, fontWeight: '700', fontFamily: 'Inter', marginBottom: 4 },
  scheduleClient: { display: 'none' },
  scheduleClientRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  scheduleClientLabel: { color: Colors.slate, fontSize: 12, fontFamily: 'Inter' },
  detailArrow: { width: 40, alignItems: 'center', justifyContent: 'center' },
  detailArrowText: { color: Colors.muted, fontSize: 22 },
  emptySlot: { backgroundColor: 'rgba(144,153,184,0.1)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(144,153,184,0.2)', borderStyle: 'dashed' },
  emptySlotText: { color: Colors.muted, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
});
