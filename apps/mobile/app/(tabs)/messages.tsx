/**
 * Messages tab — your conversations, always one tap away. Each active connection
 * with a last-message preview; connections with no messages yet read as "start
 * the conversation" so there's a clear next move. A Resonance banner surfaces
 * souls drawn to you. Empty state nudges back to Discover. (IA fix: chat is now
 * first-class, no more hunting for it.)
 */
import React, { useCallback, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { SkyScreen } from '../../src/components/SkyScreen';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { VerifiedBadge } from '../../src/components/profile/ProfileKit';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getConversations, getResonance, Conversation } from '../../src/data/store';
import { haptic } from '../../src/lib/haptics';

export default function Messages() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [convos, setConvos] = useState<Conversation[] | null>(null);
  const [resonanceCount, setResonanceCount] = useState(0);

  useFocusEffect(useCallback(() => {
    (async () => {
      setConvos(await getConversations());
      setResonanceCount((await getResonance()).length);
    })();
  }, []));

  const empty = convos && convos.length === 0;

  return (
    <SkyScreen>
      <Text variant="overline" color="textFaint" uppercase>Your threads</Text>
      <Text variant="displayLg">Messages</Text>

      {/* Resonance — souls drawn to you */}
      {resonanceCount > 0 && (
        <Pressable onPress={() => { haptic.light(); router.push('/match/resonance'); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginTop: t.spacing.lg, padding: t.spacing.lg, borderRadius: t.radii.lg, borderWidth: 1, borderColor: t.colors.highlight, backgroundColor: t.colors.glass }}>
          <Text variant="headline" color="highlight">✦</Text>
          <View style={{ flex: 1 }}>
            <Text variant="title">{resonanceCount} {resonanceCount === 1 ? 'soul' : 'souls'} resonated with you</Text>
            <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>See who’s drawn to you, and resonate back.</Text>
          </View>
          <Text variant="title" color="textFaint">›</Text>
        </Pressable>
      )}

      {empty && (
        <View style={{ marginTop: t.spacing['3xl'], alignItems: 'center' }}>
          <Text variant="displayLg" color="textFaint">♥</Text>
          <Text variant="headline" center style={{ marginTop: t.spacing.md }}>No threads yet</Text>
          <Text variant="body" color="textMuted" center style={{ marginTop: t.spacing.sm, paddingHorizontal: t.spacing.lg }}>
            When you and a soul both resonate, a thread opens here — ready for a first soul probe.
          </Text>
          <Button label="Meet today’s soul" onPress={() => router.push('/(tabs)/discover')} style={{ marginTop: t.spacing.xl }} />
        </View>
      )}

      <View style={{ marginTop: t.spacing.lg, gap: t.spacing.sm }}>
        {convos?.map((c, i) => (
          <Reveal key={c.profile.id} index={i}>
            <Pressable
              onPress={() => { haptic.light(); router.push({ pathname: '/match/chat', params: { id: c.profile.id } }); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.md }}>
              <Image source={c.profile.photo} style={{ width: 60, height: 60, borderRadius: 60 }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="title">{c.profile.name}, {c.profile.age}</Text>
                  {c.profile.verified?.photo && <VerifiedBadge size={16} />}
                </View>
                {c.started ? (
                  <Text variant="body" color="textMuted" numberOfLines={1} style={{ marginTop: 2 }}>{c.lastText}</Text>
                ) : (
                  <Text variant="body" color="highlight" style={{ marginTop: 2 }}>✦ Start the conversation</Text>
                )}
              </View>
              <Text variant="title" color="textFaint">›</Text>
            </Pressable>
          </Reveal>
        ))}
      </View>

      <View style={{ height: insets.bottom + 90 }} />
    </SkyScreen>
  );
}
