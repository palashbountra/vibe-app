import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { matchingService, type FeedCandidate } from '@/services/matchingService';

const { width: SCREEN_W } = Dimensions.get('window');

const GENRE_COLORS: Record<string, string> = {
  'r&b': '#8B5CF6', 'neo-soul': '#8B5CF6', 'soul': '#8B5CF6',
  'hip-hop': '#F59E0B', 'rap': '#F59E0B', 'alternative rap': '#F59E0B',
  'pop': '#EC4899', 'indie pop': '#EC4899',
  'rock': '#EF4444', 'indie rock': '#EF4444', 'alternative': '#EF4444', 'post-punk': '#EF4444',
  'electronic': '#3B82F6', 'ambient': '#3B82F6', 'techno': '#3B82F6',
  'jazz': '#10B981', 'indie folk': '#10B981',
  'lo-fi': '#6B7280', 'funk': '#F97316',
};

function genreColor(genre: string): string {
  return GENRE_COLORS[genre.toLowerCase()] ?? '#6B7280';
}

function compatColor(score: number): string {
  if (score >= 80) return '#1DB954';
  if (score >= 60) return '#F59E0B';
  return '#6B7280';
}

interface UserProfileModalProps {
  user: FeedCandidate | null;
  visible: boolean;
  onClose: () => void;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export function UserProfileModal({ user, visible, onClose, isOwnProfile = false, onEditProfile }: UserProfileModalProps) {
  const insets = useSafeAreaInsets();
  const [connected, setConnected] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Compliment sub-modal state
  const [complimentVisible, setComplimentVisible] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<{ question: string } | null>(null);
  const [complimentText, setComplimentText] = useState('');
  const [sending, setSending] = useState(false);

  // Reset state when a new user opens
  React.useEffect(() => {
    if (visible) {
      setConnected(false);
      setPhotoIndex(0);
      setComplimentVisible(false);
      setComplimentText('');
    }
  }, [visible, user?.id]);

  if (!user) return null;

  const hasPhotos = user.photos && user.photos.length > 0;
  const photoCount = hasPhotos ? user.photos!.length : 1;

  const handleConnect = async () => {
    if (connected) return;
    await matchingService.sendConnectionRequest(user.id);
    setConnected(true);
  };

  const openCompliment = (prompt: { question: string }) => {
    setSelectedPrompt(prompt);
    setComplimentText('');
    setComplimentVisible(true);
  };

  const sendCompliment = async () => {
    if (!selectedPrompt || !complimentText.trim()) return;
    setSending(true);
    await matchingService.sendConnectionRequest(user.id, {
      promptQuestion: selectedPrompt.question,
      message: complimentText.trim(),
    });
    setSending(false);
    setComplimentVisible(false);
    setConnected(true);
    Alert.alert('Sent!', `Your compliment was sent to ${user.displayName}.`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>
        <ScrollView showsVerticalScrollIndicator={false} bounces>

          {/* ── Photo / Avatar hero ── */}
          <View style={styles.heroContainer}>
            {hasPhotos ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
                  setPhotoIndex(idx);
                }}
              >
                {user.photos!.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.photo} />
                ))}
              </ScrollView>
            ) : (
              <View style={[styles.avatarHero, { backgroundColor: user.avatarColor ?? Colors.primary }]}>
                <Text style={styles.avatarHeroInitial}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Page dots */}
            {photoCount > 1 && (
              <View style={styles.dotRow}>
                {user.photos!.map((_, i) => (
                  <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
                ))}
              </View>
            )}

            {/* Close button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Compat badge — hidden on own profile */}
            {!isOwnProfile && (
              <View style={[styles.compatOverlay, { backgroundColor: compatColor(user.compatibilityScore) }]}>
                <Ionicons name="musical-notes" size={12} color="#FFFFFF" />
                <Text style={styles.compatOverlayText}>{user.compatibilityScore}% match</Text>
              </View>
            )}
          </View>

          {/* ── Identity ── */}
          <View style={styles.section}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{user.displayName}</Text>
              {user.age ? <Text style={styles.ageText}>,{'  '}{user.age}</Text> : null}
            </View>
            <Text style={styles.usernameText}>@{user.username}</Text>

            <View style={styles.metaRow}>
              {user.pronouns ? (
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{user.pronouns}</Text>
                </View>
              ) : null}
              {user.location ? (
                <View style={styles.metaChip}>
                  <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.metaChipText}>{user.location}</Text>
                </View>
              ) : null}
            </View>

            {(user.job || user.school || user.height) ? (
              <View style={styles.infoList}>
                {user.job ? (
                  <View style={styles.infoItem}>
                    <Ionicons name="briefcase-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{user.job}</Text>
                  </View>
                ) : null}
                {user.school ? (
                  <View style={styles.infoItem}>
                    <Ionicons name="school-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{user.school}</Text>
                  </View>
                ) : null}
                {user.height ? (
                  <View style={styles.infoItem}>
                    <Ionicons name="resize-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{user.height}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* ── Now Playing ── */}
          {user.currentTrack ? (
            <View style={styles.nowPlayingCard}>
              <View style={styles.nowPlayingDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nowPlayingLabel}>Now Playing</Text>
                <Text style={styles.nowPlayingTrack} numberOfLines={1}>
                  {user.currentTrack.title}
                </Text>
                <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                  {user.currentTrack.artist}
                </Text>
              </View>
              <Ionicons name="musical-note" size={20} color="#1DB954" />
            </View>
          ) : null}

          {/* ── Prompts ── */}
          {user.prompts && user.prompts.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About {user.displayName}</Text>
              {user.prompts.map((prompt, i) => (
                <View key={i} style={styles.promptCard}>
                  <Text style={styles.promptQuestion}>{prompt.question}</Text>
                  <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => openCompliment(prompt)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="heart-outline" size={18} color={Colors.primary} />
                    <Text style={styles.heartBtnText}>Compliment this</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}

          {/* ── Sound Profile ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound Profile</Text>

            <View style={styles.genreRow}>
              {user.topGenres.map((g) => (
                <View key={g} style={[styles.genreChip, { backgroundColor: genreColor(g) + '22' }]}>
                  <Text style={[styles.genreChipText, { color: genreColor(g) }]}>{g}</Text>
                </View>
              ))}
            </View>

            <View style={styles.artistList}>
              {user.topArtists.map((artist, i) => (
                <View key={artist} style={styles.artistRow}>
                  <View style={[styles.artistRank, { backgroundColor: (user.avatarColor ?? Colors.primary) + '33' }]}>
                    <Text style={[styles.artistRankText, { color: user.avatarColor ?? Colors.primary }]}>{i + 1}</Text>
                  </View>
                  <Text style={styles.artistName}>{artist}</Text>
                  <Ionicons name="musical-notes" size={14} color={Colors.textTertiary} />
                </View>
              ))}
            </View>

            <View style={styles.compatBreakdown}>
              <Text style={styles.compatBreakdownLabel}>Compatibility breakdown</Text>
              {[
                { label: 'Genres', value: user.compatibilityBreakdown.genre },
                { label: 'Artists', value: user.compatibilityBreakdown.artist },
                { label: 'Vibe', value: user.compatibilityBreakdown.audio },
              ].map(({ label, value }) => (
                <View key={label} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{label}</Text>
                  <View style={styles.breakdownBarBg}>
                    <View
                      style={[
                        styles.breakdownBar,
                        {
                          width: `${Math.round(value * 100)}%` as any,
                          backgroundColor: compatColor(Math.round(value * 100)),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.breakdownPct, { color: compatColor(Math.round(value * 100)) }]}>
                    {Math.round(value * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Action bar ── */}
        <View style={styles.actionBar}>
          {isOwnProfile ? (
            <TouchableOpacity
              style={styles.connectBtn}
              onPress={onEditProfile ?? onClose}
              activeOpacity={0.85}
            >
              <Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
              <Text style={styles.connectBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.connectBtn, connected && styles.connectBtnDone]}
              onPress={handleConnect}
              activeOpacity={connected ? 1 : 0.85}
              disabled={connected}
            >
              <Ionicons
                name={connected ? 'checkmark-circle' : 'person-add-outline'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.connectBtnText}>
                {connected ? 'Request Sent' : `Connect with ${user.displayName}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Compliment sub-modal ── */}
      <Modal
        visible={complimentVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setComplimentVisible(false)}
      >
        <TouchableOpacity
          style={styles.subModalOverlay}
          activeOpacity={1}
          onPress={() => setComplimentVisible(false)}
        />
        <View style={[styles.subModalSheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Send a compliment</Text>
          {selectedPrompt ? (
            <View style={styles.modalPromptPreview}>
              <Text style={styles.modalPromptPreviewText} numberOfLines={2}>
                {selectedPrompt.question}
              </Text>
            </View>
          ) : null}
          <TextInput
            style={styles.complimentInput}
            value={complimentText}
            onChangeText={setComplimentText}
            placeholder={`Say something to ${user.displayName}...`}
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={200}
            autoFocus
          />
          <Text style={styles.charCount}>{complimentText.length}/200</Text>
          <TouchableOpacity
            style={[styles.sendBtn, (!complimentText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={sendCompliment}
            disabled={!complimentText.trim() || sending}
          >
            <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send & Connect'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => { setComplimentVisible(false); handleConnect(); }}
          >
            <Text style={styles.skipBtnText}>Just connect (no message)</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Hero
  heroContainer: {
    width: SCREEN_W,
    height: SCREEN_W * 1.2,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  photo: {
    width: SCREEN_W,
    height: SCREEN_W * 1.2,
    resizeMode: 'cover',
  },
  avatarHero: {
    width: SCREEN_W,
    height: SCREEN_W * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHeroInitial: {
    fontSize: 100,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  dotRow: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 18,
    borderRadius: 3,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compatOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  compatOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Identity
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  ageText: {
    fontSize: 24,
    fontWeight: '400',
    color: Colors.textPrimary,
  },
  usernameText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoList: {
    gap: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // Now Playing
  nowPlayingCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: '#1DB95422',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#1DB95444',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nowPlayingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1DB954',
  },
  nowPlayingLabel: {
    fontSize: 10,
    color: '#1DB954',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nowPlayingTrack: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  nowPlayingArtist: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Prompts
  promptCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  promptQuestion: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  promptAnswer: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  heartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  heartBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Genres
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Artists
  artistList: {
    gap: 8,
    marginBottom: Spacing.lg,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  artistRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistRankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  artistName: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },

  // Compat breakdown
  compatBreakdown: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  compatBreakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    width: 52,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  breakdownBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownPct: {
    width: 36,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 34,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  connectBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  connectBtnDone: {
    backgroundColor: Colors.surface2,
  },
  connectBtnText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Compliment sub-modal
  subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  subModalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  modalPromptPreview: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  modalPromptPreviewText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  complimentInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  charCount: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  sendBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
