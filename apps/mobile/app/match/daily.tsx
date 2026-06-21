/**
 * Daily Match — a real swipe DECK (the signature dating interaction).
 *
 * Loads genuinely ranked matches from the store (real scoring vs seed profiles),
 * shows a stack of cards with the next one peeking behind, and lets you swipe:
 * right = align (→ celebration if it's a strong match), left = pass. Each swipe
 * persists, so the deck advances and remembers. Free tier gates to 5/day.
 *
 * Fully works in Expo Go (Gesture Handler + Reanimated + Moti).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, useWindowDimensions, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { SwipeCard } from '../../src/components/fx/SwipeCard';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { CompatibilityRing } from '../../src/components/CompatibilityRing';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getDeck, passProfile, likeProfile, resetDeck } from '../../src/data/store';
import { MatchResult } from '../../src/data/types';
import { haptic } from '../../src/lib/haptics';

const DAILY_LIMIT = 5;

export default function DailyMatch() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [deck, setDeck] = useState<MatchResult[] | null>(null);
  const [index, setIndex] = useState(0);
  const [viewedToday, setViewedToday] = useState(0);

  const load = useCallback(async () => {
    const d = await getDeck();
    setDeck(d);
    setIndex(0);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const advance = () => setIndex((i) => i + 1);

  const onLike = async (m: MatchResult) => {
    await likeProfile(m.profile.id);
    setViewedToday((v) => v + 1);
    advance();
    if (m.score >= 80) {
      router.push({ pathname: '/match/celebration', params: { id: m.profile.id } });
    }
  };
  const onPass = async (m: MatchResult) => {
    await passProfile(m.profile.id);
    setViewedToday((v) => v + 1);
    advance();
  };

  if (!deck) {
    return (
      <CinematicBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.primary} />
        </View>
      </CinematicBackground>
    );
  }

  const remaining = deck.slice(index);
  const limitReached = viewedToday >= DAILY_LIMIT;

  return (
    <CinematicBackground>
      <View style={{ flex: 1, paddingTop: insets.top + t.spacing.md, paddingBottom: insets.bottom + t.spacing.md }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: t.spacing.xl }}>
          <View>
            <Text variant="overline" color="textFaint" uppercase>Your alignment today</Text>
            <Text variant="displayLg">Today's matches</Text>
          </View>
          <Chip label={`${Math.max(0, DAILY_LIMIT - viewedToday)} of ${DAILY_LIMIT} left`} tone="accent" />
        </View>

        {/* Deck */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: t.spacing.md }}>
          {limitReached ? (
            <Empty t={t} title="That's your 5 for today" body="Meaningful connection takes intention. Come back tomorrow for your next aligned matches." onReset={async () => { await resetDeck(); setViewedToday(0); load(); }} />
          ) : remaining.length === 0 ? (
            <Empty t={t} title="You're all caught up" body="No more matches in your deck right now. New aligned souls arrive daily." onReset={async () => { await resetDeck(); setViewedToday(0); load(); }} />
          ) : (
            // Render up to 3 stacked cards; top is swipeable, others peek behind.
            remaining.slice(0, 3).reverse().map((m, ri, arr) => {
              const depth = arr.length - 1 - ri; // 0 = top
              const isTop = depth === 0;
              const card = (
                <MotiView
                  key={m.profile.id}
                  from={{ scale: 0.92 - depth * 0.04, translateY: depth * 14, opacity: 0 }}
                  animate={{ scale: 1 - depth * 0.04, translateY: depth * 14, opacity: 1 }}
                  transition={{ type: 'timing', duration: 320 }}
                  style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                  <MatchCardBody m={m} t={t} width={width} height={height} />
                </MotiView>
              );
              return isTop ? (
                <SwipeCard key={m.profile.id} onLike={() => onLike(m)} onPass={() => onPass(m)} style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                  <MatchCardBody m={m} t={t} width={width} height={height} />
                </SwipeCard>
              ) : card;
            })
          )}
        </View>

        {/* Action buttons (alternative to swiping) */}
        {!limitReached && remaining.length > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: t.spacing.xl, paddingHorizontal: t.spacing.xl }}>
            <RoundBtn t={t} label="✕" tone="danger" onPress={() => { haptic.medium(); onPass(remaining[0]); }} />
            <RoundBtn t={t} label="✦" tone="primary" big onPress={() => router.push('/match/chat')} />
            <RoundBtn t={t} label="♥" tone="success" onPress={() => { haptic.medium(); onLike(remaining[0]); }} />
          </View>
        )}

        <Pressable onPress={() => router.push('/settings/theme')} style={{ alignSelf: 'center', paddingVertical: t.spacing.sm }}>
          <Text variant="label" color="textMuted">✦ Style &amp; privacy</Text>
        </Pressable>
      </View>
    </CinematicBackground>
  );
}

function MatchCardBody({ m, t, width, height }: { m: MatchResult; t: ReturnType<typeof useTheme>; width: number; height: number }) {
  const cardW = width - t.spacing.xl * 2;
  const cardH = height * 0.62;
  return (
    <View style={{ width: cardW, height: cardH, borderRadius: t.radii.xl, overflow: 'hidden', backgroundColor: t.colors.bgElevated, shadowColor: t.colors.primary, shadowOpacity: t.feel.glow.opacity, shadowRadius: t.feel.glow.radius, shadowOffset: { width: 0, height: 12 }, elevation: 12 }}>
      <Image source={m.profile.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
      <LinearGradient colors={['transparent', 'rgba(10,6,16,0.5)', 'rgba(10,6,16,0.95)']} locations={[0.35, 0.65, 1]} style={StyleSheet.absoluteFill} />

      {/* Score ring top-right */}
      <View style={{ position: 'absolute', top: t.spacing.lg, right: t.spacing.lg }}>
        <CompatibilityRing score={m.score} size={76} />
      </View>

      {/* Bottom info */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: t.spacing.xl }}>
        <Text variant="displayLg" color="textOnImage" onImage>{m.profile.name}, {m.profile.age}</Text>
        <Text variant="body" color="textOnImageMuted" onImage style={{ marginTop: 2 }}>{m.profile.blurb}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.md }}>
          {m.reasons.slice(0, 3).map((r) => (
            <View key={r.dim} style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: 5 }}>
              <Text variant="label" color="textOnImage" onImage>{r.dim} · {r.pct}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function RoundBtn({ t, label, tone, onPress, big }: { t: ReturnType<typeof useTheme>; label: string; tone: 'danger' | 'primary' | 'success'; onPress: () => void; big?: boolean }) {
  const size = big ? 68 : 56;
  const color = t.colors[tone];
  return (
    <Pressable onPress={onPress} style={{ width: size, height: size, borderRadius: size, backgroundColor: t.colors.bgElevated, borderWidth: 1.5, borderColor: color, alignItems: 'center', justifyContent: 'center', shadowColor: color, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
      <Text variant="title" style={{ color, fontSize: big ? 26 : 20 }}>{label}</Text>
    </Pressable>
  );
}

function Empty({ t, title, body, onReset }: { t: ReturnType<typeof useTheme>; title: string; body: string; onReset: () => void }) {
  return (
    <GlassCard glow style={{ marginHorizontal: t.spacing.xl, alignItems: 'center' }}>
      <Text variant="headline" center>{title}</Text>
      <Text variant="body" color="textMuted" center style={{ marginTop: t.spacing.sm }}>{body}</Text>
      <View style={{ marginTop: t.spacing.lg, width: '100%' }}>
        <Button label="Reset deck (demo)" variant="secondary" onPress={onReset} />
      </View>
    </GlassCard>
  );
}
