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

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <View style={styles.heroIcon}>
            <View style={styles.heroIconInner} />
          </View>
          <Text style={styles.logoTitle}>TaskBuddy</Text>
          <Text style={styles.logoSubtitle}>Hire with confidence, pay with ease.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome!</Text>
          <Text style={styles.formSubtitle}>Sign in to your account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={styles.input} placeholder="sample@mail.com" placeholderTextColor="#94a3b8" keyboardType="email-address" />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>Password</Text>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </View>
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#94a3b8" secureTextEntry />
          </View>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
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

          <View style={styles.bottomTextRow}>
            <Text style={styles.bottomText}>Don’t have an account?</Text>
            <Text style={styles.signupText}> Sign Up</Text>
          </View>
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
    paddingTop: 36,
    paddingBottom: 32,
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
  inputGroup: {
    marginBottom: 18,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  forgotText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#0f172a',
    fontSize: 15,
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
    marginBottom: 22,
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
  bottomTextRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomText: {
    color: '#64748b',
    fontSize: 13,
  },
  signupText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
});
