/**
 * HOChatScreen.tsx
 *
 * Figma Source: "HO - Chat Interface" (id: 46:868 and 240:846)
 *
 * Design:
 * - White bg
 * - Header with provider avatar, name, status
 * - Chat bubbles (sent: teal right, received: gray left)
 * - Message input bar at bottom
 */

import React, { useState, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Paperclip,
  Phone,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Radii, Shadows, Sizes, Spacing } from '../../../src/constants/theme';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Hi! I\'m on my way to your location. ETA is around 15 minutes.', sent: false, time: '9:45 AM' },
  { id: '2', text: 'Great! The door is unlocked, feel free to come in.', sent: true, time: '9:47 AM' },
  { id: '3', text: 'Should I start with the kitchen or the bedrooms?', sent: false, time: '9:48 AM' },
  { id: '4', text: 'Please start with the bedrooms. The kids need to sleep early tonight.', sent: true, time: '9:49 AM' },
  { id: '5', text: 'No problem! I\'ll get started right away.', sent: false, time: '9:50 AM' },
];

interface HOChatScreenProps {
  onBack: () => void;
  onViewJob: () => void;
}

export default function HOChatScreen({ onBack, onViewJob }: HOChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: String(Date.now()),
      text: text.trim(),
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderBubble = ({ item }: { item: Message }) => (
    <View style={[styles.bubbleRow, item.sent && styles.bubbleRowSent]}>
      {!item.sent && <View style={styles.avatar}><Text style={styles.avatarText}>JD</Text></View>}
      <View style={[styles.bubble, item.sent ? styles.bubbleSent : styles.bubbleReceived]}>
        <Text style={[styles.bubbleText, item.sent && styles.bubbleTextSent]}>{item.text}</Text>
        <Text style={[styles.bubbleTime, item.sent && styles.bubbleTimeSent]}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <ArrowLeft size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>JD</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Juan dela Cruz</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
          <Phone size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Job reference card */}
      <View style={styles.jobRef}>
        <Sparkles size={18} color={Colors.brandTeal} />
        <Text style={styles.jobRefText}>Home Deep Clean · May 13, 2026</Text>
        <TouchableOpacity onPress={onViewJob} activeOpacity={0.8}>
          <Text style={styles.jobRefLink}>View Job</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderBubble}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onLayout={() => listRef.current?.scrollToEnd()}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.8}>
            <Paperclip size={20} color={Colors.brandDark} />
          </TouchableOpacity>
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={!text.trim()}
          >
            <ArrowRight size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: Colors.backgroundAlt },

  header: {
    backgroundColor: Colors.brandDark,
    paddingTop: Sizes.statusBarHeight,
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  headerAvatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.brandCyan, alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: Colors.white, fontSize: 16, fontWeight: '800', fontFamily: 'Inter' },
  headerInfo: { flex: 1 },
  headerName: { color: Colors.white, fontSize: 16, fontWeight: '700', fontFamily: 'Inter', marginBottom: 2 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22C55E' },
  onlineText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Inter' },
  callBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  callIcon: { fontSize: 18 },

  jobRef: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, paddingHorizontal: Spacing.screenH, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(144,153,184,0.15)',
  },
  jobRefIcon: { fontSize: 18 },
  jobRefText: { flex: 1, color: Colors.brandDark, fontSize: 13, fontWeight: '600', fontFamily: 'Inter' },
  jobRefLink: { color: Colors.brandTeal, fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },

  chatContent: { paddingHorizontal: Spacing.screenH, paddingVertical: 16, gap: 10 },

  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  bubbleRowSent: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.brandCyan, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 12, fontWeight: '800', fontFamily: 'Inter' },
  bubble: {
    maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleSent: {
    backgroundColor: Colors.brandTeal, borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: Colors.white, borderBottomLeftRadius: 4,
    ...Shadows.input,
  },
  bubbleText: { fontFamily: 'Inter', fontSize: 14, color: Colors.brandDark, lineHeight: 20 },
  bubbleTextSent: { color: Colors.white },
  bubbleTime: { fontFamily: 'Inter', fontSize: 10, color: Colors.muted, marginTop: 4, textAlign: 'right' },
  bubbleTimeSent: { color: 'rgba(255,255,255,0.7)' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: Spacing.screenH, paddingVertical: 12,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: 'rgba(144,153,184,0.15)',
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.backgroundAlt, alignItems: 'center', justifyContent: 'center',
  },
  attachIcon: { fontSize: 20 },
  chatInput: {
    flex: 1, backgroundColor: Colors.backgroundAlt, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100,
    fontFamily: 'Inter', fontSize: 14, color: Colors.brandDark,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.brandTeal, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(144,153,184,0.3)' },
  sendBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
