/**
 * Birth Portal — collects REAL birth details (date, time, place→coords via the
 * place-search service) plus the granular consent model. Saves BirthData, then
 * routes to the questionnaire (correct onboarding order: birth → questionnaire).
 */
import React, { useState, useRef } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenFrame } from '../../src/components/ScreenFrame';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { Toggle } from '../../src/components/Toggle';
import { useTheme } from '../../src/theme/ThemeProvider';
import { searchPlaces, Place } from '../../src/data/placeSearch';
import { setMyBirth } from '../../src/data/store';

type Consent = { key: string; label: string; help: string; required?: boolean; default?: boolean };
const CONSENTS: Consent[] = [
  { key: 'birth_data_matching', label: 'Use my birth details for matching', help: 'Date, time & place of birth, encrypted and never shown to others.', required: true },
  { key: 'psychometric_profiling', label: 'Build my psychological profile', help: 'Attachment, values & goals power your compatibility score.', required: true },
  { key: 'photo_display_to_matches', label: 'Show my photos to matches only', help: 'Visible to a confirmed match, never publicly.', default: true },
  { key: 'product_analytics', label: 'Share anonymous usage analytics', help: 'Helps us improve. Pseudonymised. Optional.', default: false },
  { key: 'marketing_comms', label: 'Send me tips & offers', help: 'Optional. Withdraw anytime in Settings.', default: false },
];

export default function BirthPortal() {
  const t = useTheme();
  const router = useRouter();

  const [date, setDate] = useState('');     // YYYY-MM-DD
  const [time, setTime] = useState('');     // HH:MM
  const [placeQuery, setPlaceQuery] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [consent, setConsent] = useState<Record<string, boolean>>(
    Object.fromEntries(CONSENTS.map((c) => [c.key, c.required ? true : c.default ?? false])),
  );

  const onPlaceChange = (q: string) => {
    setPlaceQuery(q);
    setPlace(null);
    if (debounce.current) clearTimeout(debounce.current);
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    debounce.current = setTimeout(async () => {
      const r = await searchPlaces(q);
      setResults(r);
      setSearching(false);
    }, 350);
  };

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const validTime = /^\d{2}:\d{2}$/.test(time);
  const consentOk = CONSENTS.filter((c) => c.required).every((c) => consent[c.key]);
  const canContinue = validDate && validTime && !!place && consentOk;

  const submit = async () => {
    if (!place) return;
    await setMyBirth({ date, time, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone, place: place.place });
    router.replace('/onboarding/questionnaire');
  };

  return (
    <ScreenFrame>
      <Chip label="Step 1 · The Birth Portal" tone="accent" />
      <Text variant="displayLg" style={{ marginTop: t.spacing.lg }}>Your cosmic coordinates</Text>
      <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
        Your birth moment maps your celestial story. The more precise the time, the
        truer the reading.
      </Text>

      <Card style={{ marginTop: t.spacing.xl }}>
        <Labeled t={t} label="Date of birth (YYYY-MM-DD)">
          <TextInput value={date} onChangeText={setDate} placeholder="1995-03-18" placeholderTextColor={t.colors.textFaint} keyboardType="numbers-and-punctuation" style={inputStyle(t)} />
        </Labeled>
        <Divider t={t} />
        <Labeled t={t} label="Time of birth (HH:MM, 24h)">
          <TextInput value={time} onChangeText={setTime} placeholder="07:45" placeholderTextColor={t.colors.textFaint} keyboardType="numbers-and-punctuation" style={inputStyle(t)} />
        </Labeled>
        <Divider t={t} />
        <Labeled t={t} label="Place of birth">
          <TextInput value={place ? place.place : placeQuery} onChangeText={onPlaceChange} placeholder="Start typing a city…" placeholderTextColor={t.colors.textFaint} style={inputStyle(t)} />
          {searching && <ActivityIndicator color={t.colors.primary} style={{ marginTop: t.spacing.sm, alignSelf: 'flex-start' }} />}
          {!place && results.map((r) => (
            <Pressable key={r.place + r.latitude} onPress={() => { setPlace(r); setResults([]); }} style={{ paddingVertical: t.spacing.sm, borderTopWidth: 1, borderTopColor: t.colors.border }}>
              <Text variant="body">{r.place}</Text>
              <Text variant="caption" color="textFaint">{r.latitude.toFixed(2)}, {r.longitude.toFixed(2)} · {r.timezone}</Text>
            </Pressable>
          ))}
          {place && <Chip label={`✓ ${place.timezone}`} tone="success" style={{ marginTop: t.spacing.sm }} />}
        </Labeled>
      </Card>

      <Text variant="overline" color="textFaint" uppercase style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.sm }}>
        Your consent · granular & withdrawable
      </Text>
      {CONSENTS.map((c) => (
        <Card key={c.key} style={{ marginBottom: t.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: t.spacing.lg }}>
              <Text variant="title">{c.label}</Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{c.help}</Text>
              {c.required && <Chip label="Required for matching" tone="primary" style={{ marginTop: t.spacing.sm }} />}
            </View>
            <Toggle value={consent[c.key]} disabled={c.required} onChange={(v) => setConsent((s) => ({ ...s, [c.key]: v }))} />
          </View>
        </Card>
      ))}

      <Text variant="caption" color="textFaint" style={{ marginVertical: t.spacing.lg }}>
        Each choice is logged to an append-only consent record you can review or revoke
        anytime in Settings. Your birth and chat data are encrypted. We never sell your data.
      </Text>

      <Button label="Create my soul blueprint" disabled={!canContinue} onPress={submit} />
    </ScreenFrame>
  );
}

function inputStyle(t: ReturnType<typeof useTheme>) {
  return { color: t.colors.text, fontFamily: t.fontFamily.bodyMedium, fontSize: 17, marginTop: 4, paddingVertical: t.spacing.xs } as const;
}
function Labeled({ t, label, children }: { t: ReturnType<typeof useTheme>; label: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingVertical: t.spacing.sm }}>
      <Text variant="overline" color="textFaint" uppercase>{label}</Text>
      {children}
    </View>
  );
}
function Divider({ t }: { t: ReturnType<typeof useTheme> }) {
  return <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: t.spacing.xs }} />;
}
