/**
 * Style Studio — lets you explore the whole look live: pick a PALETTE (colours)
 * and a FEEL (atmosphere & motion). Everything restyles instantly and persists.
 * This is how we converge on a look you love without rebuilding code each time.
 */
import React, { useCallback, useState } from 'react';
import { Pressable, View, ScrollView, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { Text } from '../../src/components/Text';
import { exportMyData, deleteMyAccount } from '../../src/data/store';
import { getEntitlement, Entitlement } from '../../src/data/billing';
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
  const [ent, setEnt] = useState<Entitlement | null>(null);
  useFocusEffect(useCallback(() => { (async () => setEnt(await getEntitlement()))(); }, []));

  const membershipLine = ent?.subscription
    ? 'Active subscription'
    : ent?.inTrial
      ? `Free week · ${ent.trialDaysLeft} day${ent.trialDaysLeft === 1 ? '' : 's'} left`
      : 'Free account';

  const onExport = async () => {
    const json = await exportMyData();
    await Share.share({ title: 'My Celestial Soul Connection data', message: json });
  };

  const onDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently erases your profile, matches, messages and consent records from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything', style: 'destructive',
          onPress: async () => { await deleteMyAccount(); router.replace('/'); },
        },
      ],
    );
  };

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

        {/* ---- MEMBERSHIP ---- */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.sm }}>Membership</Text>
        <Pressable onPress={() => router.push('/paywall')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: t.spacing.md }}>
          <View style={{ flex: 1, paddingRight: t.spacing.md }}>
            <Text variant="title" color="primary">{membershipLine}</Text>
            <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
              {ent?.subscription ? 'Manage or change your plan' : 'See plans — ₹99 or ₹199 per week'}
            </Text>
          </View>
          <Text variant="title" color="textFaint">›</Text>
        </Pressable>

        {/* ---- PALETTE ---- flat selectable rows, no box ---- */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.xs }}>Colour palette</Text>
        <View>
          {available.map((p, i) => {
            const pal = PALETTES[p.name as ThemeName];
            const active = themeName === p.name;
            return (
              <SelectableRow key={p.name} t={t} active={active} first={i === 0}
                onPress={() => { haptic.light(); setTheme(p.name as ThemeName); }}
                title={pal.label}
                subtitle={`${pal.mode === 'dark' ? 'Dark' : 'Light'}${p.name === 'warmDusk' ? ' · default' : ''}`}
                right={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <LinearGradient colors={pal.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 26, height: 26, borderRadius: 26 }} />
                    <Sw color={pal.colors.accent} />
                    <Sw color={pal.colors.bg} ring={pal.colors.border} />
                  </View>
                }
              />
            );
          })}
        </View>

        {/* ---- FEEL ---- flat selectable rows ---- */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.xs }}>Atmosphere</Text>
        <View>
          {availableFeels.map((f, i) => {
            const active = feelName === f.name;
            return (
              <SelectableRow key={f.name} t={t} active={active} first={i === 0}
                onPress={() => { haptic.light(); setFeel(f.name as FeelName); }}
                title={f.label}
                subtitle={FEEL_DESC[f.name as FeelName]}
              />
            );
          })}
        </View>

        {/* ---- PRIVACY & DATA ---- flat rows + hairlines, no box ---- */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.sm }}>Privacy &amp; data</Text>
        <SettingRow t={t} label="Review my consent" help="See & withdraw what you've agreed to" onPress={() => router.push('/onboarding/birth-portal')} />
        <Hair t={t} />
        <SettingRow t={t} label="Export my data" help="Download everything we hold about you" onPress={onExport} />
        <Hair t={t} />
        <SettingRow t={t} label="Delete my account" help="Permanently erase your data" danger onPress={onDelete} />
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

/** Flat selectable row: hairline above, accent left-edge + check when active. */
function SelectableRow({ t, active, first, title, subtitle, right, onPress }: { t: ReturnType<typeof useTheme>; active: boolean; first?: boolean; title: string; subtitle?: string; right?: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.md, borderTopWidth: first ? 0 : 1, borderTopColor: t.colors.border }}>
      <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, backgroundColor: active ? t.colors.primary : 'transparent' }} />
      <View style={{ flex: 1 }}>
        <Text variant="title" color={active ? 'primary' : 'text'}>{title}</Text>
        {!!subtitle && <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{subtitle}</Text>}
      </View>
      {right}
      {active && <Check t={t} />}
    </Pressable>
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
