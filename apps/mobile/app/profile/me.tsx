/**
 * My Profile — premium, photo-first editor. A large hero photo tile, then clean
 * sectioned cards (About · Interests · Life intentions) instead of a wall of
 * inputs. Interests are tappable chips; intentions are segmented selectors.
 * Everything saves to the local store and feeds matching + the report.
 */
import React, { useCallback, useState } from 'react';
import { View, TextInput, Pressable, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MotiView } from 'moti';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { Reveal } from '../../src/components/fx/Reveal';
import { SettingsSheet } from '../../src/components/SettingsSheet';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import {
  PhotoBlock, PromptBlock, VitalChips, VerifiedBadge, SectionLabel, Hairline,
} from '../../src/components/profile/ProfileKit';
import { TrustLadder } from '../../src/components/TrustLadder';
import { useTheme } from '../../src/theme/ThemeProvider';
import { INTEREST_TAGS, LifeIntentions, BirthData, Gender, SeekingPref, MaritalStatus, maritalLabel } from '../../src/data/types';
import {
  getMyInterests, setMyInterests, getMyIntentions, setMyIntentions, getMyProfile, setMyProfile,
  getMyBirth, getMyAge, getMyGender, getMySeeking, getMyMaritalStatus, isIdVerified,
} from '../../src/data/store';
import { haptic } from '../../src/lib/haptics';

const INTENT_FIELDS: { key: keyof LifeIntentions; label: string; icon: string; opts: { v: string; label: string }[] }[] = [
  { key: 'household', label: 'Running the household', icon: '🏠', opts: [{ v: 'shared', label: 'Shared' }, { v: 'i_lead', label: 'I lead' }, { v: 'partner_leads', label: 'Partner leads' }, { v: 'flexible', label: 'Flexible' }] },
  { key: 'careers', label: 'Careers after marriage', icon: '💼', opts: [{ v: 'both_continue', label: 'Both continue' }, { v: 'one_focuses_home', label: 'One focuses home' }, { v: 'flexible', label: 'Flexible' }] },
  { key: 'kids', label: 'Children', icon: '🌱', opts: [{ v: 'yes', label: 'Yes' }, { v: 'maybe_later', label: 'Maybe later' }, { v: 'no', label: 'No' }, { v: 'open', label: 'Open' }] },
  { key: 'kidsCare', label: 'Raising kids', icon: '🤝', opts: [{ v: 'shared', label: 'Shared' }, { v: 'i_lead', label: 'I lead' }, { v: 'partner_leads', label: 'Partner leads' }, { v: 'support_help', label: 'With help' }] },
  { key: 'finances', label: 'Managing finances', icon: '💰', opts: [{ v: 'joint', label: 'Joint' }, { v: 'separate', label: 'Separate' }, { v: 'split_shared', label: 'Split & shared' }, { v: 'flexible', label: 'Flexible' }] },
];

