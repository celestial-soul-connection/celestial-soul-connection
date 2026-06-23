/**
 * Today — the daily celestial home and the app's heartbeat. The user is NEVER
 * idle here, even with no match to act on:
 *   • Star of the Day — a calm celestial reading + a gentle intention (delight,
 *     not a decision; cosmetic per vision §4).
 *   • Your soul today — routes to Discover if a curated match is waiting.
 *   • Nurture — a nudge toward an existing connection / unstarted thread.
 *   • Resonance — souls drawn to you.
 * This is the landing place that answers "what do I do next?".
 */
import React, { useCallback, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { SkyScreen } from '../../src/components/SkyScreen';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getMyBirth, getMyProfile, getConversations, getResonance, Conversation } from '../../src/data/store';
import { getSlotsView } from '../../src/data/slots';
import { getMyGender } from '../../src/data/store';
import { starOfDay, StarReading } from '../../src/data/starOfDay';
import { haptic } from '../../src/lib/haptics';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Today() {
  const t = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [star, setStar] = useState<StarReading | null>(null);
  const [hasFreshMatch, setHasFreshMatch] = useState(false);
  const [nurture, setNurture] = useState<Conversation | null>(null);
  const [resonanceCount, setResonanceCount] = useState(0);

  useFocusEffect(useCallback(() => {
    (async () => {
      const [birth, profile, gender] = [await getMyBirth(), await getMyProfile(), await getMyGender()];
      setName((profile.name ?? '').split(' ')[0] ?? '');
      setStar(starOfDay(birth?.date, todayIso()));

      const view = await getSlotsView(gender);
      setHasFreshMatch(view.canReceiveDelivery || view.slots.some((s) => s.state === 'candidate_pending'));

      const convos = await getConversations();
      // Nurture: prefer an unstarted thread, else the most stale started one.
      setNurture(convos.find((c) => !c.started) ?? convos[0] ?? null);
      setResonanceCount((await getResonance()).length);
    })();
  }, []));

  const greeting = (() => {
    const h = new Date().getHours();
    const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    return name ? `Good ${part}, ${name}` : `Good ${part}`;
  })();

  return (
    <SkyScreen>
      <Reveal index={0}>
        <Text variant="overline" color="textFaint" uppercase>Today</Text>
        <Text variant="displayLg">{greeting}</Text>
      </Reveal>

      {/* Star of the Day — the celestial heartbeat */}
      {star && (
        <Reveal index={1}>
          <GlassCard gold style={{ marginTop: t.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
              <Text variant="headline" color="highlight">{star.signGlyph}</Text>
              <Text variant="overline" color="highlight" uppercase>Star of the day · {star.sign}</Text>
            </View>
            <Text variant="headline" style={{ marginTop: t.spacing.sm, fontFamily: t.fontFamily.displayItalic }}>{star.title}</Text>
            <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm, lineHeight: 22 }}>{star.body}</Text>
            <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.md, alignItems: 'flex-start' }}>
              <Text variant="label" color="highlight">✦ Today’s intention</Text>
            </View>
            <Text variant="body" style={{ marginTop: 4 }}>{star.intention}</Text>
          </GlassCard>
        </Reveal>
      )}

      {/* Your soul today — only when there's a fresh curated match waiting */}
      {hasFreshMatch && (
        <Reveal index={2}>
          <Pressable onPress={() => { haptic.light(); router.push('/(tabs)/discover'); }}
            style={{ marginTop: t.spacing.lg, padding: t.spacing.lg, borderRadius: t.radii.lg, borderWidth: 1, borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft, flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <Text variant="headline" color="primary">✦</Text>
            <View style={{ flex: 1 }}>
              <Text variant="title" color="primary">A soul is waiting for you</Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>One curated introduction, chosen for today.</Text>
            </View>
            <Text variant="title" color="primary">›</Text>
          </Pressable>
        </Reveal>
      )}

      {/* Nurture — keep existing connections warm */}
      {nurture && (
        <Reveal index={3}>
          <Text variant="overline" color="textFaint" uppercase style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.sm }}>Keep it warm</Text>
          <Pressable onPress={() => { haptic.light(); router.push({ pathname: '/match/chat', params: { id: nurture.profile.id } }); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <Image source={nurture.profile.photo} style={{ width: 54, height: 54, borderRadius: 54 }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text variant="title">{nurture.profile.name}</Text>
              <Text variant="caption" color={nurture.started ? 'textMuted' : 'highlight'} numberOfLines={1} style={{ marginTop: 2 }}>
                {nurture.started ? (nurture.lastText ?? '') : '✦ Send the first soul probe'}
              </Text>
            </View>
            <Text variant="title" color="textFaint">›</Text>
          </Pressable>
        </Reveal>
      )}

      {/* Resonance */}
      {resonanceCount > 0 && (
        <Reveal index={4}>
          <Pressable onPress={() => { haptic.light(); router.push('/match/resonance'); }}
            style={{ marginTop: t.spacing['2xl'], flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <Text variant="headline" color="highlight">✦</Text>
            <View style={{ flex: 1 }}>
              <Text variant="title">{resonanceCount} {resonanceCount === 1 ? 'soul' : 'souls'} drawn to you</Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>See who resonated, and resonate back.</Text>
            </View>
            <Text variant="title" color="textFaint">›</Text>
          </Pressable>
        </Reveal>
      )}

      {/* If genuinely nothing actionable, the Star + a calm line keep it from feeling empty */}
      {!hasFreshMatch && !nurture && resonanceCount === 0 && (
        <Reveal index={2}>
          <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.xl, lineHeight: 22 }}>
            No new introduction today — and that’s by design. We send a few, genuine souls, never a
            feed to grind. Sit with today’s intention; the right connection is worth the wait.
          </Text>
          <Button label="Refine how we match you" variant="secondary" onPress={() => router.push('/settings/theme')} style={{ marginTop: t.spacing.lg }} />
        </Reveal>
      )}

      <View style={{ height: 90 }} />
    </SkyScreen>
  );
}
