/**
 * Candidate profile — their photo, blurb, interests, life intentions, verified
 * badges, a link to the full compatibility reading, and a Report action that
 * offboards them from the local deck. Includes the background-check disclaimer.
 */
import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { useTheme } from '../../src/theme/ThemeProvider';
import { SEED_PROFILES } from '../../src/data/seedProfiles';
import { reportProfile } from '../../src/data/store';
import { LifeIntentions } from '../../src/data/types';

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

  return (
    <CinematicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + t.spacing.xl }}>
        <Image source={p.photo} style={{ width: '100%', height: 420 }} contentFit="cover" transition={400} />
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ position: 'absolute', top: insets.top + t.spacing.sm, left: t.spacing.lg }}>
          <Text variant="headline" color="textOnImage" onImage>‹</Text>
        </Pressable>

        <View style={{ paddingHorizontal: t.spacing.xl, marginTop: t.spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
            <Text variant="displayLg">{p.name}, {p.age}</Text>
            {p.verified?.photo && <Chip label="✓ verified" tone="success" />}
          </View>
          <Text variant="body" color="textMuted" style={{ marginTop: 2 }}>{p.city} · {p.blurb}</Text>
          {p.bio && <Text variant="bodyLg" style={{ marginTop: t.spacing.md }}>{p.bio}</Text>}

          {!!p.interests?.length && (
            <>
              <Text variant="overline" color="textFaint" uppercase style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>Interests</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
                {p.interests.map((i) => <Chip key={i} label={i} tone="neutral" />)}
              </View>
            </>
          )}

          {!!intentChips.length && (
            <>
              <Text variant="overline" color="textFaint" uppercase style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>Life intentions</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
                {intentChips.map((c) => <Chip key={c} label={c} tone="primary" />)}
              </View>
              {intentions.acknowledgedSelfManage && (
                <Text variant="caption" color="success" style={{ marginTop: t.spacing.sm }}>✓ Open to a shared intentions agreement</Text>
              )}
            </>
          )}

          {/* Background-check disclaimer */}
          <GlassCard style={{ marginTop: t.spacing.xl }}>
            <Text variant="label" color="accent">A note on safety</Text>
            <Text variant="caption" color="textMuted" style={{ marginTop: 4 }}>
              A high compatibility score reflects psychological & astrological fit — it is NOT a
              background check. Always do your own due diligence before meeting or committing.
              Background-verification services are coming to the app.
            </Text>
          </GlassCard>

          <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
            <Button label="See full compatibility reading" onPress={() => router.push({ pathname: '/match/[id]/report', params: { id: p.id } })} />
            <Button label="Report this profile" variant="danger" onPress={report} />
          </View>
        </View>
      </ScrollView>
    </CinematicBackground>
  );
}
