/**
 * CompatModeChooser — lets the user pick how compatibility is computed:
 * Psychological / Balanced / Astrological. This is a first-class choice that
 * drives the fusion weights and lets us map people who chose the same lens.
 *
 * Container-light, on-token (design-system rules): flat selectable rows with an
 * accent left-edge + check, icon, label, and one-line help. No boxed cards.
 */
import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeProvider';
import { COMPAT_MODE_OPTIONS, CompatibilityMode } from '../data/types';
import { haptic } from '../lib/haptics';

export function CompatModeChooser({ value, onChange }: { value: CompatibilityMode; onChange: (m: CompatibilityMode) => void }) {
  const t = useTheme();
  return (
    <View>
      {COMPAT_MODE_OPTIONS.map((o, i) => {
        const active = value === o.v;
        return (
          <Pressable
            key={o.v}
            onPress={() => { haptic.light(); onChange(o.v); }}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: t.spacing.md,
              paddingVertical: t.spacing.md,
              borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.colors.border,
            }}>
            <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, backgroundColor: active ? t.colors.primary : 'transparent' }} />
            <Text variant="title" color={active ? 'primary' : 'textMuted'}>{o.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text variant="title" color={active ? 'primary' : 'text'}>{o.label}</Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{o.help}</Text>
            </View>
            {active && (
              <View style={{ width: 24, height: 24, borderRadius: 24, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="caption" color="textOnPrimary">✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
