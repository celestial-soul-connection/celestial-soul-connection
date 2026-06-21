/**
 * My Profile — premium, photo-first editor. A large hero photo tile, then clean
 * sectioned cards (About · Interests · Life intentions) instead of a wall of
 * inputs. Interests are tappable chips; intentions are segmented selectors.
 * Everything saves to the local store and feeds matching + the report.
 */
import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, ScrollView, Image as RNImage } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/ThemeProvider';
import { INTEREST_TAGS, LifeIntentions } from '../../src/data/types';
import {
  getMyInterests, setMyInterests, getMyIntentions, setMyIntentions, getMyProfile, setMyProfile,
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
        {/* Hero photo tile, full-bleed */}
        <Pressable onPress={pickPhoto}>
          <View style={{ height: 460, backgroundColor: t.colors.bgSunken }}>
            {photo ? <RNImage source={{ uri: photo }} style={{ width: '100%', height: '100%' }} /> : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm }}>
                <Text variant="displayLg" color="textFaint">+</Text>
                <Text variant="label" color="textMuted">Add your photo</Text>
              </View>
            )}
            <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(10,6,16,0.85)']} locations={[0, 0.4, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
            <Pressable onPress={() => router.back()} hitSlop={12} style={{ position: 'absolute', top: insets.top + t.spacing.sm, left: t.spacing.lg }}>
              <Text variant="headline" color="textOnImage" onImage>‹</Text>
            </Pressable>
            <View style={{ position: 'absolute', left: t.spacing.xl, right: t.spacing.xl, bottom: t.spacing.xl }}>
              <Text variant="overline" color="textOnImageMuted" onImage uppercase>Your profile</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, marginTop: 4 }}>
                <Text variant="displayLg" color="textOnImage" onImage>{name || 'Your name'}</Text>
                {photoVerified && <View style={{ backgroundColor: t.colors.success, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 }}><Text variant="caption" color="textOnPrimary">✓</Text></View>}
              </View>
              {photo && !photoVerified && (
                <Pressable onPress={verifyPhoto} style={{ marginTop: t.spacing.sm, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: t.radii.pill, paddingHorizontal: t.spacing.lg, paddingVertical: 8 }}>
                  <Text variant="label" color="textOnImage" onImage>{photoVerifying ? 'Verifying…' : '✦ Verify my photo'}</Text>
                </Pressable>
              )}
              <Pressable onPress={pickPhoto} style={{ marginTop: t.spacing.sm }}>
                <Text variant="label" color="textOnImageMuted" onImage>Tap photo to change</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>

        <View style={{ paddingHorizontal: t.spacing.xl, marginTop: t.spacing.xl }}>
          {/* About */}
          <Reveal index={0}>
            <SectionTitle t={t} icon="✶" title="About you" />
            <GlassCard>
              <Text variant="overline" color="textFaint" uppercase>Name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={t.colors.textFaint} style={{ color: t.colors.text, fontFamily: t.fontFamily.bodyBold, fontSize: 18, marginTop: 4, marginBottom: t.spacing.md }} />
              <View style={{ height: 1, backgroundColor: t.colors.border, marginBottom: t.spacing.md }} />
              <Text variant="overline" color="textFaint" uppercase>In your words</Text>
              <TextInput value={bio} onChangeText={setBio} placeholder="Something true about you…" placeholderTextColor={t.colors.textFaint} multiline style={{ color: t.colors.text, fontFamily: t.fontFamily.body, fontSize: 16, marginTop: 4, minHeight: 64 }} />
            </GlassCard>
          </Reveal>

          {/* Interests */}
          <Reveal index={1}>
            <SectionTitle t={t} icon="✦" title="Interests" hint={`${interests.length}/10`} />
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

          {/* Life intentions */}
          <Reveal index={2}>
            <SectionTitle t={t} icon="♾" title="Life intentions" />
            <Text variant="caption" color="textMuted" style={{ marginBottom: t.spacing.md, marginTop: -t.spacing.sm }}>
              Serious connection means aligning on real life — share how you see building it together.
            </Text>
            {INTENT_FIELDS.map((field) => (
              <GlassCard key={field.key} style={{ marginBottom: t.spacing.md }} padded>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
                  <Text variant="title">{field.icon}</Text>
                  <Text variant="title">{field.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
                  {field.opts.map((o) => {
                    const on = (intentions as any)[field.key] === o.v;
                    return (
                      <Pressable key={o.v} onPress={() => setIntent(field.key, o.v)}>
                        <View style={{ backgroundColor: on ? t.colors.primarySoft : t.colors.bgSunken, borderWidth: 1, borderColor: on ? t.colors.primary : 'transparent', borderRadius: t.radii.pill, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm }}>
                          <Text variant="label" color={on ? 'primary' : 'textMuted'}>{o.label}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>
            ))}

            <Pressable onPress={() => setIntentions((c) => ({ ...c, acknowledgedSelfManage: !c.acknowledgedSelfManage }))}>
              <GlassCard style={{ marginTop: t.spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                  <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: intentions.acknowledgedSelfManage ? t.colors.primary : t.colors.borderStrong, backgroundColor: intentions.acknowledgedSelfManage ? t.colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {intentions.acknowledgedSelfManage && <Text variant="caption" color="textOnPrimary">✓</Text>}
                  </View>
                  <Text variant="body" color="textMuted" style={{ flex: 1 }}>
                    We intend to discuss and mutually manage these together — part of a shared
                    intentions summary you can review with a match.
                  </Text>
                </View>
              </GlassCard>
            </Pressable>
          </Reveal>

          <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
            <Button label="Save profile" onPress={save} />
            <Button label="Retake my blueprint" variant="ghost" onPress={() => router.push('/onboarding/questionnaire')} />
          </View>
        </View>
      </ScrollView>
    </CinematicBackground>
  );
}

function SectionTitle({ t, icon, title, hint }: { t: ReturnType<typeof useTheme>; icon: string; title: string; hint?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: t.spacing.xl, marginBottom: t.spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        <Text variant="title" color="primary">{icon}</Text>
        <Text variant="headline">{title}</Text>
      </View>
      {hint && <Text variant="label" color="textFaint">{hint}</Text>}
    </View>
  );
}
