/**
 * Theme settings — lets the user pick any of the 3 palettes. Selecting one
 * restyles the ENTIRE app instantly (and persists) with zero per-screen code,
 * which is the whole promise of the token system. Default is Warm Dusk.
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenFrame } from '../../src/components/ScreenFrame';
import { Text } from '../../src/components/Text';
import { Card } from '../../src/components/Card';
import { useTheme, useThemeControls } from '../../src/theme/ThemeProvider';
import { PALETTES, ThemeName } from '../../src/theme/palettes';

export default function ThemeSettings() {
  const t = useTheme();
  const { themeName, setTheme, available } = useThemeControls();

  return (
    <ScreenFrame>
      <Text variant="overline" color="textFaint" uppercase>Appearance</Text>
      <Text variant="displayLg" style={{ marginTop: t.spacing.xs }}>Choose your aura</Text>
      <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
        Pick the mood that feels like you. It restyles everything — instantly.
      </Text>

      <View style={{ marginTop: t.spacing.xl, gap: t.spacing.md }}>
        {available.map((p) => {
          const pal = PALETTES[p.name as ThemeName];
          const active = themeName === p.name;
          return (
            <Pressable key={p.name} onPress={() => setTheme(p.name as ThemeName)}>
              <Card
                glow={active}
                style={{ borderColor: active ? t.colors.primary : t.colors.border, borderWidth: active ? 2 : 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text variant="title">{pal.label}</Text>
                    <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                      {pal.mode === 'dark' ? 'Dark mode' : 'Light mode'}
                      {p.name === 'warmDusk' ? ' · default' : ''}
                    </Text>
                  </View>
                  {/* Live swatch from that palette's own tokens */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <LinearGradient
                      colors={pal.gradients.brand}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={{ width: 28, height: 28, borderRadius: 28 }}
                    />
                    <Swatch color={pal.colors.accent} />
                    <Swatch color={pal.colors.bg} ring={pal.colors.border} />
                    {active && (
                      <View style={{ width: 22, height: 22, borderRadius: 22, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
                        <Text variant="caption" color="textOnPrimary">✓</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Text variant="caption" color="textFaint" style={{ marginTop: t.spacing.xl }}>
        Your choice is saved on this device. More palettes can be added centrally
        without changing a single screen.
      </Text>
    </ScreenFrame>
  );
}

function Swatch({ color, ring }: { color: string; ring?: string }) {
  return <View style={{ width: 28, height: 28, borderRadius: 28, backgroundColor: color, borderWidth: ring ? 1 : 0, borderColor: ring }} />;
}
