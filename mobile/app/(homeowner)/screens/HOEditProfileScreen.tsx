/**
 * HOEditProfileScreen.tsx
 *
 * Figma Source: "HO - Edit Profile" (id: 46:922)
 *
 * Design:
 * - Teal header with avatar edit functionality
 * - Form fields: Full Name, Email, Phone, Location, Bio
 * - Save button
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Camera } from 'lucide-react-native';
import ConfirmationModal from '../../../src/components/ConfirmationModal';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { useAuth } from '../../../src/context/AuthContext';
import { api } from '../../../src/lib/api';
import { initials } from '../../../src/lib/format';

interface HOEditProfileScreenProps {
  onBack: () => void;
  onSave: () => void;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          multiline && styles.fieldInputMultiline,
          focused && styles.fieldInputFocused,
          !editable && styles.fieldInputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

export default function HOEditProfileScreen({ onBack, onSave }: HOEditProfileScreenProps) {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [location, setLocation] = useState(profile?.address ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const email = profile?.email ?? '';

  const hasChanges =
    name !== (profile?.full_name ?? '') ||
    phone !== (profile?.phone ?? '') ||
    location !== (profile?.address ?? '') ||
    city !== (profile?.city ?? '');

  const requestSave = () => {
    setError(null);
    if (!name.trim()) {
      setError('Full name cannot be empty.');
      return;
    }
    if (hasChanges) setShowSaveConfirmation(true);
    else onSave();
  };

  const performSave = async () => {
    setShowSaveConfirmation(false);
    setSaving(true);
    setError(null);
    try {
      await api.updateProfile({
        full_name: name.trim(),
        phone: phone.trim(),
        address: location.trim(),
        city: city.trim(),
      });
      await refreshProfile();
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <ArrowLeft size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={requestSave} activeOpacity={0.8}>
            <Text style={styles.saveTextBtn}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials(name)}</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.8}>
            <View style={styles.changePhotoBtnContent}>
              <Camera size={14} color={Colors.white} />
              <Text style={styles.changePhotoBtnText}>Change Photo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <FormField label="Full Name" value={name} onChangeText={setName} placeholder="Your full name" />
            <FormField label="Email Address" value={email} placeholder="email@example.com" keyboardType="email-address" editable={false} />
            <FormField label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+63 9XX XXX XXXX" keyboardType="phone-pad" />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location</Text>
            <FormField label="Home Address" value={location} onChangeText={setLocation} placeholder="House no., Barangay, Street" />
            <FormField label="City" value={city} onChangeText={setCity} placeholder="City / Municipality" />
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={requestSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <ConfirmationModal
        visible={showSaveConfirmation}
        title="Save profile changes?"
        message="Your updated profile details will be saved and shown in your account."
        confirmLabel="Save Changes"
        onCancel={() => setShowSaveConfirmation(false)}
        onConfirm={performSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.brandDark,
    paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, marginBottom: 20,
  },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '600' },
  saveTextBtn: { color: Colors.brandCyan, fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },

  avatarSection: { alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.brandCyan, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '800', fontFamily: 'Inter' },
  changePhotoBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  changePhotoBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  changePhotoBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },

  card: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 20, marginBottom: 16, ...Shadows.card },
  cardTitle: { color: Colors.brandDark, fontSize: 15, fontWeight: '800', fontFamily: 'Inter', marginBottom: 16 },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: { color: Colors.brandDark, fontSize: 13, fontWeight: '600', fontFamily: 'Inter', marginBottom: 6 },
  fieldInput: {
    backgroundColor: Colors.backgroundAlt, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    borderWidth: 1, borderColor: 'rgba(144,153,184,0.3)',
    fontFamily: 'Inter', fontSize: 14, color: Colors.brandDark,
  },
  fieldInputMultiline: { height: 90, textAlignVertical: 'top' },
  fieldInputFocused: { borderColor: Colors.brandTeal },
  fieldInputDisabled: { color: Colors.muted, backgroundColor: 'rgba(144,153,184,0.08)' },

  errorText: { color: Colors.error, fontSize: 13, fontFamily: 'Inter', marginBottom: 12, textAlign: 'center' },

  saveBtn: {
    backgroundColor: Colors.brandTeal, borderRadius: 24, paddingVertical: 15,
    alignItems: 'center', marginTop: 4,
    shadowColor: Colors.brandTeal, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600', fontFamily: 'Inter', letterSpacing: 0.3 },
});
