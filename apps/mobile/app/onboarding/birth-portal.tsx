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
import { DateTimeField } from '../../src/components/fx/DateTimeField';
import { useTheme } from '../../src/theme/ThemeProvider';
import { searchPlaces, Place } from '../../src/data/placeSearch';
import { MARITAL_OPTIONS, MaritalStatus } from '../../src/data/types';
import { setMyBirth, setMyAge, setMyGender, setMySeeking, setMyMaritalStatus } from '../../src/data/store';

type Consent = { key: string; label: string; help: string; required?: boolean; default?: boolean };
const CONSENTS: Consent[] = [
  { key: 'birth_data_matching', label: 'Use my birth details for matching', help: 'Date, time & place of birth, encrypted and never shown to others.', required: true },
  { key: 'psychometric_profiling', label: 'Build my psychological profile', help: 'Attachment, values & goals power your compatibility score.', required: true },
  { key: 'photo_display_to_matches', label: 'Show my photos to matches only', help: 'Visible to a confirmed match, never publicly.', default: true },
  { key: 'product_analytics', label: 'Share anonymous usage analytics', help: 'Helps us improve. Pseudonymised. Optional.', default: false },
  { key: 'marketing_comms', label: 'Send me tips & offers', help: 'Optional. Withdraw anytime in Settings.', default: false },
];

// 18+ gate: the most recent allowable birth date.
const eighteenYearsAgo = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; })();

function ageFromDate(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const dob = new Date(y, m - 1, d);
  const now = new Date();
  let a = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) a--;
  return a;
}

export default function BirthPortal() {
  const t = useTheme();
  const router = useRouter();

  const [gender, setGender] = useState<'woman' | 'man' | 'nonbinary' | null>(null);
  const [seeking, setSeeking] = useState<'women' | 'men' | 'everyone' | null>(null);
  const [marital, setMarital] = useState<MaritalStatus | null>(null);
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
  const canContinue = !!gender && !!seeking && !!marital && validDate && validTime && !!place && consentOk;

  const submit = async () => {
    if (!place || !gender || !seeking || !marital) return;
    await setMyGender(gender);
    await setMySeeking(seeking);
    await setMyMaritalStatus(marital);
    await setMyBirth({ date, time, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone, place: place.place });
    await setMyAge(ageFromDate(date));
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

      {/* Gender + who you'd like to meet */}
      <Card style={{ marginTop: t.spacing.xl }}>
        <Text variant="overline" color="textFaint" uppercase>I am a</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.sm }}>
          {([['woman', 'Woman'], ['man', 'Man'], ['nonbinary', 'Non-binary']] as const).map(([v, label]) => (
            <SelectPill key={v} t={t} label={label} on={gender === v} onPress={() => setGender(v)} />
          ))}
        </View>
        <Divider t={t} />
        <Text variant="overline" color="textFaint" uppercase>Show me</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.sm }}>
          {([['women', 'Women'], ['men', 'Men'], ['everyone', 'Everyone']] as const).map(([v, label]) => (
            <SelectPill key={v} t={t} label={label} on={seeking === v} onPress={() => setSeeking(v)} />
          ))}
        </View>
        <Divider t={t} />
        <Text variant="overline" color="textFaint" uppercase>Marital status</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.sm }}>
          {MARITAL_OPTIONS.map((o) => (
            <Pressable key={o.v} onPress={() => setMarital(o.v)}
              style={{ backgroundColor: marital === o.v ? t.colors.primary : t.colors.bgSunken, borderWidth: 1, borderColor: marital === o.v ? t.colors.primary : 'transparent', borderRadius: t.radii.pill, paddingVertical: t.spacing.sm, paddingHorizontal: t.spacing.lg }}>
              <Text variant="label" color={marital === o.v ? 'textOnPrimary' : 'textMuted'}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={{ marginTop: t.spacing.md }}>
        <DateTimeField mode="date" label="Date of birth" value={date} maximumDate={eighteenYearsAgo} onChange={(c) => setDate(c)} />
        <Divider t={t} />
        <DateTimeField mode="time" label="Time of birth" value={time} onChange={(c) => setTime(c)} />
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
function SelectPill({ t, label, on, onPress }: { t: ReturnType<typeof useTheme>; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, backgroundColor: on ? t.colors.primary : t.colors.bgSunken, borderWidth: 1, borderColor: on ? t.colors.primary : 'transparent', borderRadius: t.radii.pill, paddingVertical: t.spacing.md, alignItems: 'center' }}>
      <Text variant="label" color={on ? 'textOnPrimary' : 'textMuted'}>{label}</Text>
    </Pressable>
  );
}
function Divider({ t }: { t: ReturnType<typeof useTheme> }) {
  return <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: t.spacing.xs }} />;
}
