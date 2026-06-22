/**
 * Your Connection(s) — slot-gated delivery, NOT an endless deck.
 *
 * Enforced scarcity (PRD/Technical-design): a man has 1 slot, a woman 2. We
 * surface ONE curated candidate into an open slot at a time, capped at 2 new
 * deliveries / rolling 7 days. Opt-in (♥) opens a connection into that slot;
 * decline (✕) frees the slot and the pair is never re-suggested — the structural
 * cost that forces a genuine choice instead of endless scrolling. There is no
 * infinite stack to swipe through.
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
import { getDeck, getMyBirth, getMyCompatMode, getMyGender } from '../../src/data/store';
import { hydrateAstro } from '../../src/data/matching';
import {
  getSlotsView, deliverCandidate, optInCandidate, declineSlot, SlotsView,
} from '../../src/data/slots';
import { MatchResult, maritalLabel, Gender } from '../../src/data/types';
import { haptic } from '../../src/lib/haptics';

export default function DailyMatch() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [view, setView] = useState<SlotsView | null>(null);
  const [gender, setGender] = useState<Gender | undefined>();
  // The candidate currently surfaced into an open slot (one at a time).
  const [candidate, setCandidate] = useState<MatchResult | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const g = await getMyGender();
    setGender(g);
    const v = await getSlotsView(g);
    setView(v);

    // If there's room (open slot + under weekly cap), surface the next eligible
    // candidate (top of the ranked deck, past-pairs already excluded by getDeck).
    if (v.canReceiveDelivery) {
      const deck = await getDeck();
      const pendingId = v.slots.find((s) => s.state === 'candidate_pending')?.candidateId;
      const next = pendingId ? deck.find((m) => m.profile.id === pendingId) ?? deck[0] : deck[0];
      if (next) {
        // Reserve the slot for this candidate if not already pending.
        if (!pendingId) await deliverCandidate(next.profile.id, g);
        setCandidate(next);
        setView(await getSlotsView(g));
      } else {
        setCandidate(null);
      }
    } else {
      // A slot may hold a pending candidate already delivered this week.
      const pendingId = v.slots.find((s) => s.state === 'candidate_pending')?.candidateId;
      if (pendingId) {
        const deck = await getDeck();
        setCandidate(deck.find((m) => m.profile.id === pendingId) ?? null);
      } else {
        setCandidate(null);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Lazily fuse astrology for the surfaced candidate (never blocks the UI).
  useEffect(() => {
    if (!candidate) return;
    if (candidate.fused?.astroAvailable || candidate.fused?.astro) return;
    let alive = true;
    (async () => {
      const birth = await getMyBirth();
      if (!birth || !alive) return;
      const mode = await getMyCompatMode();
      const fused = await hydrateAstro(birth, candidate, mode);
      if (!alive) return;
      setCandidate((cur) => (cur ? { ...cur, fused, score: fused.score } : cur));
    })();
    return () => { alive = false; };
  }, [candidate]);

  const onLike = async (m: MatchResult) => {
    if (busy) return;
    setBusy(true);
    // Opt-in → the connection opens into the slot (counterpart auto-opts-in; sim seam).
    await optInCandidate(m.profile.id, gender);
    haptic.success();
    setCandidate(null);
    setBusy(false);
    router.push({ pathname: '/match/celebration', params: { id: m.profile.id } });
  };
  const onPass = async (m: MatchResult) => {
    if (busy) return;
    setBusy(true);
    // Decline → frees the slot, pair never returns (forward-only, no penalty).
    await declineSlot(m.profile.id, gender);
    haptic.medium();
    setCandidate(null);
    setBusy(false);
    load();
  };

  if (!view) {
    return (
      <CinematicBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.primary} />
        </View>
      </CinematicBackground>
    );
  }

  const activeCount = view.slots.filter((s) => s.state === 'active').length;
  const capReached = view.deliveriesThisWeek >= view.deliveryCap;
  const slotsFull = view.openCount === 0;

  return (
    <CinematicBackground>
      <View style={{ flex: 1, paddingTop: insets.top + t.spacing.md, paddingBottom: insets.bottom + 80 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: t.spacing.xl }}>
          <View>
            <Text variant="overline" color="textFaint" uppercase>Your connection{view.capacity > 1 ? 's' : ''}</Text>
            <Text variant="displayLg">Slots</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <SlotPips t={t} view={view} />
            <Pressable onPress={() => router.push('/settings/theme')} hitSlop={12}
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.border }}>
              <Text variant="title" color="textMuted">⚙</Text>
            </Pressable>
          </View>
        </View>

        {/* One candidate at a time — no endless stack */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: t.spacing.md }}>
          {candidate ? (
            <SwipeCard onLike={() => onLike(candidate)} onPass={() => onPass(candidate)} style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
              <MatchCardBody m={candidate} t={t} width={width} height={height} onReading={() => router.push({ pathname: '/match/[id]/report', params: { id: candidate.profile.id } })} />
            </SwipeCard>
          ) : slotsFull ? (
            <Empty t={t} title={`Your ${activeCount > 1 ? activeCount + ' connections are' : 'connection is'} open`}
              body="Focus on who you've matched with. A slot frees up if a connection ends — that's the point: real attention, not endless scrolling."
              cta="Go to Matches" onCta={() => router.push('/(tabs)/matches')} />
          ) : capReached ? (
            <Empty t={t} title="That's this week's introductions"
              body="We deliver a small number of genuine, curated matches each week — never a feed to grind through. Your next one arrives soon."
              cta="See who you've matched" onCta={() => router.push('/(tabs)/matches')} />
          ) : (
            <Empty t={t} title="No one to introduce right now"
              body="We only surface people who genuinely fit your lens. A fresh, verified candidate will arrive when there's a real match."
              cta="Adjust how we match you" onCta={() => router.push('/settings/theme')} />
          )}
        </View>

        {/* Opt-in / decline — the only two choices (no hoarding) */}
        {candidate && (
          <View style={{ alignItems: 'center', paddingHorizontal: t.spacing.xl, gap: t.spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: t.spacing.xl }}>
              <RoundBtn t={t} label="✕" tone="danger" onPress={() => onPass(candidate)} />
              <RoundBtn t={t} label="♥" tone="success" big onPress={() => onLike(candidate)} />
            </View>
            <Text variant="caption" color="textFaint" center>
              Decline freely — it’s free and frees the slot. We won’t flood you with replacements.
            </Text>
          </View>
        )}
      </View>
    </CinematicBackground>
  );
}

