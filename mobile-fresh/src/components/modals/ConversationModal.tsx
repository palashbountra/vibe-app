import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { chatService, type Message } from '@/services/chatService';
import { useAuthStore } from '@/store/authStore';
import type { Connection } from '@/services/matchingService';

interface ConversationModalProps {
  connection: Connection | null;
  visible: boolean;
  onClose: () => void;
}

export function ConversationModal({ connection, visible, onClose }: ConversationModalProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const myId = user?.id ?? '';

  const loadMessages = useCallback(async () => {
    if (!connection) return;
    setLoading(true);
    const msgs = await chatService.getMessages(connection.connectionId);
    setMessages(msgs);
    setLoading(false);
    await chatService.markAsRead(connection.connectionId);
  }, [connection?.connectionId]);

  useEffect(() => {
    if (!visible || !connection) return;
    setText('');
    setMessages([]);
    loadMessages();

    const unsubscribe = chatService.subscribeToConnection(
      connection.connectionId,
      (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      },
    );
    return unsubscribe;
  }, [visible, connection?.connectionId]);

  const handleSend = async () => {
    if (!text.trim() || !connection || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    const msg = await chatService.sendMessage(connection.connectionId, content);
    if (msg) {
      setMessages((prev) => [...prev, msg]);
    }
    setSending(false);
  };

  if (!connection) return null;

  const other = connection.user;
  const initial = other.displayName.charAt(0).toUpperCase();
  const avatarBg = other.avatarColor ?? Colors.primary;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={[styles.headerAvatar, { backgroundColor: avatarBg }]}>
            <Text style={styles.headerAvatarInitial}>{initial}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{other.displayName}</Text>
            {other.currentTrack && (
              <Text style={styles.headerNowPlaying} numberOfLines={1}>
                🎵 {other.currentTrack.title}
              </Text>
            )}
          </View>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>Say hi to {other.displayName}! 👋</Text>
                <Text style={styles.emptyChatSub}>You're connected — start the conversation.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMe = item.senderId === myId;
              return (
                <View style={[styles.bubbleWrap, isMe && styles.bubbleWrapMe]}>
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                      {item.text}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={`Message ${other.displayName}...`}
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  headerNowPlaying: {
    ...Typography.small,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: Spacing.lg,
    gap: Spacing.xs,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.sm,
  },
  emptyChatText: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  emptyChatSub: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  bubbleWrap: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  bubbleWrapMe: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMe: {
    color: '#fff',
  },
  bubbleTextThem: {
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.textPrimary,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingBottom: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
});
