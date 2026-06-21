/**
 * Style Studio — lets you explore the whole look live: pick a PALETTE (colours)
 * and a FEEL (atmosphere & motion). Everything restyles instantly and persists.
 * This is how we converge on a look you love without rebuilding code each time.
 */
import React from 'react';
import { Pressable, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Text } from '../../src/components/Text';
import { useTheme, useThemeControls } from '../../src/theme/ThemeProvider';
import { PALETTES, ThemeName } from '../../src/theme/palettes';
import { FeelName } from '../../src/theme/feel';
import { haptic } from '../../src/lib/haptics';

const FEEL_DESC: Record<FeelName, string> = {
  cinematic: 'Dreamy, alive — starfield, drifting aurora, film grain, glow.',
  glassLuxe: 'Frosted glass over rich gradients. Modern, tactile, premium.',
  editorial: 'Calm magazine luxe. Less effect, more refined typography.',
  minimal: 'Clean and fast. Minimal motion, maximum clarity.',
};

export default function StyleStudio() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeName, setTheme, available, feelName, setFeel, availableFeels } = useThemeControls();

  return (
    <CinematicBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + t.spacing['2xl'], paddingHorizontal: t.spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.md }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text variant="headline" color="textMuted">‹</Text>
          </Pressable>
          <Text variant="overline" color="textFaint" uppercase>Settings</Text>
        </View>
        <Text variant="displayLg" style={{ marginTop: t.spacing.xs }}>Style &amp; privacy</Text>
        <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
          Mix a colour palette with an atmosphere, and manage how your data is used.
          Everything updates live.
        </Text>

        {/* ---- PALETTE ---- */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.md }}>Colour palette</Text>
        <View style={{ gap: t.spacing.md }}>
          {available.map((p) => {
            const pal = PALETTES[p.name as ThemeName];
            const active = themeName === p.name;
            return (
              <Pressable key={p.name} onPress={() => { haptic.light(); setTheme(p.name as ThemeName); }}>
                <GlassCard glow={active} style={active ? { borderColor: t.colors.primary } : undefined}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="title">{pal.label}</Text>
                      <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                        {pal.mode === 'dark' ? 'Dark' : 'Light'}{p.name === 'warmDusk' ? ' · default' : ''}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <LinearGradient colors={pal.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 30, height: 30, borderRadius: 30 }} />
                      <Sw color={pal.colors.accent} />
                      <Sw color={pal.colors.bg} ring={pal.colors.border} />
                      {active && <Check t={t} />}
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
        </View>

        {/* ---- FEEL ---- */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.md }}>Atmosphere</Text>
        <View style={{ gap: t.spacing.md }}>
          {availableFeels.map((f) => {
            const active = feelName === f.name;
            return (
              <Pressable key={f.name} onPress={() => { haptic.light(); setFeel(f.name as FeelName); }}>
                <GlassCard glow={active} style={active ? { borderColor: t.colors.primary } : undefined}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, paddingRight: t.spacing.md }}>
                      <Text variant="title">{f.label}</Text>
                      <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{FEEL_DESC[f.name as FeelName]}</Text>
                    </View>
                    {active && <Check t={t} />}
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
        </View>

        {/* ---- PRIVACY & DATA ---- */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.md }}>Privacy &amp; data</Text>
        <GlassCard>
          <SettingRow t={t} label="Review my consent" help="See & withdraw what you've agreed to" onPress={() => router.push('/onboarding/birth-portal')} />
          <Hair t={t} />
          <SettingRow t={t} label="Export my data" help="Download everything we hold about you" onPress={() => {}} />
          <Hair t={t} />
          <SettingRow t={t} label="Delete my account" help="Permanently erase your data" danger onPress={() => {}} />
        </GlassCard>
        <Text variant="caption" color="textFaint" style={{ marginTop: t.spacing.md }}>
          Birth & chat data are encrypted. Consent is logged to an append-only record. We never
          sell your data. DPDP 2023 · GDPR · CCPA.
        </Text>

        <Text variant="caption" color="textFaint" style={{ marginTop: t.spacing.xl }}>
          Your style choices are saved on this device. Tell me which combination you like and
          I’ll make it the default.
        </Text>
      </ScrollView>
    </CinematicBackground>
  );
}

function SettingRow({ t, label, help, danger, onPress }: { t: ReturnType<typeof useTheme>; label: string; help: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={() => { haptic.light(); onPress(); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: t.spacing.sm }}>
      <View style={{ flex: 1, paddingRight: t.spacing.md }}>
        <Text variant="title" color={danger ? 'danger' : 'text'}>{label}</Text>
        <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{help}</Text>
      </View>
      <Text variant="title" color="textFaint">›</Text>
    </Pressable>
  );
}
function Hair({ t }: { t: ReturnType<typeof useTheme> }) {
  return <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: t.spacing.xs }} />;
}
function Sw({ color, ring }: { color: string; ring?: string }) {
  return <View style={{ width: 30, height: 30, borderRadius: 30, backgroundColor: color, borderWidth: ring ? 1 : 0, borderColor: ring }} />;
}
function Check({ t }: { t: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ width: 24, height: 24, borderRadius: 24, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
      <Text variant="caption" color="textOnPrimary">✓</Text>
    </View>
  );
}
