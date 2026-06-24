/**
 * SettingsSheet — a slide-up "drawer" for quick access to settings from
 * anywhere (today: the Profile gear). It is a thin, on-brand launcher: a
 * frosted glass sheet over a scrim, with a few destinations + a live
 * appearance toggle. Heavy editing still lives in the full Style Studio
 * (`/settings/theme`), which this links to — so we don't fork settings logic.
 *
 * Pure token-driven: no raw colours, spacing from tokens, motion from the feel.
 */
import React from 'react';
import { Modal, Pressable, View, ScrollView, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import { PALETTES, ThemeName } from '../theme/palettes';
import { resetDeck, deleteMyAccount } from '../data/store';
import { haptic } from '../lib/haptics';

interface Row { label: string; help: string; icon: string; danger?: boolean; onPress: () => void }

export function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeName, setTheme, mode, toggleMode, available } = useThemeControls();

  const go = (path: string) => { haptic.light(); onClose(); router.push(path as any); };

  const rows: Row[] = [
    { label: 'Style & appearance', help: 'Theme, light or dark, atmosphere', icon: '✦', onPress: () => go('/settings/theme') },
    { label: 'Membership', help: 'Plans & contact reveals', icon: '◈', onPress: () => go('/paywall') },
    { label: 'How we match you', help: 'Soul Print · Star Sync balance', icon: '⚖', onPress: () => go('/settings/theme') },
    { label: 'Privacy & data', help: 'Consent, export, delete', icon: '☾', onPress: () => go('/settings/theme') },
  ];

  // ---- Testing helpers — let you replay the flow & re-test the new screens ----
  const resetMatches = () => {
    Alert.alert('Reset matches & slots?', 'Clears your connections, passed/liked people and slot state so you can test Discover again. Your profile stays.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset matches', onPress: async () => { await resetDeck(); haptic.success(); onClose(); router.replace('/(tabs)/discover'); } },
    ]);
  };
  const startOver = () => {
    Alert.alert('Start over from Welcome?', 'Wipes everything on this device — profile, matches, session — and returns you to the Welcome screen so you can walk the whole flow fresh. (Testing only.)', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Wipe & start over', style: 'destructive', onPress: async () => { await deleteMyAccount(); haptic.success(); onClose(); router.replace('/'); } },
    ]);
  };
  const testRows: Row[] = [
    { label: 'Reset matches & slots', help: 'Replay Discover with a clean deck', icon: '↺', onPress: resetMatches },
    { label: 'Start over from Welcome', help: 'Wipe everything & re-walk the flow', icon: '⟲', danger: true, onPress: startOver },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: t.colors.overlay }} onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <MotiView
            from={{ translateY: 40, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'timing', duration: t.motion.duration.base }}
          >
            <Pressable onPress={(e) => e.stopPropagation?.()}>
              <BlurView
                intensity={t.feel.glass.intensity + 30}
                tint={t.mode === 'dark' ? 'dark' : 'light'}
                style={{ borderTopLeftRadius: t.radii.xl, borderTopRightRadius: t.radii.xl, overflow: 'hidden', borderTopWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.glass }}
              >
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}
                  contentContainerStyle={{ paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.lg, paddingBottom: insets.bottom + t.spacing.xl }}>
                  {/* grab handle */}
                  <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: t.radii.pill, backgroundColor: t.colors.borderStrong, marginBottom: t.spacing.lg }} />

                  <Text variant="overline" color="textFaint" uppercase>Settings</Text>
                  <Text variant="displayLg" style={{ marginTop: t.spacing.xs }}>Quick access</Text>

                  {/* live appearance toggle */}
                  <View style={{ flexDirection: 'row', backgroundColor: t.colors.bgSunken, borderRadius: t.radii.pill, padding: 4, marginTop: t.spacing.lg }}>
                    {(['dark', 'light'] as const).map((m) => {
                      const on = mode === m;
                      return (
                        <Pressable key={m} onPress={() => { if (!on) { haptic.light(); toggleMode(); } }}
                          style={{ flex: 1, paddingVertical: t.spacing.sm, borderRadius: t.radii.pill, alignItems: 'center', backgroundColor: on ? t.colors.primary : 'transparent' }}>
                          <Text variant="label" color={on ? 'textOnPrimary' : 'textMuted'}>{m === 'dark' ? '☾  Dark' : '☀  Light'}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* theme swatches — tap to switch instantly */}
                  <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.lg }}>
                    {available.map((p) => {
                      const on = themeName === p.name;
                      return (
                        <Pressable key={p.name} onPress={() => { haptic.light(); setTheme(p.name as ThemeName); }}
                          style={{ alignItems: 'center', gap: 4, flex: 1 }}>
                          <View style={{ width: 34, height: 34, borderRadius: 34, backgroundColor: PRIMARY_OF(p.name, mode), borderWidth: on ? 2 : 1, borderColor: on ? t.colors.highlight : t.colors.border }} />
                          <Text variant="caption" color={on ? 'primary' : 'textFaint'} numberOfLines={1}>{shortLabel(p.label)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* destinations */}
                  <View style={{ marginTop: t.spacing.xl }}>
                    {rows.map((r, i) => <SheetRow key={r.label} t={t} r={r} first={i === 0} />)}
                  </View>

                  {/* testing helpers */}
                  <Text variant="overline" color="textFaint" uppercase style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.xs }}>For testing</Text>
                  <View>
                    {testRows.map((r, i) => <SheetRow key={r.label} t={t} r={r} first={i === 0} />)}
                  </View>
                </ScrollView>
              </BlurView>
            </Pressable>
          </MotiView>
        </View>
      </Pressable>
    </Modal>
  );
}

function SheetRow({ t, r, first }: { t: ReturnType<typeof useTheme>; r: Row; first: boolean }) {
  return (
    <Pressable onPress={r.onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.md, borderTopWidth: first ? 0 : 1, borderTopColor: t.colors.border }}>
      <Text variant="title" color={r.danger ? 'danger' : 'highlight'} style={{ width: 24, textAlign: 'center' }}>{r.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text variant="title" color={r.danger ? 'danger' : 'text'}>{r.label}</Text>
        <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{r.help}</Text>
      </View>
      <Text variant="title" color="textFaint">›</Text>
    </Pressable>
  );
}

function shortLabel(label: string): string {
  // "Midnight Violet" -> "Violet"; "Rose Gold" -> "Rose"; "Deep Teal" -> "Teal"; "Obsidian Gold" -> "Gold"
  const map: Record<string, string> = { 'Midnight Violet': 'Violet', 'Rose Gold': 'Rose', 'Deep Teal': 'Teal', 'Obsidian Gold': 'Gold' };
  return map[label] ?? label.split(' ').pop() ?? label;
}

// Read a theme's primary straight from the contract so swatches preview the real hue.
function PRIMARY_OF(name: string, mode: 'light' | 'dark'): string {
  return PALETTES[name as ThemeName][mode].colors.primary;
}
