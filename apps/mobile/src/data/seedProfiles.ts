/**
 * seedProfiles — a pool of candidate users to match against in dev, so the real
 * scoring algorithm has people to rank. Swap for real users via the backend later.
 * Photos are Unsplash portraits (swap for licensed brand imagery before launch).
 */
import { Profile } from './types';

export const SEED_PROFILES: Profile[] = [
  {
    id: 'p_aria', name: 'Aria', age: 29, city: 'Pune', gender: 'woman', seeking: 'men', maritalStatus: 'unmarried',
    photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=900&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=900&auto=format&fit=crop',
    ],
    bio: 'I design quiet, useful things and believe mornings tell you who someone really is. Looking for steady, intentional love — someone to build slow with.',
    blurb: 'Designer · 8th-house Venus · finds meaning in quiet mornings',
    psych: { attachmentSecure: 0.82, attachmentAnxious: 0.2, attachmentAvoidant: 0.15, openness: 0.78, conscientiousness: 0.7, extraversion: 0.55, agreeableness: 0.8, neuroticism: 0.3, wantsKids: 0.8, religiousImportance: 0.4, ambition: 0.7, familyOrientation: 0.75, adventurousness: 0.7, conflictRepair: 0.8, intent: 0.9 },
    birth: { date: '1995-03-18', time: '07:45', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata', place: 'Pune, India' },
    verified: { phone: true, photo: true },
    interests: ['Travel', 'Arts & Music', 'Spirituality', 'Reading', 'Nature & outdoors'],
    intentions: { household: 'shared', careers: 'both_continue', kids: 'yes', kidsCare: 'shared', finances: 'split_shared', acknowledgedSelfManage: true },
  },
  {
    id: 'p_kabir', name: 'Kabir', age: 33, city: 'Bengaluru', gender: 'man', seeking: 'women', maritalStatus: 'divorced',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=900&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=900&auto=format&fit=crop',
    ],
    bio: 'Architect, second chapter. I learned the hard way that real love is slow and unglamorous — and worth it. Sunday markets, long drives, and an honest conversation.',
    blurb: 'Architect · Saturn-grounded · believes in slow, real love',
    psych: { attachmentSecure: 0.7, attachmentAnxious: 0.25, attachmentAvoidant: 0.3, openness: 0.6, conscientiousness: 0.85, extraversion: 0.4, agreeableness: 0.7, neuroticism: 0.35, wantsKids: 0.7, religiousImportance: 0.5, ambition: 0.8, familyOrientation: 0.7, adventurousness: 0.5, conflictRepair: 0.75, intent: 0.85 },
    birth: { date: '1991-08-22', time: '14:10', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata', place: 'Bengaluru, India' },
    verified: { phone: true, photo: false },
    interests: ['Career & ambition', 'Reading', 'Food & Cooking', 'Family time'],
    intentions: { household: 'shared', careers: 'both_continue', kids: 'yes', kidsCare: 'shared', finances: 'joint', acknowledgedSelfManage: true },
  },
  {
    id: 'p_meera', name: 'Meera', age: 27, city: 'Mumbai', gender: 'woman', seeking: 'men', maritalStatus: 'unmarried',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=900&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=900&auto=format&fit=crop',
    ],
    bio: 'Doctor by training, homebody by heart. I want a calm, kind partnership — someone who shows up, laughs easily, and wants a family one day.',
    blurb: 'Doctor · Moon in Cancer · soft heart, steady hands',
    psych: { attachmentSecure: 0.88, attachmentAnxious: 0.15, attachmentAvoidant: 0.1, openness: 0.65, conscientiousness: 0.9, extraversion: 0.5, agreeableness: 0.88, neuroticism: 0.2, wantsKids: 0.9, religiousImportance: 0.6, ambition: 0.75, familyOrientation: 0.9, adventurousness: 0.55, conflictRepair: 0.88, intent: 0.95 },
    birth: { date: '1997-12-05', time: '04:20', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata', place: 'Mumbai, India' },
    verified: { phone: true, photo: true },
    interests: ['Family time', 'Spirituality', 'Volunteering', 'Reading', 'Nature & outdoors'],
    intentions: { household: 'shared', careers: 'both_continue', kids: 'yes', kidsCare: 'shared', finances: 'joint', acknowledgedSelfManage: true },
  },
  {
    id: 'p_dev', name: 'Dev', age: 31, city: 'Delhi', gender: 'man', seeking: 'women', maritalStatus: 'unmarried',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=900&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?q=80&w=900&auto=format&fit=crop',
    ],
    bio: 'Building a company and a life worth coming home to. High energy, low drama. If you love spontaneous trips and big conversations, we’ll get along.',
    blurb: 'Founder · Mars-driven · adventure first, depth always',
    psych: { attachmentSecure: 0.6, attachmentAnxious: 0.4, attachmentAvoidant: 0.35, openness: 0.85, conscientiousness: 0.6, extraversion: 0.8, agreeableness: 0.6, neuroticism: 0.45, wantsKids: 0.5, religiousImportance: 0.2, ambition: 0.95, familyOrientation: 0.5, adventurousness: 0.9, conflictRepair: 0.6, intent: 0.7 },
    birth: { date: '1993-06-30', time: '21:15', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata', place: 'Delhi, India' },
    verified: { phone: true, photo: false },
    interests: ['Travel', 'Entrepreneurship', 'Fitness', 'Movies & series'],
    intentions: { household: 'flexible', careers: 'both_continue', kids: 'maybe_later', kidsCare: 'support_help', finances: 'separate' },
  },
  {
    id: 'p_sana', name: 'Sana', age: 30, city: 'Hyderabad', gender: 'woman', seeking: 'everyone', maritalStatus: 'unmarried',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=900&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?q=80&w=900&auto=format&fit=crop',
    ],
    bio: 'Writer, over-thinker, terrible at small talk but great at the real stuff. I want a partner who reads, argues kindly, and is curious about the world.',
    blurb: 'Writer · Mercury-bright · curious about everything, especially you',
    psych: { attachmentSecure: 0.78, attachmentAnxious: 0.3, attachmentAvoidant: 0.18, openness: 0.92, conscientiousness: 0.65, extraversion: 0.6, agreeableness: 0.82, neuroticism: 0.32, wantsKids: 0.6, religiousImportance: 0.3, ambition: 0.7, familyOrientation: 0.65, adventurousness: 0.85, conflictRepair: 0.8, intent: 0.88 },
    birth: { date: '1994-09-12', time: '11:30', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata', place: 'Hyderabad, India' },
    verified: { phone: true, photo: true },
    interests: ['Reading', 'Arts & Music', 'Travel', 'Nature & outdoors', 'Spirituality'],
    intentions: { household: 'shared', careers: 'both_continue', kids: 'open', kidsCare: 'shared', finances: 'split_shared', acknowledgedSelfManage: true },
  },
];

/** Per-match conversation opener (the "soul probe"). */
export const PROBES = [
  'What’s a fear you recently released that let more light into your life?',
  'When do you feel most like yourself?',
  'What does a quiet, ordinary day with someone you love look like to you?',
  'What belief about love have you changed your mind on?',
];
