/**
 * Chat / Karmic Threads — intimate, premium messaging.
 *
 * Glassy message bubbles over the cinematic backdrop, a featured "Soul Probe"
 * card that elevates a meaningful question above small-talk, and a privacy note
 * that contact details stay locked. Input bar is glass with a glowing send.
 *
 * Messages are placeholders; the real send path enforces no-number-sharing on
 * the backend (services/contact_filter.py).
 */
import React from 'react';
import { View, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { useTheme } from '../../src/theme/ThemeProvider';
import { haptic } from '../../src/lib/haptics';

const AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop';

type Msg = { id: string; me: boolean; text: string; time: string };
const THREAD: Msg[] = [
  { id: '1', me: false, text: 'I felt a sudden shift in my energy this morning — like I was on the edge of something new.', time: '09:14' },
  { id: '2', me: true, text: 'I’ve been feeling that too, especially when I sit quietly at dawn.', time: '10:42' },
];

export default function Chat() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = React.useState('');

  return (
    <CinematicBackground>
      {/* Header */}
      <View style={{ paddingTop: insets.top + t.spacing.sm, paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text variant="title" color="textMuted">‹</Text></Pressable>
        <Image source={AVATAR} style={{ width: 40, height: 40, borderRadius: 40 }} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text variant="title">Aria</Text>
          <Text variant="caption" color="success">Aligned in the 8th house · online</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.md, paddingBottom: t.spacing.md }}>
        {THREAD.map((m, i) => (
          <Reveal key={m.id} index={i}>
            <Bubble m={m} t={t} />
          </Reveal>
        ))}

        {/* Featured soul probe */}
        <Reveal index={THREAD.length}>
          <GlassCard glow style={{ marginVertical: t.spacing.lg }}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="overline" color="accent" uppercase>Soul probe</Text>
              <Text variant="headline" center style={{ marginTop: t.spacing.sm, fontFamily: t.fontFamily.displayItalic }}>
                “What is a fear you’ve recently released that has let more light into your life?”
              </Text>
              <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.lg }}>
                <Pressable onPress={() => haptic.light()} style={{ backgroundColor: t.colors.primary, paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm, borderRadius: t.radii.pill }}>
                  <Text variant="label" color="textOnPrimary">Answer privately</Text>
                </Pressable>
                <Pressable style={{ borderWidth: 1.5, borderColor: t.colors.border, paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm, borderRadius: t.radii.pill }}>
                  <Text variant="label" color="textMuted">Skip</Text>
                </Pressable>
              </View>
            </View>
          </GlassCard>
        </Reveal>

        <Reveal index={THREAD.length + 1}>
          <Bubble m={{ id: 'x', me: false, text: 'The light feels warmer today. ✨', time: '11:03' }} t={t} />
        </Reveal>
      </ScrollView>

      {/* Glass input bar */}
      <View style={{ paddingHorizontal: t.spacing.lg, paddingBottom: insets.bottom + t.spacing.sm, paddingTop: t.spacing.sm }}>
        <Text variant="caption" color="textFaint" center style={{ marginBottom: t.spacing.sm }}>
          Phone numbers &amp; socials are blocked — contact unlocks only on a mutual match.
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          <View style={{ flex: 1, backgroundColor: t.colors.bgElevated, borderRadius: t.radii.pill, borderWidth: 1, borderColor: t.colors.border, paddingHorizontal: t.spacing.lg, height: 50, justifyContent: 'center' }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Share something true…"
              placeholderTextColor={t.colors.textFaint}
              style={{ color: t.colors.text, fontFamily: t.fontFamily.body, fontSize: 15 }}
            />
          </View>
          <Pressable
            onPress={() => { haptic.light(); setDraft(''); }}
            style={{ width: 50, height: 50, borderRadius: 50, alignItems: 'center', justifyContent: 'center', shadowColor: t.colors.primary, shadowOpacity: t.feel.glow.opacity, shadowRadius: t.feel.glow.radius, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
            <LinearGradient colors={t.gradients.brand} style={StyleSheet.absoluteFill as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <Text variant="title" color="textOnPrimary" style={{ marginTop: -2 }}>↑</Text>
          </Pressable>
        </View>
      </View>
    </CinematicBackground>
  );
}

function Bubble({ m, t }: { m: Msg; t: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '82%', marginBottom: t.spacing.md }}>
      <View
        style={{
          backgroundColor: m.me ? t.colors.primary : t.colors.bgElevated,
          borderRadius: t.radii.lg,
          borderTopRightRadius: m.me ? t.radii.sm : t.radii.lg,
          borderTopLeftRadius: m.me ? t.radii.lg : t.radii.sm,
          borderWidth: m.me ? 0 : 1,
          borderColor: t.colors.border,
          paddingHorizontal: t.spacing.lg,
          paddingVertical: t.spacing.md,
        }}>
        <Text variant="bodyLg" color={m.me ? 'textOnPrimary' : 'text'}>{m.text}</Text>
      </View>
      <Text variant="caption" color="textFaint" style={{ marginTop: 4, alignSelf: m.me ? 'flex-end' : 'flex-start' }}>{m.time}</Text>
    </View>
  );
}
