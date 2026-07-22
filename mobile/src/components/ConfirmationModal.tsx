import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radii } from '../constants/theme';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Reusable confirmation dialog for actions that require an explicit user choice. */
export default function ConfirmationModal({
  visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel,
}: ConfirmationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(6, 61, 77, 0.5)' },
  dialog: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: 24 },
  title: { color: Colors.brandDark, fontSize: 20, fontWeight: '800', fontFamily: 'Inter', marginBottom: 10 },
  message: { color: Colors.slate, fontSize: 14, fontFamily: 'Inter', lineHeight: 21, marginBottom: 22 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelButton: { borderWidth: 1, borderColor: 'rgba(144,153,184,0.45)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  confirmButton: { backgroundColor: Colors.brandTeal, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  cancelText: { color: Colors.slate, fontSize: 14, fontWeight: '700', fontFamily: 'Inter' },
  confirmText: { color: Colors.white, fontSize: 14, fontWeight: '700', fontFamily: 'Inter' },
});
