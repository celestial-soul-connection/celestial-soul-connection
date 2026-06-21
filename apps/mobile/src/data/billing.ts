/**
 * billing.ts — entitlements & monetization, behind the data-layer seam.
 *
 * Two layers:
 *  1) Subscription: a 7-day free trial, then ₹99/week or ₹199/week.
 *  2) Contact reveal (pay-per-accepted-contact), tier-dependent:
 *       - free account:  ₹21 per reveal
 *       - paid account:  first 5 reveals free, then ₹21
 *
 * Payment is modelled locally for now (trial clock + entitlement state). The real
 * gateway (Razorpay — India UPI/cards) slots into `purchaseSubscription` /
 * `recordContactCharge` later with zero screen changes. All persistence goes
 * through store.ts so the swap to FastAPI/Supabase stays contained.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlanId = 'weekly_99' | 'weekly_199';
export interface Plan {
  id: PlanId;
  price: number;       // ₹ per period
  period: 'week';
  label: string;
  tagline: string;
  perks: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'weekly_99', price: 99, period: 'week', label: 'Aligned',
    tagline: 'Everything you need to connect intentionally.',
    perks: ['Unlimited daily matches', 'See who resonated with you', 'Unlimited full readings', '5 free contact reveals'],
  },
  {
    id: 'weekly_199', price: 199, period: 'week', label: 'Aligned+',
    tagline: 'Priority visibility and the full trust suite.',
    perks: ['Everything in Aligned', 'Priority in others’ decks', 'Advanced compatibility filters', 'Early background-verification access'],
  },
];

export const FREE_TRIAL_DAYS = 7;
export const CONTACT_FEE = 21;            // ₹ per reveal (free tier, and paid after the freebies)
export const PAID_FREE_CONTACTS = 5;      // paid accounts: first N reveals free

export interface Subscription {
  plan: PlanId;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: number;
  renewsAt: number;
}

export interface Entitlement {
  isPremium: boolean;
  inTrial: boolean;
  trialDaysLeft: number;
  subscription: Subscription | null;
  contactsRevealed: number;
}

const TRIAL_KEY = '@csc/trial_started_at';
const SUB_KEY = '@csc/subscription';
const CONTACTS_REVEALED_KEY = '@csc/contacts_revealed';

const DAY = 24 * 60 * 60 * 1000;

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try { const v = await AsyncStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}

/** Start the free trial on first run if not already started. Idempotent. */
export async function ensureTrialStarted(): Promise<void> {
  const t = await AsyncStorage.getItem(TRIAL_KEY);
  if (!t) await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify(Date.now()));
}

export async function getEntitlement(): Promise<Entitlement> {
  const startedAt = await getJSON<number | null>(TRIAL_KEY, null);
  const sub = await getJSON<Subscription | null>(SUB_KEY, null);
  const contactsRevealed = await getJSON<number>(CONTACTS_REVEALED_KEY, 0);

  const now = Date.now();
  const subActive = !!sub && sub.status === 'active' && sub.renewsAt > now;
  const trialEndsAt = startedAt ? startedAt + FREE_TRIAL_DAYS * DAY : 0;
  const inTrial = !subActive && !!startedAt && now < trialEndsAt;
  const trialDaysLeft = inTrial ? Math.max(0, Math.ceil((trialEndsAt - now) / DAY)) : 0;

  return {
    isPremium: subActive || inTrial,
    inTrial,
    trialDaysLeft,
    subscription: subActive ? sub : null,
    contactsRevealed,
  };
}

/**
 * Purchase (or model) a subscription. Real Razorpay order/verify slots in here;
 * today it records an active weekly sub locally.
 */
export async function purchaseSubscription(plan: PlanId): Promise<void> {
  const now = Date.now();
  const sub: Subscription = { plan, status: 'active', startedAt: now, renewsAt: now + 7 * DAY };
  await AsyncStorage.setItem(SUB_KEY, JSON.stringify(sub));
}

export async function cancelSubscription(): Promise<void> {
  const sub = await getJSON<Subscription | null>(SUB_KEY, null);
  if (sub) await AsyncStorage.setItem(SUB_KEY, JSON.stringify({ ...sub, status: 'cancelled' }));
}

/** The fee (₹) to reveal the next contact, given current entitlement. 0 = free. */
export function contactFeeFor(e: Entitlement): number {
  const paid = !!e.subscription; // a real subscriber (not just trial) gets the freebies
  if (paid && e.contactsRevealed < PAID_FREE_CONTACTS) return 0;
  return CONTACT_FEE;
}

/** Record a contact reveal charge (increments the counter). Gateway call later. */
export async function recordContactCharge(): Promise<void> {
  const n = await getJSON<number>(CONTACTS_REVEALED_KEY, 0);
  await AsyncStorage.setItem(CONTACTS_REVEALED_KEY, JSON.stringify(n + 1));
}

/** Keys this module owns — so store's export/delete can include them. */
export const BILLING_KEYS = [TRIAL_KEY, SUB_KEY, CONTACTS_REVEALED_KEY];
