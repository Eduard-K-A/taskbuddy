/**
 * ForgotPasswordScreen.tsx
 *
 * Figma-aligned reset-password entry screen for the TaskBuddy mobile auth flow.
 * Matches the existing login screen styling with the same teal/white visual language.
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../src/constants/theme';
import { styles } from './styles';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
  onResetPassword?: (email: string) => void;
}

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address';
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <TextInput
          style={styles.inputText}
          placeholder={placeholder}
          placeholderTextColor={Colors.muted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

export default function ForgotPasswordScreen({
  onBackToLogin,
  onResetPassword,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    onResetPassword?.(email);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.blobTopLeft} pointerEvents="none" />
      <View style={styles.blobTopRight} pointerEvents="none" />
      <View style={styles.blobBottomLeft} pointerEvents="none" />
      <View style={styles.blobBottomRight} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoSection}>
            <View style={styles.logoMark}>
              <View style={styles.logoRect}>
                <View style={styles.logoLine} />
                <View style={[styles.logoLine, { width: 24 }]} />
                <View style={[styles.logoLine, { width: 20 }]} />
              </View>
              <View style={styles.logoFigure}>
                <View style={styles.logoHead} />
                <View style={styles.logoBody} />
              </View>
            </View>
            <Text style={styles.logoText}>TaskBuddy</Text>
            <Text style={styles.tagline}>Hire with confidence, pay with ease.</Text>
          </View>

          <View style={styles.headingSection}>
            <Text style={styles.welcomeText}>Forgot Password?</Text>
            <Text style={styles.subtitleText}>
              Enter your email and we’ll send a reset link to your inbox.
            </Text>
          </View>

          <InputField
            label="Email"
            placeholder="sample@mail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleReset}
          >
            <Text style={styles.primaryBtnText}>Send Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onBackToLogin}
          >
            <Text style={styles.forgotText}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  );
}
