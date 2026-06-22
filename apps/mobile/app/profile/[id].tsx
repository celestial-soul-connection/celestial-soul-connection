/**
 * Candidate profile — Hinge-style scroll-profile: alternating full-bleed photo /
 * inset text, chip vitals (not tables), TrulyMadly-style verified cluster, life
 * intentions, a link to the full reading, and Report. Background-check disclaimer.
 * Uses the shared ProfileKit vocabulary — see memory: profile-ui-design-language.
 */
import React from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import {
  PhotoBlock, PromptBlock, VitalChips, VerifiedCluster, VerifiedBadge, SectionLabel,
} from '../../src/components/profile/ProfileKit';
import { useTheme } from '../../src/theme/ThemeProvider';
import { SEED_PROFILES } from '../../src/data/seedProfiles';
import { reportProfile } from '../../src/data/store';
import { LifeIntentions, maritalLabel } from '../../src/data/types';

const INTENT_LABEL: Record<string, Record<string, string>> = {
  household: { shared: 'Shared household', i_lead: 'Leads the household', partner_leads: 'Partner leads household', flexible: 'Flexible on household' },
  careers: { both_continue: 'Both careers continue', one_focuses_home: 'One focuses on home', flexible: 'Flexible on careers' },
  kids: { yes: 'Wants children', maybe_later: 'Kids maybe later', no: 'No children', open: 'Open about kids' },
  kidsCare: { shared: 'Shared parenting', i_lead: 'Leads parenting', partner_leads: 'Partner leads parenting', support_help: 'Parenting with support' },
  finances: { joint: 'Joint finances', separate: 'Separate finances', split_shared: 'Split & shared finances', flexible: 'Flexible on finances' },
};

export default function CandidateProfile() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = SEED_PROFILES.find((x) => x.id === id);

  if (!p) {
    return <CinematicBackground><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text variant="headline">Profile not found</Text></View></CinematicBackground>;
  }

  const report = () => {
    Alert.alert('Report this profile?', 'They will be removed from your matches. Reports help us keep the community safe.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: async () => { await reportProfile(p.id, 'user_report'); router.back(); } },
    ]);
  };

  const intentions = (p.intentions ?? {}) as LifeIntentions;
  const intentChips = Object.entries(intentions)
    .filter(([k, v]) => INTENT_LABEL[k] && typeof v === 'string')
    .map(([k, v]) => INTENT_LABEL[k][v as string])
    .filter(Boolean);

  // Photos to interleave: the hero + any extras (fall back to the hero so the
  // alternating rhythm still reads with a single seed photo).
  const gallery = (p.photos?.length ? p.photos : [p.photo]).filter(Boolean) as string[];
  const secondPhoto = gallery[1] ?? gallery[0];

  return (
    <CinematicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + t.spacing.xl }}>
        {/* Hero photo — name, age, verified inline, key vitals on scrim */}
        <PhotoBlock uri={p.photo} height={520}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
            <Text variant="displayXl" color="textOnImage" onImage>{p.name}, {p.age}</Text>
            {p.verified?.photo && <VerifiedBadge />}
          </View>
          <Text variant="label" color="textOnImageMuted" onImage style={{ marginTop: 4 }}>
            {[p.city, maritalLabel(p.maritalStatus)].filter(Boolean).join('  ·  ')}
          </Text>
        </PhotoBlock>
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ position: 'absolute', top: insets.top + t.spacing.sm, left: t.spacing.lg }}>
          <Text variant="headline" color="textOnImage" onImage>‹</Text>
        </Pressable>

        <View style={{ paddingHorizontal: t.spacing.xl, marginTop: t.spacing['2xl'], gap: t.spacing['2xl'] }}>
          {/* Their voice — blurb as an expressive prompt-answer */}
          <Reveal index={0}>
            <PromptBlock question="In their words" answer={p.bio || p.blurb} />
          </Reveal>

          {/* Verified cluster — trust signals */}
          <Reveal index={1}>
            <SectionLabel>Verified</SectionLabel>
            <VerifiedCluster signals={[
              { label: '18+', on: true },
              { label: 'Phone', on: !!p.verified?.phone },
              { label: 'Photo', on: !!p.verified?.photo },
            ]} />
          </Reveal>

          {/* Interests as chips */}
          {!!p.interests?.length && (
            <Reveal index={2}>
              <SectionLabel>Into</SectionLabel>
              <VitalChips items={p.interests.map((i) => ({ icon: '✦', label: i }))} />
            </Reveal>
          )}
        </View>

        {/* Second photo — interleaved, full-bleed, keeps the Hinge rhythm */}
        <View style={{ marginTop: t.spacing['2xl'] }}>
          <PhotoBlock uri={secondPhoto} height={460} />
        </View>

        <View style={{ paddingHorizontal: t.spacing.xl, marginTop: t.spacing['2xl'], gap: t.spacing['2xl'] }}>
          {/* Life intentions as chip vitals */}
          {!!intentChips.length && (
            <Reveal index={0}>
              <SectionLabel>Life intentions</SectionLabel>
              <VitalChips items={intentChips.map((c) => ({ icon: '♾', label: c }))} />
              {intentions.acknowledgedSelfManage && (
                <Text variant="caption" color="success" style={{ marginTop: t.spacing.sm }}>✓ Open to a shared intentions agreement</Text>
              )}
            </Reveal>
          )}

        </View>

        {/* Third photo — interleaved before the closing content */}
        {gallery[2] && (
          <View style={{ marginVertical: t.spacing['2xl'] }}>
            <PhotoBlock uri={gallery[2]} height={440} />
          </View>
        )}

        <View style={{ paddingHorizontal: t.spacing.xl, gap: t.spacing['2xl'] }}>
          {/* Why you align — teaser into the full reading */}
          <Reveal index={1}>
            <SectionLabel>Why you might align</SectionLabel>
            <PromptBlock question={`${p.name} & you`} answer="See the psychological dimensions you share — and where the stars agree." />
            <Pressable onPress={() => router.push({ pathname: '/match/[id]/report', params: { id: p.id } })} style={{ marginTop: t.spacing.md, alignSelf: 'flex-start' }}>
              <Text variant="label" color="primary">Open full reading  →</Text>
            </Pressable>
          </Reveal>

          {/* Safety note — a genuine callout, the one place a soft surface is right */}
          <Reveal index={2}>
            <View style={{ borderLeftWidth: 2, borderLeftColor: t.colors.accent, paddingLeft: t.spacing.lg }}>
              <Text variant="label" color="accent">A note on safety</Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: 4 }}>
                A high compatibility score reflects psychological & astrological fit — it is NOT a
                background check. Always do your own due diligence before meeting or committing.
                Background-verification services are coming to the app.
              </Text>
            </View>
          </Reveal>

          <View style={{ gap: t.spacing.md, marginTop: t.spacing.sm }}>
            <Button label="See full compatibility reading" onPress={() => router.push({ pathname: '/match/[id]/report', params: { id: p.id } })} />
            <Button label="Report this profile" variant="danger" onPress={report} />
          </View>
        </View>
      </ScrollView>
    </CinematicBackground>
  );
}