/** Slot pips: filled = active/pending, hollow = open. Communicates scarcity. */
function SlotPips({ t, view }: { t: ReturnType<typeof useTheme>; view: SlotsView }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {view.slots.map((s) => (
        <View key={s.index} style={{
          width: 12, height: 12, borderRadius: 12,
          borderWidth: 1.5, borderColor: t.colors.primary,
          backgroundColor: s.state === 'open' ? 'transparent' : t.colors.primary,
        }} />
      ))}
    </View>
  );
}

function MatchCardBody({ m, t, width, height, onReading }: { m: MatchResult; t: ReturnType<typeof useTheme>; width: number; height: number; onReading?: () => void }) {
  const cardW = width - t.spacing.xl * 2;
  const cardH = height * 0.62;
  return (
    <View style={{ width: cardW, height: cardH, borderRadius: t.radii.xl, overflow: 'hidden', backgroundColor: t.colors.bgElevated, shadowColor: t.colors.primary, shadowOpacity: t.feel.glow.opacity, shadowRadius: t.feel.glow.radius, shadowOffset: { width: 0, height: 12 }, elevation: 12 }}>
      <Image source={m.profile.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
      <LinearGradient colors={['transparent', 'rgba(10,6,16,0.5)', 'rgba(10,6,16,0.95)']} locations={[0.35, 0.65, 1]} style={StyleSheet.absoluteFill} />

      {/* Score ring top-right */}
      <View style={{ position: 'absolute', top: t.spacing.lg, right: t.spacing.lg, alignItems: 'center' }}>
        <CompatibilityRing score={m.score} size={76} />
        {m.fused?.astro && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: t.radii.pill, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 }}>
            <Text variant="caption" color="textOnImage" onImage>psych+astro</Text>
          </View>
        )}
      </View>

      {/* Bottom info */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: t.spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="displayXl" color="textOnImage" onImage>{m.profile.name}, {m.profile.age}</Text>
          {m.profile.verified?.photo && (
            <View style={{ width: 22, height: 22, borderRadius: 22, backgroundColor: t.colors.success, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="caption" color="textOnPrimary">✓</Text>
            </View>
          )}
        </View>
        <Text variant="label" color="textOnImageMuted" onImage style={{ marginTop: 4 }}>
          {[m.profile.city, maritalLabel(m.profile.maritalStatus)].filter(Boolean).join('  ·  ')}
        </Text>
        <Text variant="body" color="textOnImageMuted" onImage style={{ marginTop: t.spacing.sm }} numberOfLines={1}>{m.profile.blurb}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.md }}>
          {m.reasons.slice(0, 3).map((r) => (
            <View key={r.dim} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: 6 }}>
              <Text variant="label" color="textOnImage" onImage>{r.dim}</Text>
              <Text variant="label" color="textOnImageMuted" onImage>{r.pct}%</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={onReading} style={{ marginTop: t.spacing.lg, alignSelf: 'flex-start' }}>
          <Text variant="label" color="textOnImage" onImage>✦ See full reading  →</Text>
        </Pressable>
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

function Empty({ t, title, body, cta, onCta }: { t: ReturnType<typeof useTheme>; title: string; body: string; cta?: string; onCta?: () => void }) {
  return (
    <GlassCard glow style={{ marginHorizontal: t.spacing.xl, alignItems: 'center' }}>
      <Text variant="headline" center>{title}</Text>
      <Text variant="body" color="textMuted" center style={{ marginTop: t.spacing.sm }}>{body}</Text>
      {cta && onCta && (
        <View style={{ marginTop: t.spacing.lg, width: '100%' }}>
          <Button label={cta} variant="secondary" onPress={onCta} />
        </View>
      )}
    </GlassCard>
  );
}
