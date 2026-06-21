/**
 * Paywall — free week → ₹99/week (Aligned) or ₹199/week (Aligned+).
 *
 * Honest, premium, container-light: a poetic hero, trial status, two selectable
 * plan tiers (the legitimate card use — selectable pricing), perks as a clean
 * checked list. Purchase is modelled locally via billing.purchaseSubscription;
 * the real Razorpay flow slots in there later with no screen change.
 */
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CinematicBackground } from '../src/components/fx/CinematicBackground';
import { Reveal } from '../src/components/fx/Reveal';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { useTheme } from '../src/theme/ThemeProvider';
import { haptic } from '../src/lib/haptics';
import {
  PLANS, PlanId, Plan, getEntitlement, purchaseSubscription, Entitlement,
} from '../src/data/billing';

export default function Paywall() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<PlanId>('weekly_99');
  const [ent, setEnt] = useState<Entitlement | null>(null);

  useEffect(() => { (async () => setEnt(await getEntitlement()))(); }, []);

  const subscribe = async () => {
    haptic.success();
    await purchaseSubscription(selected);
    router.back();
  };

  const trialLine = ent?.subscription
    ? 'You’re subscribed — thank you for supporting intentional connection.'
    : ent?.inTrial
      ? `You’re on your free week — ${ent.trialDaysLeft} day${ent.trialDaysLeft === 1 ? '' : 's'} left.`
      : 'Your free week has ended. Continue with a plan below.';

  return (
    <CinematicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + t.spacing['2xl'], paddingHorizontal: t.spacing.xl }}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ alignSelf: 'flex-end' }}>
          <Text variant="title" color="textMuted">✕</Text>
        </Pressable>

        <Reveal index={0}>
          <Text variant="overline" color="accent" uppercase>Membership</Text>
          <Text variant="displayXl" style={{ marginTop: t.spacing.sm }}>Go deeper,</Text>
          <Text variant="displayXl" style={{ fontFamily: t.fontFamily.displayItalic, marginTop: -6 }}>intentionally.</Text>
          <Text variant="bodyLg" color="textMuted" style={{ marginTop: t.spacing.lg }}>
            {trialLine}
          </Text>
        </Reveal>

        {/* Plan tiers — selectable cards (legit: selectable pricing) */}
        <View style={{ marginTop: t.spacing['2xl'], gap: t.spacing.md }}>
          {PLANS.map((p, i) => (
            <Reveal key={p.id} index={1 + i}>
              <PlanCard t={t} plan={p} selected={selected === p.id} onPress={() => { haptic.light(); setSelected(p.id); }} />
            </Reveal>
          ))}
        </View>

        <Reveal index={4}>
          <View style={{ marginTop: t.spacing['2xl'], gap: t.spacing.md }}>
            <Button label={`Start ${PLANS.find((p) => p.id === selected)?.label} · ₹${PLANS.find((p) => p.id === selected)?.price}/week`} onPress={subscribe} />
            <Pressable onPress={() => router.back()} style={{ alignItems: 'center', paddingVertical: t.spacing.sm }}>
              <Text variant="label" color="textMuted">Maybe later</Text>
            </Pressable>
          </View>
          <Text variant="caption" color="textFaint" center style={{ marginTop: t.spacing.md }}>
            Billed weekly. Cancel anytime in Settings. Prices in INR.
          </Text>
        </Reveal>
      </ScrollView>
    </CinematicBackground>
  );
}

function PlanCard({ t, plan, selected, onPress }: { t: ReturnType<typeof useTheme>; plan: Plan; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}
      style={{
        borderRadius: t.radii.xl, padding: t.spacing.xl,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? t.colors.primary : t.colors.border,
        backgroundColor: selected ? t.colors.primarySoft : t.colors.bgElevated,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: t.spacing.md }}>
          <Text variant="headline">{plan.label}</Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{plan.tagline}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="displayLg" color={selected ? 'primary' : 'text'}>₹{plan.price}</Text>
          <Text variant="caption" color="textFaint">per week</Text>
        </View>
      </View>
      <View style={{ marginTop: t.spacing.lg, gap: t.spacing.sm }}>
        {plan.perks.map((perk) => (
          <View key={perk} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
            <Text variant="label" color={selected ? 'primary' : 'accent'}>✓</Text>
            <Text variant="body" color="textMuted" style={{ flex: 1 }}>{perk}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}
