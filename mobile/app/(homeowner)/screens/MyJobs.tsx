import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dates = [null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

export default function MyJobs() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.subtext}>Customer · Calendar</Text>
            <Text style={styles.title}>Calendar</Text>
          </View>
          <View style={styles.jobsBadge}>
            <Text style={styles.jobsBadgeText}>9 jobs</Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarMonth}>May 2026</Text>
            <View style={styles.calendarNav}>
              <Text style={styles.navArrow}>←</Text>
              <Text style={styles.navArrow}>→</Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            {days.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}> 
            {dates.map((date, idx) => (
              <View key={`${date}-${idx}`} style={[styles.dateCell, date === 13 && styles.dateCellSelected]}>
                <Text style={[styles.dateText, date === 13 && styles.dateTextSelected]}>{date || ''}</Text>
                {date === 8 || date === 13 || date === 19 || date === 29 ? <View style={styles.dot} /> : null}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tue May 13 — 2 jobs</Text>

        <View style={styles.jobCard}>
          <View style={styles.jobCardBar} />
          <View style={styles.jobCardContent}>
            <Text style={styles.jobTitle}>Studio Apartment</Text>
            <View style={styles.jobRow}>
              <Text style={styles.jobMeta}>10:00 AM</Text>
              <Text style={styles.jobMeta}>Brgy. Sabang, Lipa City</Text>
            </View>
            <Text style={styles.jobPrice}>₱675</Text>
          </View>
        </View>

        <View style={styles.jobCard}>
          <View style={[styles.jobCardBar, styles.jobCardBarYellow]} />
          <View style={styles.jobCardContent}>
            <Text style={styles.jobTitle}>Airbnb Turnover</Text>
            <View style={styles.jobRow}>
              <Text style={styles.jobMeta}>3:00 PM</Text>
              <Text style={styles.jobMeta}>1962 J.P. Laurel</Text>
            </View>
            <Text style={styles.jobPrice}>₱895</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf3fb',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subtext: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  jobsBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  jobsBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 18,
    marginBottom: 22,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 12,
  },
  navArrow: {
    color: '#0f172a',
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDay: {
    color: '#94a3b8',
    width: 28,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: 14,
  },
  dateCellSelected: {
    backgroundColor: '#0f172a',
  },
  dateText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  dateTextSelected: {
    color: '#ffffff',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  jobCardBar: {
    width: 4,
    borderRadius: 4,
    backgroundColor: '#34d399',
    marginRight: 16,
  },
  jobCardBarYellow: {
    backgroundColor: '#fbbf24',
  },
  jobCardContent: {
    flex: 1,
  },
  jobTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  jobRow: {
    gap: 8,
    marginBottom: 12,
  },
  jobMeta: {
    color: '#64748b',
    fontSize: 12,
  },
  jobPrice: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 18,
  },
});
