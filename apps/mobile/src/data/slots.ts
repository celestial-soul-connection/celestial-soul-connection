/**
 * slots.ts — "Connection Slots": enforced scarcity so users stop endless-scrolling
 * and make genuine, intentional choices. Implements the PRD/Technical-design model
 * on-device for now, behind the data-layer seam; the invariants are pure logic that
 * lifts to the FastAPI/Postgres server unchanged (see docs/TECHNICAL_DESIGN.md §3).
 *
 * INVARIANTS enforced here (mirror the technical design):
 *  I1 Capacity: a user never holds more (candidate_pending + active) slots than
 *     their gender's configured count.
 *  I2 Mutual opt-in only: a connection opens only when BOTH sides opt in.
 *  I3 Decline is forward-only & free: declining frees the slot, records the pair as
 *     past (never re-suggested), and applies NO penalty/tag.
 *  I4 Delivery cap is on deliveries (max 2 / rolling 7 days), NEVER on declines
 *     (declines are unlimited).
 *  I5 No re-pairing: a past pair is never surfaced again.
 *  I6 Gender is used ONLY for slot count (+ future ratio balancing), never as a
 *     behavioural/seriousness input.
 *
 * NOTE (sim seam): seed candidates can't really opt in, so the counterpart's
 * opt-in is simulated as "accepts" the moment the user opts in. On the real
 * backend, a connection waits for the other human's opt-in (I2). Marked clearly.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gender } from './types';

export type SlotState = 'open' | 'candidate_pending' | 'active';

export interface Slot {
  index: number;
  state: SlotState;
  candidateId?: string;   // profile id surfaced into this slot (pending)
  connectionId?: string;  // active connection (= the matched profile id here)
}

export interface SlotsView {
  slots: Slot[];
  capacity: number;
  openCount: number;
  deliveriesThisWeek: number;
  deliveryCap: number;
  canReceiveDelivery: boolean;   // open slot AND under weekly cap
}

/** Slot capacity by gender — configurable per the PRD open decision (A/B later). */
export const SLOT_COUNTS: Record<Gender, number> = { man: 1, woman: 2, nonbinary: 2 };
export const MAX_DELIVERIES_PER_WEEK = 2;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const SLOTS_KEY = '@csc/slots';
const PAST_PAIRS_KEY = '@csc/past_pairings';        // I5: never re-suggest
const DELIVERY_LEDGER_KEY = '@csc/match_deliveries'; // I4: timestamps of deliveries

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try { const v = await AsyncStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}

export function capacityFor(gender?: Gender): number {
  return gender ? SLOT_COUNTS[gender] : 2; // default to the more generous count if unknown
}

/** Initialize slot rows for the user's capacity (idempotent; preserves existing). */
export async function ensureSlots(gender?: Gender): Promise<Slot[]> {
  const capacity = capacityFor(gender);
  const existing = await getJSON<Slot[]>(SLOTS_KEY, []);
  if (existing.length === capacity) return existing;
  // Resize while preserving any occupied slots first.
  const occupied = existing.filter((s) => s.state !== 'open').slice(0, capacity);
  const slots: Slot[] = [];
  for (let i = 0; i < capacity; i++) {
    slots.push(occupied[i] ? { ...occupied[i], index: i } : { index: i, state: 'open' });
  }
  await AsyncStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  return slots;
}

async function saveSlots(slots: Slot[]): Promise<void> {
  await AsyncStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

async function deliveriesThisWeek(): Promise<number> {
  const ledger = await getJSON<number[]>(DELIVERY_LEDGER_KEY, []);
  const cutoff = Date.now() - WEEK_MS;
  return ledger.filter((ts) => ts >= cutoff).length;
}

export async function getSlotsView(gender?: Gender): Promise<SlotsView> {
  const slots = await ensureSlots(gender);
  const capacity = slots.length;
  const openCount = slots.filter((s) => s.state === 'open').length;
  const delivered = await deliveriesThisWeek();
  return {
    slots,
    capacity,
    openCount,
    deliveriesThisWeek: delivered,
    deliveryCap: MAX_DELIVERIES_PER_WEEK,
    canReceiveDelivery: openCount > 0 && delivered < MAX_DELIVERIES_PER_WEEK,
  };
}

/** Has this pair already been paired (and thus must never be re-suggested)? I5 */
export async function isPastPair(profileId: string): Promise<boolean> {
  const past = await getJSON<string[]>(PAST_PAIRS_KEY, []);
  return past.includes(profileId);
}
async function addPastPair(profileId: string): Promise<void> {
  const past = await getJSON<string[]>(PAST_PAIRS_KEY, []);
  if (!past.includes(profileId)) await AsyncStorage.setItem(PAST_PAIRS_KEY, JSON.stringify([...past, profileId]));
}

/**
 * Deliver a candidate into an open slot. Enforces I1 (capacity) + I4 (weekly cap)
 * + I5 (no re-pair). Returns false if not allowed. Writes a delivery-ledger entry.
 */
export async function deliverCandidate(profileId: string, gender?: Gender): Promise<boolean> {
  const slots = await ensureSlots(gender);
  if (await isPastPair(profileId)) return false;                       // I5
  if (slots.some((s) => s.candidateId === profileId || s.connectionId === profileId)) return false;
  if ((await deliveriesThisWeek()) >= MAX_DELIVERIES_PER_WEEK) return false; // I4
  const open = slots.find((s) => s.state === 'open');
  if (!open) return false;                                              // I1
  open.state = 'candidate_pending';
  open.candidateId = profileId;
  await saveSlots(slots);
  const ledger = await getJSON<number[]>(DELIVERY_LEDGER_KEY, []);
  await AsyncStorage.setItem(DELIVERY_LEDGER_KEY, JSON.stringify([...ledger, Date.now()]));
  return true;
}

/**
 * Opt in to a pending candidate. I2: a connection opens only on MUTUAL opt-in.
 * SIM SEAM: the seed counterpart auto-opts-in, so this transitions straight to
 * 'active'. On the real backend, stay 'candidate_pending' until the other human
 * opts in. Returns true if a connection opened.
 */
export async function optInCandidate(profileId: string, gender?: Gender): Promise<boolean> {
  const slots = await ensureSlots(gender);
  const slot = slots.find((s) => s.state === 'candidate_pending' && s.candidateId === profileId);
  if (!slot) return false;
  slot.state = 'active';
  slot.connectionId = profileId;
  slot.candidateId = undefined;
  await saveSlots(slots);
  return true;
}

/**
 * Decline — works on a pending candidate OR an active connection. I3: frees the
 * slot, records the pair as past (I5), applies NO penalty. I4: declining is
 * unlimited and never touches the delivery ledger.
 */
export async function declineSlot(profileId: string, gender?: Gender): Promise<void> {
  const slots = await ensureSlots(gender);
  const slot = slots.find((s) => s.candidateId === profileId || s.connectionId === profileId);
  if (slot) {
    slot.state = 'open';
    slot.candidateId = undefined;
    slot.connectionId = undefined;
    await saveSlots(slots);
  }
  await addPastPair(profileId);   // I5 — never re-suggest, whether candidate or connection
}

/** Profile ids currently in an active connection (for the Matches list). */
export async function getActiveConnectionIds(): Promise<string[]> {
  const slots = await getJSON<Slot[]>(SLOTS_KEY, []);
  return slots.filter((s) => s.state === 'active' && s.connectionId).map((s) => s.connectionId!) as string[];
}

/** Keys this module owns — for export/delete coverage. */
export const SLOT_KEYS = [SLOTS_KEY, PAST_PAIRS_KEY, DELIVERY_LEDGER_KEY];