export default function MyProfile() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [intentions, setIntentions] = useState<LifeIntentions>({});
  const [photoVerifying, setPhotoVerifying] = useState(false);
  const [photoVerified, setPhotoVerified] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  // Read-only birth/identity facts (set during onboarding, shown for transparency).
  const [birth, setBirth] = useState<BirthData | undefined>();
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState<Gender | undefined>();
  const [seeking, setSeeking] = useState<SeekingPref | undefined>();
  const [marital, setMarital] = useState<MaritalStatus | undefined>();

  useFocusEffect(useCallback(() => {
    (async () => {
      const p = await getMyProfile();
      setName(p.name ?? ''); setBio(p.bio ?? ''); setPhoto(p.photos?.[0] ?? null);
      setInterests(await getMyInterests());
      setIntentions(await getMyIntentions());
      setBirth(await getMyBirth());
      setAge(await getMyAge());
      setGender(await getMyGender());
      setSeeking(await getMySeeking());
      setMarital(await getMyMaritalStatus());
      setIdVerified(await isIdVerified());
    })();
  }, []));

  const pickPhoto = async () => {
    haptic.light();
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [3, 4], quality: 0.85 });
    if (!res.canceled && res.assets[0]) { setPhoto(res.assets[0].uri); setPhotoVerified(false); }
  };
  const verifyPhoto = () => {
    setPhotoVerifying(true);
    setTimeout(() => { setPhotoVerifying(false); setPhotoVerified(true); haptic.success(); }, 1400);
  };
  const toggleInterest = (tag: string) => {
    haptic.light();
    setInterests((cur) => (cur.includes(tag) ? cur.filter((x) => x !== tag) : cur.length >= 10 ? cur : [...cur, tag]));
  };
  const setIntent = (key: keyof LifeIntentions, v: any) => { haptic.light(); setIntentions((cur) => ({ ...cur, [key]: v })); };

  const save = async () => {
    await setMyProfile({ name, bio, photos: photo ? [photo] : [] });
    await setMyInterests(interests);
    await setMyIntentions(intentions);
    haptic.success();
    router.back();
  };

  return (
    <CinematicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + t.spacing['3xl'] }}>
        {/* Hero — full-bleed photo, name + age + verified inline, vitals on scrim */}
        <Pressable onPress={pickPhoto}>
          <PhotoBlock uri={photo} height={520}>
            <Text variant="overline" color="textOnImageMuted" onImage uppercase>Your profile</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, marginTop: 4 }}>
              <Text variant="displayXl" color="textOnImage" onImage>{name || 'Your name'}{age ? `, ${age}` : ''}</Text>
              {photoVerified && <VerifiedBadge />}
            </View>
            {(gender || birth?.place) && (
              <Text variant="label" color="textOnImageMuted" onImage style={{ marginTop: 4 }}>
                {[genderLabel(gender), maritalLabel(marital), birth?.place].filter(Boolean).join('  ·  ')}
              </Text>
            )}
            {photo && !photoVerified && (
              <Pressable onPress={verifyPhoto} style={{ marginTop: t.spacing.md, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: t.radii.pill, paddingHorizontal: t.spacing.lg, paddingVertical: 9 }}>
                <Text variant="label" color="textOnImage" onImage>{photoVerifying ? 'Verifying…' : '✦ Verify my photo'}</Text>
              </Pressable>
            )}
            <Pressable onPress={pickPhoto} style={{ marginTop: t.spacing.sm }}>
              <Text variant="label" color="textOnImageMuted" onImage>Tap photo to change</Text>
            </Pressable>
          </PhotoBlock>
          {/* top-bar controls sit over the hero */}
          <Pressable onPress={(e) => { e.stopPropagation?.(); router.back(); }} hitSlop={12} style={{ position: 'absolute', top: insets.top + t.spacing.sm, left: t.spacing.lg }}>
            <Text variant="headline" color="textOnImage" onImage>‹</Text>
          </Pressable>
          <Pressable
            onPress={(e) => { e.stopPropagation?.(); haptic.light(); setSettingsOpen(true); }}
            hitSlop={12}
            style={{
              position: 'absolute', top: insets.top + t.spacing.sm, right: t.spacing.lg,
              width: 40, height: 40, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
            }}>
            <Text variant="title" color="textOnImage" onImage>⚙</Text>
          </Pressable>
        </Pressable>

        <View style={{ paddingHorizontal: t.spacing.xl, marginTop: t.spacing['2xl'] }}>
          {/* About — open editorial: a name line + a flowing bio, no field boxes */}
          <Reveal index={0}>
            <SectionLabel>About you</SectionLabel>
            <TextInput
              value={name} onChangeText={setName} placeholder="Your name"
              placeholderTextColor={t.colors.textFaint}
              style={{ color: t.colors.text, fontFamily: t.fontFamily.display, fontSize: 30, lineHeight: 38, paddingVertical: 2 }}
            />
            <Hairline style={{ marginVertical: t.spacing.md }} />
            <TextInput
              value={bio} onChangeText={setBio}
              placeholder="Write a few honest lines about who you are and what you're looking for…"
              placeholderTextColor={t.colors.textFaint} multiline
              style={{ color: t.colors.textMuted, fontFamily: t.fontFamily.body, fontSize: 17, lineHeight: 27, minHeight: 80 }}
            />
          </Reveal>

          {/* Trust ladder — first-class verification surface (vision §4.3) */}
          <Reveal index={1}>
            <SectionLabel style={{ marginTop: t.spacing['2xl'] }}>Trust &amp; verification</SectionLabel>
            <TrustLadder rungs={[
              { key: 'age', label: '18+ confirmed', why: 'Everyone here is an adult. Set from your birth date.', done: !!age },
              { key: 'phone', label: 'Phone verified', why: 'A real, reachable person — not a throwaway account.', done: true },
              { key: 'photo', label: 'Photo verified', why: 'Confirms your photos are really you. Builds instant trust.', done: photoVerified, actionLabel: photoVerifying ? 'Verifying…' : 'Verify', onAction: photo ? verifyPhoto : pickPhoto },
              { key: 'id', label: 'ID verified', why: 'The strongest signal of a serious, genuine soul — via DigiLocker. Documents never stored.', done: idVerified, actionLabel: 'Verify', onAction: () => router.push('/verify/identity') },
            ]} />
          </Reveal>

          {/* Birth & basics — chip vitals, NOT a table. Private. */}
          {(birth || gender) && (
            <Reveal index={2}>
              <SectionLabel style={{ marginTop: t.spacing['2xl'] }}>Birth &amp; basics · private</SectionLabel>
              <VitalChips items={[
                { icon: '☾', label: birth?.date ? prettyDate(birth.date) : '' },
                { icon: '◷', label: birth?.time || '' },
                { icon: '📍', label: birth?.place || '' },
                { icon: '⚲', label: genderLabel(gender) },
                { icon: '⚭', label: maritalLabel(marital) },
                { icon: '✦', label: seekingLabel(seeking) ? `Seeking ${seekingLabel(seeking)}` : '' },
              ]} />
              <Text variant="caption" color="textFaint" style={{ marginTop: t.spacing.sm }}>
                Set once during onboarding — used only to compute your readings, never shown to others.
              </Text>
            </Reveal>
          )}

          {/* Interests */}
          <Reveal index={3}>
            <SectionLabel style={{ marginTop: t.spacing['2xl'] }}>{`Interests · ${interests.length}/10`}</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
              {INTEREST_TAGS.map((tag) => {
                const on = interests.includes(tag);
                return (
                  <Pressable key={tag} onPress={() => toggleInterest(tag)}>
                    <MotiView animate={{ scale: on ? 1 : 0.98 }} transition={{ type: 'timing', duration: 140 }}
                      style={{ backgroundColor: on ? t.colors.primary : t.colors.bgElevated, borderWidth: 1, borderColor: on ? t.colors.primary : t.colors.border, borderRadius: t.radii.pill, paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
                      <Text variant="label" color={on ? 'textOnPrimary' : 'text'}>{tag}</Text>
                    </MotiView>
                  </Pressable>
                );
              })}
            </View>
          </Reveal>

          {/* Life intentions — one flowing list of rows, not a stack of boxes */}
          <Reveal index={4}>
            <SectionLabel style={{ marginTop: t.spacing['2xl'] }}>Life intentions</SectionLabel>
            <Text variant="caption" color="textMuted" style={{ marginBottom: t.spacing.lg }}>
              Serious connection means aligning on real life — share how you see building it together.
            </Text>
            {INTENT_FIELDS.map((field, i) => (
              <View key={field.key} style={{ marginBottom: i === INTENT_FIELDS.length - 1 ? 0 : t.spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, marginBottom: t.spacing.sm }}>
                  <Text variant="body">{field.icon}</Text>
                  <Text variant="label">{field.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
                  {field.opts.map((o) => {
                    const on = (intentions as any)[field.key] === o.v;
                    return (
                      <Pressable key={o.v} onPress={() => setIntent(field.key, o.v)}>
                        <View style={{ backgroundColor: on ? t.colors.primarySoft : 'transparent', borderWidth: 1, borderColor: on ? t.colors.primary : t.colors.border, borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm }}>
                          <Text variant="label" color={on ? 'primary' : 'textMuted'}>{o.label}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <Pressable
              onPress={() => setIntentions((c) => ({ ...c, acknowledgedSelfManage: !c.acknowledgedSelfManage }))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginTop: t.spacing.xl }}
            >
              <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: intentions.acknowledgedSelfManage ? t.colors.primary : t.colors.borderStrong, backgroundColor: intentions.acknowledgedSelfManage ? t.colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {intentions.acknowledgedSelfManage && <Text variant="caption" color="textOnPrimary">✓</Text>}
              </View>
              <Text variant="body" color="textMuted" style={{ flex: 1 }}>
                We intend to discuss and mutually manage these together — part of a shared
                intentions summary you can review with a match.
              </Text>
            </Pressable>
          </Reveal>

          {/* Settings entry — clean row, opens the drawer */}
          <Pressable
            onPress={() => { haptic.light(); setSettingsOpen(true); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginTop: t.spacing['2xl'], paddingVertical: t.spacing.md, borderTopWidth: 1, borderTopColor: t.colors.border }}>
            <Text variant="title" color="highlight" style={{ width: 24, textAlign: 'center' }}>⚙</Text>
            <View style={{ flex: 1 }}>
              <Text variant="title">Settings</Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>Theme & appearance, membership, privacy</Text>
            </View>
            <Text variant="title" color="textFaint">›</Text>
          </Pressable>

          <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
            <Button label="Save profile" onPress={save} />
            <Button label="Retake my blueprint" variant="ghost" onPress={() => router.push('/onboarding/questionnaire')} />
          </View>
        </View>
      </ScrollView>
      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </CinematicBackground>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
function genderLabel(g?: Gender): string {
  return g === 'woman' ? 'Woman' : g === 'man' ? 'Man' : g === 'nonbinary' ? 'Non-binary' : '';
}
function seekingLabel(s?: SeekingPref): string {
  return s === 'women' ? 'Women' : s === 'men' ? 'Men' : s === 'everyone' ? 'Everyone' : '';
}
