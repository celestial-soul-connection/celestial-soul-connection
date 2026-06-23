/**
 * TrustLadder — the first-class verification surface (vision §4.3, "trust before
 * romance"). A vertical ladder of trust signals the user climbs: 18+ → Phone →
 * Photo → ID. Each rung shows its state (done / available / locked), a plain
 * "why it matters" line, and — for the marriage-minded Indian user — makes clear
 * that more verification means being shown to more serious people.
 *
 * Reusable on onboarding (encouragement) and Profile (progress). Pure tokens.
 */
import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeProvider';

export interface TrustRung {
  key: string;
  label: string;
  why: string;            // plain-language "why it matters"
  done: boolean;
  actionLabel?: string;   // shown when not done & actionable
  onAction?: () => void;
  locked?: boolean;       // not yet available (e.g. ID coming soon)
}

export function TrustLadder({ rungs, title = 'Your trust standing' }: { rungs: TrustRung[]; title?: string }) {
  const t = useTheme();
  const doneCount = rungs.filter((r) => r.done).length;
  const pct = Math.round((doneCount / rungs.length) * 100);

  return (
    <View>
      {/* header + progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing.sm }}>
        <Text variant="title">{title}</Text>
        <Text variant="label" color="highlight">{doneCount}/{rungs.length} verified</Text>
      </View>
      <View style={{ height: 7, borderRadius: 7, backgroundColor: t.colors.bgSunken, overflow: 'hidden', marginBottom: t.spacing.lg }}>
        <View style={{ width: `${Math.max(4, pct)}%`, height: 7, borderRadius: 7, backgroundColor: t.colors.highlight }} />
      </View>

      {rungs.map((r, i) => (
        <View key={r.key}
          style={{ flexDirection: 'row', gap: t.spacing.md, paddingVertical: t.spacing.md, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.colors.border, opacity: r.locked ? 0.55 : 1 }}>
          {/* state dot */}
          <View style={{
            width: 26, height: 26, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
            backgroundColor: r.done ? t.colors.success : 'transparent',
            borderWidth: r.done ? 0 : 2, borderColor: t.colors.borderStrong,
          }}>
            {r.done ? <Text variant="caption" color="textOnPrimary">✓</Text> : <Text variant="caption" color="textFaint">{i + 1}</Text>}
          </View>

          <View style={{ flex: 1 }}>
            <Text variant="title" color={r.done ? 'success' : 'text'}>{r.label}</Text>
            <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{r.why}</Text>
          </View>

          {/* action / state */}
          {r.done ? (
            <Text variant="label" color="success" style={{ alignSelf: 'center' }}>Verified</Text>
          ) : r.locked ? (
            <Text variant="label" color="textFaint" style={{ alignSelf: 'center' }}>Soon</Text>
          ) : r.onAction ? (
            <Pressable onPress={r.onAction} hitSlop={8} style={{ alignSelf: 'center', backgroundColor: t.colors.primarySoft, borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: 6 }}>
              <Text variant="label" color="primary">{r.actionLabel ?? 'Verify'}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}

      <Text variant="caption" color="textFaint" style={{ marginTop: t.spacing.md }}>
        Verified people are shown to more serious souls — and feel safer to meet. We never show
        your documents to anyone; only your verified status is visible.
      </Text>
    </View>
  );
}
