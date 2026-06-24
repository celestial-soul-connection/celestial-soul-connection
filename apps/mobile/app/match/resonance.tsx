/**
 * Resonance — "who resonated with you." The honest, on-brand take on "who liked
 * you": souls who have already felt a pull toward you. Premium users see them
 * clearly and can bring them into a connection; free users see them gently
 * blurred with a calm upsell — never a manipulative tease.
 *
 * Re-engagement that respects the user (vision §8: no dark patterns). Gated on
 * entitlement; data from store.getResonance().
 */
import React, { useCallback, useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { SkyScreen } from '../../src/components/SkyScreen';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { VerifiedBadge } from '../../src/components/profile/ProfileKit';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getResonance } from '../../src/data/store';
import { getEntitlement } from '../../src/data/billing';
import { Profile } from '../../src/data/types';
import { haptic } from '../../src/lib/haptics';

export default function Resonance() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [souls, setSouls] = useState<Profile[] | null>(null);
  const [premium, setPremium] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      setSouls(await getResonance());
      setPremium((await getEntitlement()).isPremium);
    })();
  }, []));

  const tileW = (width - t.spacing.xl * 2 - t.spacing.md) / 2;
  const count = souls?.length ?? 0;

  return (
    <SkyScreen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.xs }}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Text variant="headline" color="textMuted">‹</Text></Pressable>
        <Text variant="overline" color="textFaint" uppercase>Resonance</Text>
      </View>
      <Text variant="displayLg">Souls drawn to you</Text>
      <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
        {count > 0
          ? `${count} ${count === 1 ? 'soul has' : 'souls have'} felt a pull toward yours. When you resonate back, a connection opens.`
          : 'No one has resonated with you just yet. Keep your profile true and verified — the right souls are drawn to clarity.'}
      </Text>

      {!premium && count > 0 && (
        <Reveal index={0}>
          <View style={{ marginTop: t.spacing.lg, borderRadius: t.radii.lg, borderWidth: 1, borderColor: t.colors.highlight, backgroundColor: t.colors.glass, padding: t.spacing.lg }}>
            <Text variant="title" color="highlight">✦ See who resonated with you</Text>
            <Text variant="caption" color="textMuted" style={{ marginTop: 4 }}>
              Unblur every soul drawn to you, and resonate back instantly, with Aligned membership.
            </Text>
            <Button label="Unlock with Aligned" onPress={() => { haptic.light(); router.push('/paywall'); }} style={{ marginTop: t.spacing.md }} />
          </View>
        </Reveal>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md, marginTop: t.spacing.xl }}>
        {souls?.map((p, i) => (
          <Reveal key={p.id} index={i}>
            <Pressable
              disabled={!premium}
              onPress={() => { haptic.light(); router.push({ pathname: '/profile/[id]', params: { id: p.id } }); }}
              style={{ width: tileW, height: tileW * 1.32, borderRadius: t.radii.lg, overflow: 'hidden', backgroundColor: t.colors.bgElevated }}>
              <Image source={p.photo} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={300} blurRadius={premium ? 0 : 18} />
              {!premium && <BlurView intensity={t.feel.glass.intensity + 30} tint={t.mode === 'dark' ? 'dark' : 'light'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />}
              <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: t.spacing.md }}>
                {premium ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text variant="title" color="textOnImage" onImage>{p.name}, {p.age}</Text>
                    {p.verified?.photo && <VerifiedBadge size={16} />}
                  </View>
                ) : (
                  <Text variant="title" color="textOnImage" onImage>A soul ✦</Text>
                )}
                {premium && <Text variant="caption" color="textOnImageMuted" onImage>{p.city}</Text>}
              </View>
            </Pressable>
          </Reveal>
        ))}
      </View>

      <View style={{ height: insets.bottom + t.spacing.xl }} />
    </SkyScreen>
  );
}
