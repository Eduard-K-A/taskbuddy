/**
 * LoginScreen.tsx
 *
 * Figma Source: "Log In / Sign In Screen" (id: 36:431)
 *
 * Design (from Figma):
 *  - bg: #FFFFFF with 4 blurred teal/cyan ellipses for depth
 *  - Logo: TaskBuddy wordmark (League Spartan Bold 32px #063D4D) + logo mark icon
 *  - Tagline: "Hire with confidence, pay with ease." — Darker Grotesque 800 18px #063E4D
 *  - "Welcome!" — Inter Bold 20px #063D4D
 *  - "Sign in to your account" — Inter Medium 14px #90A1B9
 *  - Email + Password inputs (white box, radius 8, 40px height)
 *  - "Forgot Password?" link (Inter Bold 14px #096F8B)
 *  - "Sign In" primary button (teal, radius 24, 48px height)
 *  - "or" divider (#90A1B9)
 *  - "Continue with Google" outline button (radius 50, stroke #EAEEF4)
 *  - "Don't have an account? Sign Up"
 *
 * DEMO MODE: Sign In navigates based on selected role (homeowner / provider).
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../../src/constants/designTokens';
import { styles } from './styles';

// ─── Props ────────────────────────────────────────────────────────────────────
interface LoginScreenProps {
  onLoginAsHomeowner: () => void;
  onLoginAsProvider: () => void;
  onSignUp: () => void;
  onForgotPassword?: () => void;
}

// ─── InputField sub-component ─────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  error?: string;
  rightElement?: React.ReactNode;
  testID?: string;
}

function InputField({
  label, placeholder, value, onChangeText,
  secureTextEntry = false, keyboardType = 'default',
  error, rightElement, testID,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputBox,
        focused && styles.inputBoxFocused,
        !!error && styles.inputBoxError,
      ]}>
        <TextInput
          testID={testID}
          style={styles.inputText}
          placeholder={placeholder}
          placeholderTextColor={Colors.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightElement}
      </View>
      {!!error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function LoginScreen({
  onLoginAsHomeowner,
  onLoginAsProvider,
  onSignUp,
  onForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'homeowner' | 'provider'>('homeowner');

  const handleSignIn = () => {
    // DEMO: navigate based on selected role without real auth
    if (selectedRole === 'homeowner') {
      onLoginAsHomeowner();
    } else {
      onLoginAsProvider();
    }
  };

  return (
    <View style={styles.screen}>
      {/* Background blobs */}
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
          {/* Logo */}
          <View style={styles.logoSection}>
            {/* Logo mark */}
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

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.subtitleText}>Sign in to your account</Text>
          </View>

          {/* Role selector (DEMO) */}
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleChip, selectedRole === 'homeowner' && styles.roleChipActive]}
              onPress={() => setSelectedRole('homeowner')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleChipText, selectedRole === 'homeowner' && styles.roleChipTextActive]}>
                Homeowner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleChip, selectedRole === 'provider' && styles.roleChipActive]}
              onPress={() => setSelectedRole('provider')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleChipText, selectedRole === 'provider' && styles.roleChipTextActive]}>
                Provider
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <InputField
            testID="input-email"
            label="Email"
            placeholder="sample@mail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Password */}
          <View style={styles.passwordSection}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity onPress={onForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                testID="input-password"
                style={[styles.inputText, styles.flex]}
                placeholder="Password"
                placeholderTextColor={Colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In */}
          <TouchableOpacity
            testID="btn-sign-in"
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleSignIn}
          >
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            testID="btn-google"
            style={styles.googleBtn}
            activeOpacity={0.85}
            onPress={handleSignIn}
          >
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpPrompt}>Don't have an account? </Text>
            <Pressable onPress={onSignUp} testID="btn-signup">
              <Text style={styles.signUpLink}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gesture bar */}
      <View style={styles.gestureBarWrap} pointerEvents="none">
        <View style={styles.gestureBar} />
      </View>
    </View>
  );
}
