import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../../src/constants/theme';

const C = {
  ...Colors,
  bg: '#F8FAFC',
  dark: '#1E1E1E',
  slate: '#757575',
  mutedBorder: 'rgba(144,153,184,0.3)',
} as const;

interface TermsAndConditionsProps {
  onBack: () => void;
  onAccept: () => void;
}

export default function TermsAndConditions({ onBack, onAccept }: TermsAndConditionsProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.headerBg} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
              <ArrowLeft size={20} color={C.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Terms & Conditions</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>TaskBuddy terms of use</Text>
            <Text style={styles.bodyText}>
              By creating an account, you agree to use TaskBuddy responsibly, provide accurate
              account details, and respect the community guidelines for both homeowners and
              service providers.
            </Text>
            <Text style={styles.bodyText}>
              You understand that payments, bookings, and service arrangements are managed through
              the platform and that TaskBuddy acts as a facilitator between users.
            </Text>
            <Text style={styles.bodyText}>
              Your data will be used to improve the experience, support account security, and
              deliver relevant notifications. You may contact support at any time for questions
              about your account or activity.
            </Text>
            <Text style={styles.bodyText}>
              Continued use of the app indicates your acceptance of future platform updates and
              policy changes communicated through the app.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              onAccept();
              onBack();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>I agree to the Terms</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.bg },

  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: C.brandDark,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },

  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: C.white, fontSize: 20, fontWeight: '700' },
  title: { color: C.white, fontSize: 22, fontWeight: '700', fontFamily: 'Inter' },

  card: {
    backgroundColor: C.white,
    borderRadius: 30,
    padding: 24,
    shadowColor: '#063D4D',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 25,
    elevation: 6,
    marginBottom: 20,
  },

  sectionTitle: {
    color: C.dark,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  bodyText: {
    color: C.slate,
    fontSize: 14,
    fontFamily: 'Inter',
    lineHeight: 22,
    marginBottom: 12,
  },

  primaryBtn: {
    backgroundColor: C.brandTeal,
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: C.brandTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: {
    color: C.white,
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
