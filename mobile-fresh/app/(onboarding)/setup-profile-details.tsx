import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Modal, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore, calcProfileCompletion, type Prompt } from '@/store/authStore';
import { userService } from '@/services/userService';

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];
const PRONOUNS = ['he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'any'];
const HEIGHTS = ["4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'3\"","6'4\"","6'5\"+"];

const PROMPT_OPTIONS = [
  'The song that changed my life...',
  "We'll vibe if you listen to...",
  'My unpopular music take is...',
  'My go-to album when I\'m sad is...',
  "I'll judge you if you don't like...",
  'My guilty pleasure song is...',
  'My music taste can be described as...',
  'The last concert I went to was...',
  'I go crazy for...',
  'My simple pleasures...',
  "I'm convinced that...",
  'A song I know every word to...',
];

function PhotoSlot({ uri, index, onPick, onRemove }: {
  uri?: string; index: number;
  onPick: (i: number) => void; onRemove: (i: number) => void;
}) {
  const isMandatory = index === 0;
  return (
    <TouchableOpacity
      style={[styles.photoSlot, uri && styles.photoSlotFilled]}
      onPress={() => !uri && onPick(index)}
      activeOpacity={0.8}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.photoImg} />
          <TouchableOpacity style={styles.photoRemove} onPress={() => onRemove(index)}>
            <Ionicons name="close-circle" size={22} color="#fff" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.photoEmpty}>
          <Ionicons name="add" size={28} color={isMandatory ? Colors.primary : Colors.textTertiary} />
          {isMandatory && <Text style={styles.photoRequired}>Required</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

function PromptCard({ prompt, index, onEdit, onChangeQuestion }: {
  prompt: Prompt; index: number;
  onEdit: (i: number, answer: string) => void;
  onChangeQuestion: (i: number) => void;
}) {
  return (
    <View style={styles.promptCard}>
      <TouchableOpacity style={styles.promptQuestion} onPress={() => onChangeQuestion(index)}>
        <Text style={styles.promptQuestionText}>{prompt.question}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
      <TextInput
        style={styles.promptAnswer}
        value={prompt.answer}
        onChangeText={(t) => onEdit(index, t)}
        placeholder="Your answer..."
        placeholderTextColor={Colors.textTertiary}
        multiline
        maxLength={150}
      />
      <Text style={styles.promptCount}>{prompt.answer.length}/150</Text>
    </View>
  );
}

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? Colors.spotify : pct >= 50 ? '#F59E0B' : Colors.primary;
  return (
    <View style={styles.completionWrap}>
      <View style={styles.completionBar}>
        <View style={[styles.completionFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.completionPct, { color }]}>{pct}% complete</Text>
    </View>
  );
}

export default function SetupProfileDetailsScreen() {
  const { user, setUser } = useAuthStore();
  const [photos, setPhotos] = useState<(string | undefined)[]>([undefined, undefined, undefined, undefined, undefined, undefined]);
  const [gender, setGender] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState('');
  const [job, setJob] = useState('');
  const [school, setSchool] = useState('');
  const [location, setLocation] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([
    { question: PROMPT_OPTIONS[0], answer: '' },
    { question: PROMPT_OPTIONS[2], answer: '' },
    { question: PROMPT_OPTIONS[4], answer: '' },
  ]);
  const [promptPickerIndex, setPromptPickerIndex] = useState<number | null>(null);
  const [heightPickerVisible, setHeightPickerVisible] = useState(false);
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const filledPhotos = photos.filter(Boolean) as string[];
  const completion = calcProfileCompletion({
    ...user!,
    age: user?.age ?? 0,
    gender,
    photos: filledPhotos,
    bio,
    prompts,
    job,
    school,
    pronouns,
    location,
  });

  const canContinue = !!gender && filledPhotos.length >= 1;

  const pickPhoto = useCallback(async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = result.assets[0].uri;
        return next;
      });
    }
  }, []);

  const removePhoto = (index: number) => {
    setPhotos((prev) => { const n = [...prev]; n[index] = undefined; return n; });
  };

  const editPromptAnswer = (i: number, answer: string) => {
    setPrompts((prev) => prev.map((p, idx) => idx === i ? { ...p, answer } : p));
  };

  const changePromptQuestion = (i: number, question: string) => {
    setPrompts((prev) => prev.map((p, idx) => idx === i ? { ...p, question } : p));
    setPromptPickerIndex(null);
  };

  const handleContinue = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Upload local photos to Supabase Storage, get CDN URLs
      const uploadedUrls: string[] = [];
      for (let i = 0; i < filledPhotos.length; i++) {
        const localUri = filledPhotos[i];
        // If already a CDN URL (reconnect case), keep as-is
        if (localUri.startsWith('http')) {
          uploadedUrls.push(localUri);
        } else {
          const url = await userService.uploadPhoto(localUri, i);
          uploadedUrls.push(url);
        }
      }

      const filteredPrompts = prompts.filter(p => p.answer.trim());

      // Save profile fields + photos + prompts to Supabase in parallel
      await Promise.all([
        userService.updateProfile({
          gender,
          pronouns,
          bio,
          height,
          job,
          school,
          location,
          profileComplete: completion,
        }),
        userService.savePhotos(uploadedUrls),
        userService.savePrompts(filteredPrompts),
      ]);

      // Update local store
      setUser({
        ...user!,
        gender,
        pronouns,
        bio,
        height,
        job,
        school,
        location,
        photos: uploadedUrls,
        prompts: filteredPrompts,
        profileComplete: completion,
      });

      router.replace('/(onboarding)/connect-music');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Sticky header with completion bar */}
      <View style={styles.header}>
        <Text style={styles.title}>Build your profile</Text>
        <CompletionBar pct={completion} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photos */}
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.sectionSub}>Add at least 1 photo. Up to 6.</Text>
        <View style={styles.photoGrid}>
          {photos.map((uri, i) => (
            <PhotoSlot key={i} uri={uri} index={i} onPick={pickPhoto} onRemove={removePhoto} />
          ))}
        </View>

        {/* Gender */}
        <Text style={styles.sectionTitle}>Gender <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={[styles.picker, gender && styles.pickerFilled]}
          onPress={() => setGenderPickerVisible(true)}
        >
          <Text style={gender ? styles.pickerValue : styles.pickerPlaceholder}>
            {gender || 'Select gender'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Pronouns */}
        <Text style={styles.sectionTitle}>Pronouns</Text>
        <View style={styles.chipRow}>
          {PRONOUNS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.optionChip, pronouns === p && styles.optionChipActive]}
              onPress={() => setPronouns(prev => prev === p ? '' : p)}
            >
              <Text style={[styles.optionChipText, pronouns === p && styles.optionChipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bio */}
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={styles.bioInput}
          value={bio}
          onChangeText={setBio}
          placeholder="Write something about yourself..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={200}
        />
        <Text style={styles.charCount}>{bio.length}/200</Text>

        {/* Prompts */}
        <Text style={styles.sectionTitle}>Prompts</Text>
        <Text style={styles.sectionSub}>Choose up to 3 questions to show on your profile</Text>
        {prompts.map((p, i) => (
          <PromptCard
            key={i}
            prompt={p}
            index={i}
            onEdit={editPromptAnswer}
            onChangeQuestion={() => setPromptPickerIndex(i)}
          />
        ))}

        {/* Height */}
        <Text style={styles.sectionTitle}>Height</Text>
        <TouchableOpacity
          style={[styles.picker, height && styles.pickerFilled]}
          onPress={() => setHeightPickerVisible(true)}
        >
          <Text style={height ? styles.pickerValue : styles.pickerPlaceholder}>
            {height || 'Select height'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Job */}
        <Text style={styles.sectionTitle}>Job title</Text>
        <TextInput
          style={styles.input}
          value={job}
          onChangeText={setJob}
          placeholder="e.g. Software Engineer"
          placeholderTextColor={Colors.textTertiary}
          maxLength={50}
        />

        {/* School */}
        <Text style={styles.sectionTitle}>School / College</Text>
        <TextInput
          style={styles.input}
          value={school}
          onChangeText={setSchool}
          placeholder="e.g. IIT Bombay"
          placeholderTextColor={Colors.textTertiary}
          maxLength={60}
        />

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Mumbai, IN"
          placeholderTextColor={Colors.textTertiary}
          maxLength={40}
        />

        {/* Continue */}
        <TouchableOpacity
          style={[styles.continueBtn, (!canContinue || saving) && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueBtnText}>
              {canContinue ? `Continue  (${completion}% complete)` : 'Add photo & gender to continue'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace('/(onboarding)/connect-music')}
          disabled={saving}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Gender picker modal */}
      <Modal visible={genderPickerVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setGenderPickerVisible(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Gender</Text>
          {GENDERS.map((g) => (
            <TouchableOpacity key={g} style={styles.modalOption} onPress={() => { setGender(g); setGenderPickerVisible(false); }}>
              <Text style={[styles.modalOptionText, gender === g && styles.modalOptionActive]}>{g}</Text>
              {gender === g && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Height picker modal */}
      <Modal visible={heightPickerVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setHeightPickerVisible(false)} />
        <View style={[styles.modalSheet, { maxHeight: 360 }]}>
          <Text style={styles.modalTitle}>Height</Text>
          <FlatList
            data={HEIGHTS}
            keyExtractor={(h) => h}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalOption} onPress={() => { setHeight(item); setHeightPickerVisible(false); }}>
                <Text style={[styles.modalOptionText, height === item && styles.modalOptionActive]}>{item}</Text>
                {height === item && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Prompt picker modal */}
      <Modal visible={promptPickerIndex !== null} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setPromptPickerIndex(null)} />
        <View style={[styles.modalSheet, { maxHeight: 420 }]}>
          <Text style={styles.modalTitle}>Choose a prompt</Text>
          <FlatList
            data={PROMPT_OPTIONS.filter(q => !prompts.some((p, i) => p.question === q && i !== promptPickerIndex))}
            keyExtractor={(q) => q}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => promptPickerIndex !== null && changePromptQuestion(promptPickerIndex, item)}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.sm },
  completionWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  completionBar: { flex: 1, height: 6, backgroundColor: Colors.surface2, borderRadius: 3, overflow: 'hidden' },
  completionFill: { height: '100%', borderRadius: 3 },
  completionPct: { ...Typography.small, fontWeight: '700', minWidth: 80, textAlign: 'right' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionTitle: { ...Typography.caption, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  sectionSub: { ...Typography.small, color: Colors.textTertiary, marginBottom: Spacing.sm, marginTop: -Spacing.xs },
  required: { color: Colors.error },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  photoSlot: { width: '31%', aspectRatio: 3/4, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden', borderStyle: 'dashed' },
  photoSlotFilled: { borderStyle: 'solid', borderColor: Colors.primary },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 6, right: 6 },
  photoEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
  photoRequired: { ...Typography.small, color: Colors.primary, fontWeight: '600' },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  pickerFilled: { borderColor: Colors.primary },
  pickerValue: { ...Typography.bodyMedium, color: Colors.textPrimary },
  pickerPlaceholder: { ...Typography.body, color: Colors.textTertiary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  optionChipActive: { backgroundColor: `${Colors.primary}22`, borderColor: Colors.primary },
  optionChipText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '500' },
  optionChipTextActive: { color: Colors.primary, fontWeight: '700' },
  bioInput: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, ...Typography.body, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, minHeight: 100, textAlignVertical: 'top' },
  charCount: { ...Typography.small, color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },
  promptCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.sm },
  promptQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  promptQuestionText: { ...Typography.caption, color: Colors.primary, fontWeight: '600', flex: 1, marginRight: 8 },
  promptAnswer: { ...Typography.body, color: Colors.textPrimary, minHeight: 64, textAlignVertical: 'top' },
  promptCount: { ...Typography.small, color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },
  input: { height: 52, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, ...Typography.body, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  continueBtn: { height: 56, backgroundColor: Colors.primary, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { ...Typography.bodyMedium, color: '#fff', fontWeight: '700' },
  skipBtn: { height: 44, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm },
  skipText: { ...Typography.body, color: Colors.textTertiary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 40 },
  modalTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalOptionText: { ...Typography.body, color: Colors.textSecondary },
  modalOptionActive: { color: Colors.primary, fontWeight: '700' },
});
