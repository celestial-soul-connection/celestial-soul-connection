/**
 * DateTimeField — premium date/time picker row. Tapping opens the native
 * calendar (date) or clock (time) via @react-native-community/datetimepicker.
 * Shows a friendly formatted value; returns canonical strings (YYYY-MM-DD / HH:MM).
 * Works in Expo Go.
 */
import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { haptic } from '../../lib/haptics';

interface Props {
  mode: 'date' | 'time';
  label: string;
  value?: string;                 // 'YYYY-MM-DD' or 'HH:MM'
  onChange: (canonical: string, display: string) => void;
  /** For date mode: the latest selectable date (e.g. 18 years ago for 18+). */
  maximumDate?: Date;
  minimumDate?: Date;
}

function pad(n: number) { return n.toString().padStart(2, '0'); }

export function DateTimeField({ mode, label, value, onChange, maximumDate, minimumDate }: Props) {
  const t = useTheme();
  const [show, setShow] = useState(false);

  // Parse existing value into a Date for the picker's initial position.
  const initial = (() => {
    const d = new Date();
    if (value && mode === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, dd] = value.split('-').map(Number);
      return new Date(y, m - 1, dd);
    }
    if (value && mode === 'time' && /^\d{2}:\d{2}$/.test(value)) {
      const [h, mi] = value.split(':').map(Number);
      d.setHours(h, mi, 0, 0);
    }
    return d;
  })();

  const display = (() => {
    if (!value) return mode === 'date' ? 'Tap to choose your birth date' : 'Tap to choose your birth time';
    if (mode === 'date') {
      const [y, m, dd] = value.split('-').map(Number);
      return new Date(y, m - 1, dd).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    }
    const [h, mi] = value.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${pad(mi)} ${ampm}`;
  })();

  const onPicked = (e: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (e.type === 'dismissed' || !picked) return;
    haptic.light();
    if (mode === 'date') {
      const canonical = `${picked.getFullYear()}-${pad(picked.getMonth() + 1)}-${pad(picked.getDate())}`;
      onChange(canonical, display);
    } else {
      const canonical = `${pad(picked.getHours())}:${pad(picked.getMinutes())}`;
      onChange(canonical, display);
    }
  };

  return (
    <View>
      <Pressable onPress={() => { haptic.light(); setShow(true); }} style={{ paddingVertical: t.spacing.sm }}>
        <Text variant="overline" color="textFaint" uppercase>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <Text variant="bodyLg" color={value ? 'text' : 'textFaint'}>{display}</Text>
          <Text variant="title" color="primary">{mode === 'date' ? '🗓' : '🕐'}</Text>
        </View>
      </Pressable>

      {show && (
        <DateTimePicker
          value={initial}
          mode={mode}
          display={Platform.OS === 'ios' ? (mode === 'date' ? 'inline' : 'spinner') : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={onPicked}
          themeVariant={t.mode === 'dark' ? 'dark' : 'light'}
        />
      )}
      {/* iOS inline pickers stay open; give a Done affordance */}
      {show && Platform.OS === 'ios' && (
        <Pressable onPress={() => setShow(false)} style={{ alignSelf: 'flex-end', paddingVertical: t.spacing.sm }}>
          <Text variant="label" color="primary">Done</Text>
        </Pressable>
      )}
    </View>
  );
}
