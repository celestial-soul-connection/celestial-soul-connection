/**
 * Matches tab — the people you've aligned with (liked). Tap to open their full
 * compatibility reading or start a thread. Premium list with photo, name, city,
 * verified badge. Empty state nudges back to Discover.
 */
import React, { useCallback, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { VerifiedBadge } from '../../src/components/profile/ProfileKit';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getLikedProfiles } from '../../src/data/store';
import { Profile } from '../../src/data/types';
import { haptic } from '../../src/lib/haptics';

export default function Matches() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState<Profile[] | null>(null);

  useFocusEffect(useCallback(() => { (async () => setLiked(await getLikedProfiles()))(); }, []));

  return (
    <CinematicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + 90, paddingHorizontal: t.spacing.xl }}>
        <Text variant="overline" color="textFaint" uppercase>Your alignments</Text>
        <Text variant="displayLg">Matches</Text>

        {liked && liked.length === 0 && (
          <View style={{ marginTop: t.spacing['4xl'], alignItems: 'center' }}>
            <Text variant="displayLg" color="textFaint">✦</Text>
            <Text variant="headline" center style={{ marginTop: t.spacing.md }}>No alignments yet</Text>
            <Text variant="body" color="textMuted" center style={{ marginTop: t.spacing.sm, paddingHorizontal: t.spacing.lg }}>
              Resonate with someone in Discover, and they'll appear here — ready for a meaningful thread.
            </Text>
            <Button label="Go to Discover" onPress={() => router.push('/(tabs)/discover')} style={{ marginTop: t.spacing.xl }} />
          </View>
        )}

        <View style={{ marginTop: t.spacing.xl, gap: t.spacing.md }}>
          {liked?.map((p, i) => (
            <Reveal key={p.id} index={i}>
              <Pressable onPress={() => { haptic.light(); router.push({ pathname: '/profile/[id]', params: { id: p.id } }); }}>
                <GlassCard padded={false} style={{ overflow: 'hidden' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={p.photo} style={{ width: 96, height: 120 }} contentFit="cover" />
                    <View style={{ flex: 1, padding: t.spacing.lg, justifyContent: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text variant="title">{p.name}, {p.age}</Text>
                        {p.verified?.photo && <VerifiedBadge size={18} />}
                      </View>
                      <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{p.city}</Text>
                      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.md }}>
                        <Pressable onPress={() => router.push({ pathname: '/match/[id]/report', params: { id: p.id } })} style={{ backgroundColor: t.colors.primarySoft, borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: 6 }}>
                          <Text variant="label" color="primary">Reading</Text>
                        </Pressable>
                        <Pressable onPress={() => router.push({ pathname: '/match/chat', params: { id: p.id } })} style={{ backgroundColor: t.colors.primary, borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: 6 }}>
                          <Text variant="label" color="textOnPrimary">Message</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            </Reveal>
          ))}
        </View>
      </ScrollView>
    </CinematicBackground>
  );
}
