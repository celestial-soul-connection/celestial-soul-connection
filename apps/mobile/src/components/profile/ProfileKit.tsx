/**
 * ProfileKit — the shared vocabulary for profile, discover-card and report screens.
 *
 * Design language (Hinge × TrulyMadly): photo-led, container-light, type-driven.
 * NEVER box an individual field. Vitals are icon+pill chips, not label:value tables.
 * Prompts are a small muted question + a large expressive (Playfair) answer.
 * See memory: profile-ui-design-language.
 */
import React from 'react';
import { View, Pressable, ViewStyle, TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../Text';
import { useTheme } from '../../theme/ThemeProvider';

type T = ReturnType<typeof useTheme>;

/* ---- Section label: tiny uppercase overline above a content block ---- */
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const t = useTheme();
  return (
    <Text variant="overline" color="textFaint" uppercase style={[{ marginBottom: t.spacing.sm }, style]}>
      {children}
    </Text>
  );
}

/* ---- Vital chip: small monoline icon + label, wraps in a row ---- */
export function VitalChip({ icon, label }: { icon: string; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radii.pill, paddingVertical: 7, paddingHorizontal: t.spacing.md }}>
      <Text variant="caption" color="textMuted">{icon}</Text>
      <Text variant="label" color="text">{label}</Text>
    </View>
  );
}

export function VitalChips({ items }: { items: { icon: string; label: string }[] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
      {items.filter((i) => i.label).map((i) => <VitalChip key={i.icon + i.label} icon={i.icon} label={i.label} />)}
    </View>
  );
}

/* ---- Verified cluster: granular trust signals (TrulyMadly TrustScore analogue) ---- */
export type VerifySignal = { label: string; on: boolean };
export function VerifiedCluster({ signals }: { signals: VerifySignal[] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
      {signals.map((s) => (
        <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: s.on ? t.colors.primarySoft : 'transparent', borderWidth: 1, borderColor: s.on ? 'transparent' : t.colors.border, borderRadius: t.radii.pill, paddingVertical: 6, paddingHorizontal: t.spacing.md }}>
          <Text variant="caption" color={s.on ? 'primary' : 'textFaint'}>{s.on ? '✓' : '○'}</Text>
          <Text variant="label" color={s.on ? 'primary' : 'textFaint'}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* ---- Inline verified badge: sits right of the name ---- */
export function VerifiedBadge({ size = 22 }: { size?: number }) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size, backgroundColor: t.colors.success, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="caption" color="textOnPrimary">✓</Text>
    </View>
  );
}

/* ---- Prompt block: muted question + large expressive answer ---- */
export function PromptBlock({ question, answer }: { question: string; answer: string }) {
  const t = useTheme();
  if (!answer) return null;
  return (
    <View>
      <Text variant="overline" color="textFaint" uppercase>{question}</Text>
      <Text variant="displayLg" style={{ marginTop: t.spacing.sm }}>{answer}</Text>
    </View>
  );
}

/* ---- Full-bleed photo block, edge-to-edge, optional bottom overlay ---- */
export function PhotoBlock({
  uri, height, children, rounded,
}: { uri?: string | null; height: number; children?: React.ReactNode; rounded?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ height, backgroundColor: t.colors.bgSunken, borderRadius: rounded ? t.radii.lg : 0, overflow: 'hidden' }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={300} />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm }}>
          <Text variant="displayLg" color="textFaint">+</Text>
          <Text variant="label" color="textMuted">Add a photo</Text>
        </View>
      )}
      {children != null && (
        <>
          <LinearGradient colors={['transparent', 'rgba(8,5,14,0.45)', 'rgba(8,5,14,0.92)']} locations={[0.45, 0.72, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }} />
          <View style={{ position: 'absolute', left: t.spacing.xl, right: t.spacing.xl, bottom: t.spacing.xl }}>{children}</View>
        </>
      )}
    </View>
  );
}

/* ---- Floating circular action (the per-element "resonate" affordance) ---- */
export function FloatingAction({ icon, onPress, tone = 'primary' }: { icon: string; onPress: () => void; tone?: 'primary' | 'success' | 'danger' }) {
  const t = useTheme();
  const bg = tone === 'success' ? t.colors.success : tone === 'danger' ? t.colors.danger : t.colors.primary;
  return (
    <Pressable onPress={onPress} hitSlop={10} style={{ width: 52, height: 52, borderRadius: 52, backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.border, alignItems: 'center', justifyContent: 'center', ...t.elevation.md, shadowColor: bg }}>
      <Text variant="title" style={{ color: bg }}>{icon}</Text>
    </Pressable>
  );
}

/* ---- Hairline divider between inset rows (the ONLY divider style) ---- */
export function Hairline({ style }: { style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ height: 1, backgroundColor: t.colors.border }, style]} />;
}
