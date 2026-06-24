/**
 * supabaseStore.ts — persist onboarding data to SUPABASE (profiles / birth_data /
 * psych_profiles) under the signed-in user. Writes are owner-scoped by RLS.
 *
 * These run ALONGSIDE the existing local AsyncStorage store during the migration:
 * local still drives the not-yet-ported features (deck/slots), while these make
 * the real data land in Supabase. Best-effort — a failure is logged, never blocks
 * the UX (e.g. if the user isn't signed in yet).
 */
import { supabase } from './supabase';
import { PsychProfile } from './types';

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function saveProfileToSupabase(fields: {
  name?: string;
  bio?: string;
  gender?: string;
  seeking?: string;
  marital?: string;
  city?: string;
  interests?: string[];
  intentions?: Record<string, any>;
  photos?: string[];
}): Promise<void> {
  const id = await uid();
  if (!id) return;
  const row: Record<string, any> = { id };
  if (fields.name !== undefined) row.display_name = fields.name;
  if (fields.bio !== undefined) row.bio = fields.bio;
  if (fields.gender !== undefined) row.gender = fields.gender;
  if (fields.seeking !== undefined) row.seeking = fields.seeking;
  if (fields.marital !== undefined) row.marital_status = fields.marital;
  if (fields.city !== undefined) row.city = fields.city;
  if (fields.interests !== undefined) row.interests = fields.interests;
  if (fields.intentions !== undefined) row.intentions = fields.intentions;
  if (fields.photos !== undefined) {
    row.photos = fields.photos;
    row.photo_url = fields.photos[0] ?? null;
  }
  const { error } = await supabase.from('profiles').upsert(row);
  if (error) console.warn('[supabase] profiles upsert:', error.message);
}

export async function saveBirthToSupabase(b: { date: string; time: string; place: string }): Promise<void> {
  const id = await uid();
  if (!id) return;
  // TODO(security): encrypt via an Edge Function before launch — these *_enc
  // columns hold PLAINTEXT for now. Birth details are sensitive (privacy §0).
  const { error } = await supabase
    .from('birth_data')
    .upsert({ user_id: id, dob_enc: b.date, time_enc: b.time, place_enc: b.place });
  if (error) console.warn('[supabase] birth_data upsert:', error.message);
}

export async function savePsychToSupabase(p: PsychProfile): Promise<void> {
  const id = await uid();
  if (!id) return;
  const pp = p as any;
  const row = {
    user_id: id,
    attachment_secure: pp.attachmentSecure ?? 0,
    attachment_anxious: pp.attachmentAnxious ?? 0,
    attachment_avoidant: pp.attachmentAvoidant ?? 0,
    big_five: {
      openness: pp.openness,
      conscientiousness: pp.conscientiousness,
      extraversion: pp.extraversion,
      agreeableness: pp.agreeableness,
      neuroticism: pp.neuroticism,
    },
    values: { ...pp }, // lossless: the full psych vector
    self_expansion: pp.adventurousness ?? 0,
    dealbreakers: [],
  };
  const { error } = await supabase.from('psych_profiles').upsert(row);
  if (error) console.warn('[supabase] psych_profiles upsert:', error.message);
}
