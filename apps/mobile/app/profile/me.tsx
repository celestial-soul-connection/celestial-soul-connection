/**
 * My Profile — view/edit name, bio, photo, interests, and marriage-intent
 * "life intentions" (household, careers, kids, finances). These feed the
 * compatibility score (interests) and the report (intentions). Includes a photo
 * verification stub and a "retake blueprint" link.
 */
import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, ScrollView, Image as RNImage } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { useTheme } from '../../src/theme/ThemeProvider';
import { INTEREST_TAGS, LifeIntentions } from '../../src/data/types';
import {
  getMyInterests, setMyInterests, getMyIntentions, setMyIntentions, getMyProfile, setMyProfile,
} from '../../src/data/store';
import { haptic } from '../../src/lib/haptics';

const INTENT_FIELDS: { key: keyof LifeIntentions; label: string; opts: { v: string; label: string }[] }[] = [
  { key: 'household', label: 'Running the household', opts: [{ v: 'shared', label: 'Shared' }, { v: 'i_lead', label: 'I lead' }, { v: 'partner_leads', label: 'Partner leads' }, { v: 'flexible', label: 'Flexible' }] },
  { key: 'careers', label: 'Careers after marriage', opts: [{ v: 'both_continue', label: 'Both continue' }, { v: 'one_focuses_home', label: 'One focuses on home' }, { v: 'flexible', label: 'Flexible' }] },
  { key: 'kids', label: 'Children', opts: [{ v: 'yes', label: 'Yes' }, { v: 'maybe_later', label: 'Maybe later' }, { v: 'no', label: 'No' }, { v: 'open', label: 'Open' }] },
  { key: 'kidsCare', label: 'Raising / managing kids', opts: [{ v: 'shared', label: 'Shared' }, { v: 'i_lead', label: 'I lead' }, { v: 'partner_leads', label: 'Partner leads' }, { v: 'support_help', label: 'With support/help' }] },
  { key: 'finances', label: 'Managing finances', opts: [{ v: 'joint', label: 'Joint' }, { v: 'separate', label: 'Separate' }, { v: 'split_shared', label: 'Split & shared' }, { v: 'flexible', label: 'Flexible' }] },
];

