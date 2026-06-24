/**
 * Welcome — the locked "Two lights, one sky" first impression.
 *
 * Living sky backdrop (breathing nebula + stars + gold stardust) with the
 * signature SoulMerge animation at the heart: two lights spiral together and
 * bloom into one, then rest and begin again. Poetic, concept-first copy that
 * carries into the App Store. All colour/motion from the centralized theme.
 */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SkyBackground } from '../src/components/fx/SkyBackground';
import { SkyScreen } from '../src/components/SkyScreen';
import { SoulMerge } from '../src/components/fx/SoulMerge';
import { Reveal } from '../src/components/fx/Reveal';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { useTheme } from '../src/theme/ThemeProvider';
import { getSession } from '../src/data/session';

export default function Welcome() {
  const t = useTheme();
  const router = useRouter();

  // Returning-user gate: skip the welcome if a session already exists.
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (s) router.replace(s.onboarded ? '/(tabs)/today' : '/onboarding/birth-portal');
      else setChecked(true);
    })();
  }, []);

  if (!checked) return <SkyBackground><View style={{ flex: 1 }} /></SkyBackground>;

  return (
    <SkyScreen scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Reveal index={0}>
          <SoulMerge size={200} />
        </Reveal>

        <Reveal index={1}>
          <Text variant="overline" color="textFaint" uppercase center style={{ marginTop: t.spacing.lg }}>
            Soul alignment, not endless swiping
          </Text>
        </Reveal>

        <Reveal index={2}>
          <Text variant="displayXl" center style={{ marginTop: t.spacing.sm }}>Two lights,</Text>
        </Reveal>
        <Reveal index={3}>
          <Text variant="displayXl" color="highlight" center style={{ fontFamily: t.fontFamily.displayItalic, marginTop: -4 }}>
            one sky.
          </Text>
        </Reveal>

        <Reveal index={4}>
          <Text variant="bodyLg" color="textMuted" center style={{ marginTop: t.spacing.lg, paddingHorizontal: t.spacing.sm, lineHeight: 24 }}>
            Not a feed to scroll — a few souls truly meant for yours, read from your{' '}
            <Text variant="bodyLg" color="text">Soul Print</Text> and aligned by your{' '}
            <Text variant="bodyLg" color="text">Star Sync</Text>.
          </Text>
        </Reveal>
      </View>

      <Reveal index={5} style={{ gap: t.spacing.md }}>
        <Button label="Begin your alignment  →" onPress={() => router.push('/auth/signup')} />
        <Text variant="caption" color="textMuted" center style={{ marginTop: t.spacing.xs }}>
          Already aligned?{' '}
          <Text variant="caption" color="highlight" onPress={() => router.push('/auth/login')}>Sign in</Text>
        </Text>
      </Reveal>
    </SkyScreen>
  );
}
