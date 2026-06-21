/**
 * PhoneField — premium phone input: a tappable country pill (flag + dial code)
 * fused to large "dialing" digits, with a center-grow accent underline on focus.
 * Country picker is a simple inline sheet of common countries (extend freely).
 */
import React, { useState } from 'react';
import { View, TextInput, Pressable, Modal, FlatList } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { haptic } from '../../lib/haptics';

export interface Country { flag: string; code: string; dial: string; name: string; }
const COUNTRIES: Country[] = [
  { flag: '🇮🇳', code: 'IN', dial: '+91', name: 'India' },
  { flag: '🇺🇸', code: 'US', dial: '+1', name: 'United States' },
  { flag: '🇬🇧', code: 'GB', dial: '+44', name: 'United Kingdom' },
  { flag: '🇦🇪', code: 'AE', dial: '+971', name: 'United Arab Emirates' },
  { flag: '🇸🇬', code: 'SG', dial: '+65', name: 'Singapore' },
  { flag: '🇨🇦', code: 'CA', dial: '+1', name: 'Canada' },
  { flag: '🇦🇺', code: 'AU', dial: '+61', name: 'Australia' },
];

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  country: Country;
  onCountryChange: (c: Country) => void;
}

export function PhoneField({ value, onChangeText, country, onCountryChange }: Props) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const focus = useSharedValue(0);

  const underline = useAnimatedStyle(() => ({
    transform: [{ scaleX: focus.value }],
  }));

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <Pressable
          onPress={() => { haptic.light(); setOpen(true); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radii.md, paddingHorizontal: t.spacing.md, height: 56 }}>
          <Text variant="title">{country.flag}</Text>
          <Text variant="title" color="textMuted">{country.dial}</Text>
          <Text variant="caption" color="textFaint">▾</Text>
        </Pressable>
        <TextInput
          value={value}
          onChangeText={(v) => onChangeText(v.replace(/[^\d\s]/g, ''))}
          onFocus={() => (focus.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }))}
          onBlur={() => (focus.value = withTiming(0, { duration: 200 }))}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          placeholder="98765 43210"
          placeholderTextColor={t.colors.textFaint}
          autoFocus
          style={{ flex: 1, color: t.colors.text, fontFamily: t.fontFamily.bodyBold, fontSize: 26, letterSpacing: 1, height: 56 }}
        />
      </View>
      {/* center-grow underline */}
      <View style={{ height: 2, backgroundColor: t.colors.border, marginTop: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Animated.View style={[{ height: 2, backgroundColor: t.colors.primary, borderRadius: 2 }, underline]} />
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: t.colors.overlay }} onPress={() => setOpen(false)} />
        <View style={{ backgroundColor: t.colors.bg, borderTopLeftRadius: t.radii.xl, borderTopRightRadius: t.radii.xl, paddingTop: t.spacing.lg, paddingBottom: t.spacing['3xl'], maxHeight: '60%' }}>
          <Text variant="title" center style={{ marginBottom: t.spacing.md }}>Choose your country</Text>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(c) => c.code + c.dial}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { haptic.light(); onCountryChange(item); setOpen(false); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingHorizontal: t.spacing.xl, paddingVertical: t.spacing.md }}>
                <Text variant="title">{item.flag}</Text>
                <Text variant="bodyLg" style={{ flex: 1 }}>{item.name}</Text>
                <Text variant="body" color="textMuted">{item.dial}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

export { COUNTRIES };
