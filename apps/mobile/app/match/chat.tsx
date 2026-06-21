/**
 * Chat / Karmic Threads — FUNCTIONAL intimate messaging.
 *
 * Loads & persists messages from the store, runs the no-number-sharing filter on
 * send (redacting phones/emails/socials with a notice), shows the real matched
 * profile and a featured "soul probe". Premium glass UI over the cinematic bg.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Text } from '../../src/components/Text';
import { useTheme } from '../../src/theme/ThemeProvider';
import { haptic } from '../../src/lib/haptics';
import { SEED_PROFILES, PROBES } from '../../src/data/seedProfiles';
import { getMessages, addMessage, isContactUnlocked, unlockContact } from '../../src/data/store';
import { getEntitlement, contactFeeFor } from '../../src/data/billing';
import { scan } from '../../src/data/contactFilter';
import { Message } from '../../src/data/types';

export default function Chat() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const them = SEED_PROFILES.find((p) => p.id === id) ?? SEED_PROFILES[0];
  const matchId = them.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [fee, setFee] = useState(21);
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    const m = await getMessages(matchId);
    setMessages(m);
    setUnlocked(await isContactUnlocked(matchId));
    setFee(contactFeeFor(await getEntitlement()));
  }, [matchId]);
  useEffect(() => { load(); }, [load]);

  const promptUnlock = () => {
    const body = fee === 0
      ? `You've both aligned. This contact reveal is free on your plan (included). Your consent is logged.`
      : `You've both aligned. For a one-time ₹${fee} (charged to you), you can exchange direct contact details. Your consent is logged.`;
    Alert.alert(`Unlock contact with ${them.name}?`, body, [
      { text: 'Not yet', style: 'cancel' },
      {
        text: fee === 0 ? 'Unlock (free)' : `Pay ₹${fee} & unlock`,
        onPress: async () => { await unlockContact(matchId, fee); haptic.success(); await load(); },
      },
    ]);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    // Once contact is unlocked (paid + consented), stop redacting for this thread.
    const { text: clean, redacted } = unlocked ? { text, redacted: false } : scan(text);
    const msg: Message = { id: 'm_' + Date.now(), matchId, fromMe: true, text: clean, redacted, ts: Date.now() };
    await addMessage(msg);
    setDraft('');
    setNotice(redacted ? 'Contact details are shared only after a confirmed match.' : null);
    haptic.light();
    await load();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <CinematicBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingTop: insets.top + t.spacing.sm, paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Text variant="headline" color="textMuted">‹</Text></Pressable>
          <Image source={them.photo} style={{ width: 40, height: 40, borderRadius: 40 }} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text variant="title">{them.name}</Text>
            <Text variant="caption" color="success">Aligned · {them.city}</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.md, paddingBottom: t.spacing.md }}>
          {/* Featured soul probe at the top of a new thread */}
          {messages.length === 0 && (
            <GlassCard glow style={{ marginBottom: t.spacing.lg }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="overline" color="accent" uppercase>Soul probe</Text>
                <Text variant="headline" center style={{ marginTop: t.spacing.sm, fontFamily: t.fontFamily.displayItalic }}>
                  “{PROBES[0]}”
                </Text>
                <Text variant="caption" color="textMuted" center style={{ marginTop: t.spacing.md }}>
                  Begin with something true rather than small talk.
                </Text>
              </View>
            </GlassCard>
          )}

          {messages.map((m) => (
            <MotiView key={m.id} from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 220 }}>
              <Bubble m={m} t={t} />
            </MotiView>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={{ paddingHorizontal: t.spacing.lg, paddingBottom: insets.bottom + t.spacing.sm, paddingTop: t.spacing.sm }}>
          {notice && (
            <Text variant="caption" color="danger" center style={{ marginBottom: t.spacing.sm }}>{notice}</Text>
          )}
          {unlocked ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: t.spacing.sm }}>
              <Text variant="caption" color="success">✓ Contact unlocked — you can share details directly now.</Text>
            </View>
          ) : (
            <Pressable onPress={promptUnlock} style={{ marginBottom: t.spacing.sm }}>
              <Text variant="caption" color="primary" center>
                Phone numbers &amp; socials are blocked. ✦ Unlock contact ({fee === 0 ? 'free on your plan' : `₹${fee}`})
              </Text>
            </Pressable>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
            <View style={{ flex: 1, backgroundColor: t.colors.bgElevated, borderRadius: t.radii.pill, borderWidth: 1, borderColor: t.colors.border, paddingHorizontal: t.spacing.lg, minHeight: 50, justifyContent: 'center' }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Share something true…"
                placeholderTextColor={t.colors.textFaint}
                onSubmitEditing={send}
                returnKeyType="send"
                style={{ color: t.colors.text, fontFamily: t.fontFamily.body, fontSize: 15, paddingVertical: t.spacing.sm }}
              />
            </View>
            <Pressable onPress={send} style={{ width: 50, height: 50, borderRadius: 50, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              <LinearGradient colors={t.gradients.brand} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              <Text variant="title" color="textOnPrimary" style={{ marginTop: -2 }}>↑</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </CinematicBackground>
  );
}

function Bubble({ m, t }: { m: Message; t: ReturnType<typeof useTheme> }) {
  const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={{ alignSelf: m.fromMe ? 'flex-end' : 'flex-start', maxWidth: '82%', marginBottom: t.spacing.md }}>
      <View
        style={{
          backgroundColor: m.fromMe ? t.colors.primary : t.colors.bgElevated,
          borderRadius: t.radii.lg,
          borderTopRightRadius: m.fromMe ? t.radii.sm : t.radii.lg,
          borderTopLeftRadius: m.fromMe ? t.radii.lg : t.radii.sm,
          borderWidth: m.fromMe ? 0 : 1,
          borderColor: t.colors.border,
          paddingHorizontal: t.spacing.lg,
          paddingVertical: t.spacing.md,
        }}>
        <Text variant="bodyLg" color={m.fromMe ? 'textOnPrimary' : 'text'}>{m.text}</Text>
      </View>
      <Text variant="caption" color="textFaint" style={{ marginTop: 4, alignSelf: m.fromMe ? 'flex-end' : 'flex-start' }}>
        {time}{m.redacted ? ' · filtered' : ''}
      </Text>
    </View>
  );
}
