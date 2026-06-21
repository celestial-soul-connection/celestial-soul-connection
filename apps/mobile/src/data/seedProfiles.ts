/**
 * seedProfiles — a pool of candidate users to match against in dev, so the real
 * scoring algorithm has people to rank. Swap for real users via the backend later.
 * Photos are Unsplash portraits (swap for licensed brand imagery before launch).
 */
import { Profile } from './types';

export const SEED_PROFILES: Profile[] = [
  {
    id: 'p_aria', name: 'Aria', age: 29, city: 'Pune',
    photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=900&auto=format&fit=crop',
    blurb: 'Designer · 8th-house Venus · finds meaning in quiet mornings',
    psych: { attachmentSecure: 0.82, attachmentAnxious: 0.2, attachmentAvoidant: 0.15, openness: 0.78, conscientiousness: 0.7, extraversion: 0.55, agreeableness: 0.8, neuroticism: 0.3, wantsKids: 0.8, religiousImportance: 0.4, ambition: 0.7, familyOrientation: 0.75, adventurousness: 0.7, conflictRepair: 0.8, intent: 0.9 },
  },
  {
    id: 'p_kabir', name: 'Kabir', age: 33, city: 'Bengaluru',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=900&auto=format&fit=crop',
    blurb: 'Architect · Saturn-grounded · believes in slow, real love',
    psych: { attachmentSecure: 0.7, attachmentAnxious: 0.25, attachmentAvoidant: 0.3, openness: 0.6, conscientiousness: 0.85, extraversion: 0.4, agreeableness: 0.7, neuroticism: 0.35, wantsKids: 0.7, religiousImportance: 0.5, ambition: 0.8, familyOrientation: 0.7, adventurousness: 0.5, conflictRepair: 0.75, intent: 0.85 },
  },
  {
    id: 'p_meera', name: 'Meera', age: 27, city: 'Mumbai',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=900&auto=format&fit=crop',
    blurb: 'Doctor · Moon in Cancer · soft heart, steady hands',
    psych: { attachmentSecure: 0.88, attachmentAnxious: 0.15, attachmentAvoidant: 0.1, openness: 0.65, conscientiousness: 0.9, extraversion: 0.5, agreeableness: 0.88, neuroticism: 0.2, wantsKids: 0.9, religiousImportance: 0.6, ambition: 0.75, familyOrientation: 0.9, adventurousness: 0.55, conflictRepair: 0.88, intent: 0.95 },
  },
  {
    id: 'p_dev', name: 'Dev', age: 31, city: 'Delhi',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=900&auto=format&fit=crop',
    blurb: 'Founder · Mars-driven · adventure first, depth always',
    psych: { attachmentSecure: 0.6, attachmentAnxious: 0.4, attachmentAvoidant: 0.35, openness: 0.85, conscientiousness: 0.6, extraversion: 0.8, agreeableness: 0.6, neuroticism: 0.45, wantsKids: 0.5, religiousImportance: 0.2, ambition: 0.95, familyOrientation: 0.5, adventurousness: 0.9, conflictRepair: 0.6, intent: 0.7 },
  },
  {
    id: 'p_sana', name: 'Sana', age: 30, city: 'Hyderabad',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=900&auto=format&fit=crop',
    blurb: 'Writer · Mercury-bright · curious about everything, especially you',
    psych: { attachmentSecure: 0.78, attachmentAnxious: 0.3, attachmentAvoidant: 0.18, openness: 0.92, conscientiousness: 0.65, extraversion: 0.6, agreeableness: 0.82, neuroticism: 0.32, wantsKids: 0.6, religiousImportance: 0.3, ambition: 0.7, familyOrientation: 0.65, adventurousness: 0.85, conflictRepair: 0.8, intent: 0.88 },
  },
];

/** Per-match conversation opener (the "soul probe"). */
export const PROBES = [
  'What’s a fear you recently released that let more light into your life?',
  'When do you feel most like yourself?',
  'What does a quiet, ordinary day with someone you love look like to you?',
  'What belief about love have you changed your mind on?',
];