export default function MyProfile() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [intentions, setIntentions] = useState<LifeIntentions>({});
  const [photoVerifying, setPhotoVerifying] = useState(false);
  const [photoVerified, setPhotoVerified] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getMyProfile();
      setName(p.name ?? ''); setBio(p.bio ?? ''); setPhoto(p.photos?.[0] ?? null);
      setInterests(await getMyInterests());
      setIntentions(await getMyIntentions());
    })();
  }, []);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!res.canceled && res.assets[0]) { setPhoto(res.assets[0].uri); setPhotoVerified(false); }
  };

  const verifyPhoto = () => {
    setPhotoVerifying(true);
    // Stub: a real selfie-match verification call goes here.
    setTimeout(() => { setPhotoVerifying(false); setPhotoVerified(true); haptic.success(); }, 1400);
  };

  const toggleInterest = (tag: string) => {
    haptic.light();
    setInterests((cur) => (cur.includes(tag) ? cur.filter((x) => x !== tag) : cur.length >= 10 ? cur : [...cur, tag]));
  };
  const setIntent = (key: keyof LifeIntentions, v: any) => setIntentions((cur) => ({ ...cur, [key]: v }));

  const save = async () => {
    await setMyProfile({ name, bio, photos: photo ? [photo] : [] });
    await setMyInterests(interests);
    await setMyIntentions(intentions);
    haptic.success();
    router.back();
  };

  return (
    <CinematicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + t.spacing.sm, paddingBottom: insets.bottom + t.spacing.xl, paddingHorizontal: t.spacing.xl }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text variant="headline" color="textMuted">‹</Text></Pressable>
        <Text variant="displayLg" style={{ marginTop: t.spacing.xs }}>Your profile</Text>

        {/* Photo */}
        <View style={{ alignItems: 'center', marginTop: t.spacing.lg }}>
          <Pressable onPress={pickPhoto}>
            {photo ? (
              <RNImage source={{ uri: photo }} style={{ width: 120, height: 120, borderRadius: 120 }} />
            ) : (
              <View style={{ width: 120, height: 120, borderRadius: 120, backgroundColor: t.colors.bgSunken, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="label" color="textMuted">Add photo</Text>
              </View>
            )}
          </Pressable>
          {photo && (photoVerified ? (
            <Chip label="✓ Photo verified" tone="success" style={{ marginTop: t.spacing.sm }} />
          ) : (
            <Pressable onPress={verifyPhoto} style={{ marginTop: t.spacing.sm }}>
              <Chip label={photoVerifying ? 'Verifying…' : 'Verify my photo'} tone="primary" />
            </Pressable>
          ))}
        </View>

        <GlassCard style={{ marginTop: t.spacing.xl }}>
          <Text variant="overline" color="textFaint" uppercase>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={t.colors.textFaint} style={{ color: t.colors.text, fontFamily: t.fontFamily.bodyBold, fontSize: 18, marginTop: 4 }} />
          <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: t.spacing.md }} />
          <Text variant="overline" color="textFaint" uppercase>About you</Text>
          <TextInput value={bio} onChangeText={setBio} placeholder="A few honest words…" placeholderTextColor={t.colors.textFaint} multiline style={{ color: t.colors.text, fontFamily: t.fontFamily.body, fontSize: 15, marginTop: 4, minHeight: 60 }} />
        </GlassCard>

        {/* Interests */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.xs }}>Interests</Text>
        <Text variant="caption" color="textMuted" style={{ marginBottom: t.spacing.md }}>Pick up to 10. Shared interests gently boost compatibility.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          {INTEREST_TAGS.map((tag) => {
            const on = interests.includes(tag);
            return (
              <Pressable key={tag} onPress={() => toggleInterest(tag)}>
                <View style={{ backgroundColor: on ? t.colors.primary : t.colors.bgElevated, borderWidth: 1, borderColor: on ? t.colors.primary : t.colors.border, borderRadius: t.radii.pill, paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
                  <Text variant="label" color={on ? 'textOnPrimary' : 'text'}>{tag}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Life intentions */}
        <Text variant="title" style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.xs }}>Life intentions</Text>
        <Text variant="caption" color="textMuted" style={{ marginBottom: t.spacing.md }}>
          Serious connection means aligning on real life. Share how you see managing a life together.
        </Text>
        {INTENT_FIELDS.map((field) => (
          <View key={field.key} style={{ marginBottom: t.spacing.lg }}>
            <Text variant="body" style={{ marginBottom: t.spacing.sm }}>{field.label}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
              {field.opts.map((o) => {
                const on = (intentions as any)[field.key] === o.v;
                return (
                  <Pressable key={o.v} onPress={() => setIntent(field.key, o.v)}>
                    <View style={{ backgroundColor: on ? t.colors.primarySoft : t.colors.bgElevated, borderWidth: 1, borderColor: on ? t.colors.primary : t.colors.border, borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm }}>
                      <Text variant="label" color={on ? 'primary' : 'textMuted'}>{o.label}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Acknowledgment → future contract seam */}
        <Pressable onPress={() => setIntentions((c) => ({ ...c, acknowledgedSelfManage: !c.acknowledgedSelfManage }))}>
          <GlassCard style={{ marginTop: t.spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
              <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: intentions.acknowledgedSelfManage ? t.colors.primary : t.colors.borderStrong, backgroundColor: intentions.acknowledgedSelfManage ? t.colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {intentions.acknowledgedSelfManage && <Text variant="caption" color="textOnPrimary">✓</Text>}
              </View>
              <Text variant="body" color="textMuted" style={{ flex: 1 }}>
                We intend to discuss and mutually manage these responsibilities ourselves. (Becomes part
                of a shared intentions summary you can review together.)
              </Text>
            </View>
          </GlassCard>
        </Pressable>

        <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
          <Button label="Save profile" onPress={save} />
          <Button label="Retake my blueprint" variant="ghost" onPress={() => router.push('/onboarding/questionnaire')} />
        </View>
      </ScrollView>
    </CinematicBackground>
  );
}
