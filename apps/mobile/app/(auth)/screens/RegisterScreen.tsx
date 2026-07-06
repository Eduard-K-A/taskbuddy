import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={styles.backArrow}>←</Text>
        </View>

        <View style={styles.heroBlock}>
          <View style={styles.heroIcon}>
            <View style={styles.heroIconInner} />
          </View>
          <Text style={styles.logoTitle}>TaskBuddy</Text>
          <Text style={styles.logoSubtitle}>Hire with confidence, pay with ease.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Let's get started!</Text>

          <View style={styles.roleToggleRow}>
            <View style={[styles.roleButton, styles.roleButtonActive]}>
              <Text style={[styles.roleButtonText, styles.roleButtonTextActive]}>Homeowner</Text>
            </View>
            <View style={styles.roleButton}>
              <Text style={styles.roleButtonText}>Service Provider</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Alex Chen" placeholderTextColor="#94a3b8" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput style={styles.input} placeholder="alex@example.com" placeholderTextColor="#94a3b8" keyboardType="email-address" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry />
          </View>

          <View style={styles.checkboxRow}>
            <View style={styles.checkbox} />
            <Text style={styles.checkboxLabel}>
              I agree with the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9}>
            <Text style={styles.secondaryIcon}>G</Text>
            <Text style={styles.secondaryButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8f2fb',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  topRow: {
    marginBottom: 10,
  },
  backArrow: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
  },
  heroBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroIconInner: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#0f172a',
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  logoSubtitle: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 25,
    elevation: 4,
  },
  formTitle: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  formSubtitle: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 22,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  roleButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  roleButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#0f172a',
  },
  roleButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  roleButtonTextActive: {
    color: '#0f172a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#0f172a',
    fontSize: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  checkboxLabel: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 18,
    paddingVertical: 14,
    gap: 10,
  },
  secondaryIcon: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
});
