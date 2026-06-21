/**
 * Compatibility Report — the premium "why you fit" reading for a pair.
 * Fuses psychology (6 dims) + astrology (Ashtakoot/36, per-area, doshas, verdict
 * from the Karmian API) into one explainable score, and HONESTLY shows where the
 * two lenses agree or differ. Shareable. Astrology is a complementary lens, never
 * the sole verdict.
 */
import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Share, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CinematicBackground } from '../../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../../src/components/fx/GlassCard';
import { Reveal } from '../../../src/components/fx/Reveal';
import { Text } from '../../../src/components/Text';
import { Button } from '../../../src/components/Button';
import { Chip } from '../../../src/components/Chip';
import { CompatibilityRing } from '../../../src/components/CompatibilityRing';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { getMatchFor } from '../../../src/data/store';
import { agreementCopy } from '../../../src/data/fusion';
import { computeIntentSignal, isSerious } from '../../../src/data/intent';
import { MatchResult } from '../../../src/data/types';

export default function Report() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [m, setM] = useState<MatchResult | null | undefined>(undefined);

  useEffect(() => { (async () => setM(await getMatchFor(id)))(); }, [id]);

  if (m === undefined) {
    return <CinematicBackground><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={t.colors.primary} /></View></CinematicBackground>;
  }
  if (!m) {
    return <CinematicBackground><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xl }}><Text variant="headline" center>Reading not found</Text><Button label="Back" variant="ghost" onPress={() => router.back()} style={{ marginTop: t.spacing.lg }} /></View></CinematicBackground>;
  }

  const f = m.fused!;
  const astro = f.astro;

  const INTENT_LABEL: Record<string, Record<string, string>> = {
    household: { shared: 'Shared household', i_lead: 'Leads household', partner_leads: 'Partner leads household', flexible: 'Flexible on household' },
    careers: { both_continue: 'Both careers continue', one_focuses_home: 'One focuses on home', flexible: 'Flexible on careers' },
    kids: { yes: 'Wants children', maybe_later: 'Kids maybe later', no: 'No children', open: 'Open about kids' },
    kidsCare: { shared: 'Shared parenting', i_lead: 'Leads parenting', partner_leads: 'Partner leads parenting', support_help: 'Parenting with support' },
    finances: { joint: 'Joint finances', separate: 'Separate finances', split_shared: 'Split & shared finances', flexible: 'Flexible on finances' },
  };
  const intentChips = Object.entries(m.profile.intentions ?? {})
    .filter(([k, v]) => INTENT_LABEL[k] && typeof v === 'string')
    .map(([k, v]) => INTENT_LABEL[k][v as string])
    .filter(Boolean) as string[];

  const share = () => {
    Share.share({
      message: `${m.profile.name} & I are ${f.score}% aligned on Celestial Soul Connection — ${f.psych.score}% psychological, ${astro ? astro.compositePct + '% astrological' : 'psychology-led'}. ✦`,
    });
  };

  const heat = (p: number) => (p >= 85 ? t.colors.heat3 : p >= 70 ? t.colors.heat2 : p >= 50 ? t.colors.heat1 : t.colors.heat0);

  const serious = isSerious(computeIntentSignal({ psych: m.profile.psych, hasPhoto: !!m.profile.photo, hasBio: !!m.profile.bio, hasBirth: !!m.profile.birth, interestCount: m.profile.interests?.length ?? 0, intentions: m.profile.intentions ?? {} }));

  return (
    <CinematicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + t.spacing.xl }}>
        {/* Hero header — full-bleed photo with the fused score over it */}
        <View style={{ height: 360 }}>
          <Image source={m.profile.photo} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={300} />
          <LinearGradient colors={['rgba(8,5,14,0.25)', 'rgba(8,5,14,0.4)', 'rgba(8,5,14,0.96)']} locations={[0, 0.45, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ position: 'absolute', top: insets.top + t.spacing.sm, left: t.spacing.lg }}>
            <Text variant="headline" color="textOnImage" onImage>‹</Text>
          </Pressable>
          <View style={{ position: 'absolute', left: t.spacing.xl, right: t.spacing.xl, bottom: t.spacing.xl, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: t.spacing.md }}>
              <Text variant="overline" color="textOnImageMuted" onImage uppercase>Compatibility reading</Text>
              <Text variant="displayLg" color="textOnImage" onImage style={{ marginTop: 4 }}>You & {m.profile.name}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.sm }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: 6 }}>
                  <Text variant="label" color="textOnImage" onImage>{astro ? 'Psych + Astro' : 'Psychology-led'}</Text>
                </View>
                {serious && (
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: 6 }}>
                    <Text variant="label" color="textOnImage" onImage>✦ Serious</Text>
                  </View>
                )}
              </View>
            </View>
            <CompatibilityRing score={f.score} size={96} />
          </View>
        </View>

        <View style={{ paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.xl }}>
        {/* Agreement line — the honest framing */}
        <Reveal index={1}>
          <GlassCard glow>
            <Text variant="bodyLg" center style={{ fontFamily: t.fontFamily.displayItalic }}>{agreementCopy(f)}</Text>
          </GlassCard>
        </Reveal>

        {/* Psychology breakdown */}
        <Reveal index={2}>
          <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.md }}>Psychological fit · {f.psych.score}%</Text>
          <GlassCard>
            {f.psych.dims.map((d) => (
              <View key={d.key} style={{ marginBottom: t.spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text variant="body">{d.label}</Text>
                  <Text variant="label" color="textMuted">{d.pct}%</Text>
                </View>
                <Bar t={t} pct={d.pct} color={heat(d.pct)} />
              </View>
            ))}
          </GlassCard>
        </Reveal>

        {/* Astrology breakdown */}
        {astro && (
          <Reveal index={3}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: t.spacing['2xl'], marginBottom: t.spacing.md }}>
              <Text variant="title">Astrological fit · {astro.compositePct}%</Text>
              {astro.estimated && <Chip label="estimated" tone="neutral" />}
            </View>
            <GlassCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.md }}>
                <Text variant="displayLg" color="primary">{astro.ashtakootPoints}<Text variant="body" color="textMuted">/{astro.ashtakootMax}</Text></Text>
                <Text variant="body" color="textMuted" style={{ flex: 1 }}>Guna Milan (Ashtakoot) · {astro.level}</Text>
              </View>
              {astro.areas.map((a) => (
                <View key={a.label} style={{ marginBottom: t.spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text variant="body">{a.label}</Text>
                    <Text variant="label" color="textMuted">{a.pct}%</Text>
                  </View>
                  <Bar t={t} pct={a.pct} color={heat(a.pct)} />
                </View>
              ))}
              {astro.doshas.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.sm }}>
                  {astro.doshas.map((d) => <Chip key={d} label={d} tone="danger" />)}
                </View>
              )}
              {!!astro.recommendation && (
                <Text variant="caption" color="textMuted" style={{ marginTop: t.spacing.md }}>{astro.recommendation}</Text>
              )}
            </GlassCard>
          </Reveal>
        )}

        {/* Life intentions — chip vitals, not a box */}
        {!!intentChips.length && (
          <Reveal index={4}>
            <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.sm }}>Life intentions</Text>
            <Text variant="caption" color="textMuted" style={{ marginBottom: t.spacing.md }}>How {m.profile.name} sees managing a life together:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
              {intentChips.map((c) => <Chip key={c} label={c} tone="primary" />)}
            </View>
            {m.profile.intentions?.acknowledgedSelfManage && (
              <Text variant="caption" color="success" style={{ marginTop: t.spacing.md }}>
                ✓ Open to a shared intentions agreement — align on these together before committing.
              </Text>
            )}
          </Reveal>
        )}

        {/* Background-check disclaimer — accent rule, not a box */}
        <Reveal index={5}>
          <View style={{ marginTop: t.spacing['2xl'], borderLeftWidth: 2, borderLeftColor: t.colors.accent, paddingLeft: t.spacing.lg }}>
            <Text variant="label" color="accent">Compatibility ≠ a background check</Text>
            <Text variant="caption" color="textMuted" style={{ marginTop: t.spacing.sm }}>
              Even a high score reflects only psychological & astrological fit. It does NOT verify
              identity, history, or intentions. Always do your own background verification before
              meeting or committing. Dedicated background-verification services are coming to the app.
            </Text>
          </View>
        </Reveal>

        <Reveal index={6}>
          <Text variant="caption" color="textFaint" center style={{ marginVertical: t.spacing.xl }}>
            Astrology is a complementary lens, offered alongside research-based psychology — never a
            sole verdict. Trust your own sense of connection above any number.
          </Text>
          <View style={{ gap: t.spacing.md }}>
            <Button label="Share this reading" onPress={share} />
            <Button label="Open a thread" variant="secondary" onPress={() => router.push({ pathname: '/match/chat', params: { id: m.profile.id } })} />
          </View>
        </Reveal>
        </View>
      </ScrollView>
    </CinematicBackground>
  );
}

function Bar({ t, pct, color }: { t: ReturnType<typeof useTheme>; pct: number; color: string }) {
  return (
    <View style={{ height: 8, borderRadius: 8, backgroundColor: t.colors.bgSunken, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(4, Math.min(100, pct))}%`, height: 8, borderRadius: 8, backgroundColor: color }} />
    </View>
  );
}
