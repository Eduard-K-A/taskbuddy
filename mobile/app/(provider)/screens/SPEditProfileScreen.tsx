/**
 * SPEditProfileScreen.tsx
 *
 * Figma Source: "SP - Edit Profile" (id: 46:1048)
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Camera } from 'lucide-react-native';
import ConfirmationModal from '../../../src/components/ConfirmationModal';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';
import { useAuth } from '../../../src/context/AuthContext';
import { useAsyncData } from '../../../src/hooks/useAsyncData';
import { api } from '../../../src/lib/api';
import { initials } from '../../../src/lib/format';

interface SPEditProfileScreenProps { onBack: () => void; onSave: () => void; }

function Field({ label, value, onChange, placeholder, multiline, keyboard, editable = true }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboard?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti, focused && styles.fieldInputFocused, !editable && styles.fieldInputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        multiline={multiline}
        keyboardType={keyboard}
        editable={editable}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

export default function SPEditProfileScreen({ onBack, onSave }: SPEditProfileScreenProps) {
  const { profile, providerProfile, refreshProfile } = useAuth();
  const categories = useAsyncData(() => api.categories(), []);

  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [location, setLocation] = useState(profile?.address ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [bio, setBio] = useState(providerProfile?.bio ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(
    providerProfile?.category_id ?? null,
  );
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const email = profile?.email ?? '';

  const requestSave = () => {
    setError(null);
    if (!name.trim()) return setError('Full name cannot be empty.');
    if (!categoryId) return setError('Please select the service you offer.');
    if (bio.trim().length < 20)
      return setError('Bio must be at least 20 characters.');
    setShowSaveConfirmation(true);
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
      await api.upsertProviderProfile({
        category_id: categoryId!,
        bio: bio.trim(),
        years_experience: providerProfile?.years_experience,
        service_radius_km: providerProfile?.service_radius_km,
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
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={requestSave} activeOpacity={0.8}>
            <Text style={styles.saveTextBtn}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}><Text style={styles.avatarText}>{initials(name)}</Text></View>
          <TouchableOpacity style={styles.photoBtn} activeOpacity={0.8}>
            <View style={styles.photoBtnContent}>
              <Camera size={15} color={Colors.white} />
              <Text style={styles.photoBtnLabel}>Change Photo</Text>
            </View>
            <Text style={styles.photoBtnText}>📷 Change Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Info</Text>
            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Email" value={email} keyboard="email-address" editable={false} />
            <Field label="Phone" value={phone} onChange={setPhone} keyboard="phone-pad" />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location</Text>
            <Field label="Service Area" value={location} onChange={setLocation} placeholder="Barangay, Street" />
            <Field label="City" value={city} onChange={setCity} placeholder="City / Municipality" />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Professional Bio</Text>
            <Field label="About You (min 20 characters)" value={bio} onChange={setBio} multiline placeholder="Describe your experience..." />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Offered</Text>
            <Text style={styles.cardSub}>Choose the category you work in</Text>
            <View style={styles.skillsGrid}>
              {(categories.data ?? []).map((cat) => {
                const active = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.skillChip, active && styles.skillChipActive]}
                    onPress={() => setCategoryId(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.skillChipText, active && styles.skillChipTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={requestSave} activeOpacity={0.85} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <ConfirmationModal
        visible={showSaveConfirmation}
        title="Save profile changes?"
        message="Your updated professional details and services will be saved to your profile."
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
  header: { backgroundColor: Colors.brandDark, paddingTop: Sizes.statusBarHeight, paddingHorizontal: Spacing.screenH, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginBottom: 20 },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: '700', fontFamily: 'Inter' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '600' },
  saveTextBtn: { color: Colors.brandCyan, fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
  avatarSection: { alignItems: 'center', gap: 12 },
  avatarCircle: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.brandCyan, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '800', fontFamily: 'Inter' },
  photoBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  photoBtnText: { display: 'none' },
  photoBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  photoBtnLabel: { color: Colors.white, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.screenH, paddingTop: 20, paddingBottom: 20 },
  card: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 20, marginBottom: 16, ...Shadows.card },
  cardTitle: { color: Colors.brandDark, fontSize: 15, fontWeight: '800', fontFamily: 'Inter', marginBottom: 4 },
  cardSub: { color: Colors.muted, fontSize: 12, fontFamily: 'Inter', marginBottom: 14 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { color: Colors.brandDark, fontSize: 13, fontWeight: '600', fontFamily: 'Inter', marginBottom: 6 },
  fieldInput: { backgroundColor: Colors.backgroundAlt, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderColor: 'rgba(144,153,184,0.3)', fontFamily: 'Inter', fontSize: 14, color: Colors.brandDark },
  fieldInputMulti: { height: 90, textAlignVertical: 'top' },
  fieldInputFocused: { borderColor: Colors.brandTeal },
  fieldInputDisabled: { color: Colors.muted, backgroundColor: 'rgba(144,153,184,0.08)' },
  errorText: { color: Colors.error, fontSize: 13, fontFamily: 'Inter', marginBottom: 12, textAlign: 'center' },
  saveBtnDisabled: { opacity: 0.7 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(144,153,184,0.3)', backgroundColor: Colors.white },
  skillChipActive: { backgroundColor: Colors.brandDark, borderColor: Colors.brandDark },
  skillChipText: { color: Colors.muted, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  skillChipTextActive: { color: Colors.white },
  saveBtn: { backgroundColor: Colors.brandTeal, borderRadius: 24, paddingVertical: 15, alignItems: 'center', marginTop: 4, shadowColor: Colors.brandTeal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600', fontFamily: 'Inter', letterSpacing: 0.3 },
});
