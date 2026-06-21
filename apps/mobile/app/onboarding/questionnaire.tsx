/**
 * Questionnaire — the soul blueprint. One item at a time, 1..5 Likert, with a
 * progress bar and animated transitions. On completion it computes a real
 * PsychProfile, saves it (so the match scoring becomes truly yours), marks the
 * session onboarded, and routes to the matches deck.
 */
import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useRouter } from 'expo-router';
import { ScreenFrame } from '../../src/components/ScreenFrame';
import { Text } from '../../src/components/Text';
import { Chip } from '../../src/components/Chip';
import { useTheme } from '../../src/theme/ThemeProvider';
import { QUESTIONS, SCALE, compute } from '../../src/data/questionnaire';
import { setMyPsych } from '../../src/data/store';
import { markOnboarded } from '../../src/data/session';
import { haptic } from '../../src/lib/haptics';

export default function Questionnaire() {
  const t = useTheme();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const q = QUESTIONS[i];
  const progress = (i) / QUESTIONS.length;

  const choose = async (value: number) => {
    haptic.light();
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (i + 1 < QUESTIONS.length) {
      setTimeout(() => setI(i + 1), 180);
    } else {
      // finish
      const profile = compute(next);
      await setMyPsych(profile);
      await markOnboarded();
      haptic.success();
      router.replace('/(tabs)/discover');
    }
  };

  return (
    <ScreenFrame scroll={false} contentStyle={{ flex: 1 }}>
      {/* Progress */}
      <View style={{ marginTop: t.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: t.spacing.sm }}>
          <Text variant="overline" color="textFaint" uppercase>Your soul blueprint</Text>
          <Text variant="overline" color="textFaint">{i + 1} / {QUESTIONS.length}</Text>
        </View>
        <View style={{ height: 6, borderRadius: 6, backgroundColor: t.colors.bgSunken, overflow: 'hidden' }}>
          <MotiView
            animate={{ width: `${Math.max(6, progress * 100)}%` }}
            transition={{ type: 'timing', duration: 300 }}
            style={{ height: 6, backgroundColor: t.colors.primary, borderRadius: 6 }}
          />
        </View>
      </View>

      {/* Question */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={q.id}
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -30 }}
            transition={{ type: 'timing', duration: 260 }}>
            <Chip label={q.dimension} tone="primary" />
            <Text variant="headline" style={{ marginTop: t.spacing.lg, fontFamily: t.fontFamily.display }}>
              {q.text}
            </Text>

            <View style={{ marginTop: t.spacing['2xl'], gap: t.spacing.sm }}>
              {SCALE.map((label, idx) => {
                const value = idx + 1;
                const selected = answers[q.id] === value;
                return (
                  <Pressable
                    key={label}
                    onPress={() => choose(value)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: t.spacing.md,
                      backgroundColor: selected ? t.colors.primarySoft : t.colors.bgElevated,
                      borderWidth: 1, borderColor: selected ? t.colors.primary : t.colors.border,
                      borderRadius: t.radii.lg, paddingVertical: t.spacing.lg, paddingHorizontal: t.spacing.lg,
                    }}>
                    <View style={{ width: 22, height: 22, borderRadius: 22, borderWidth: 2, borderColor: selected ? t.colors.primary : t.colors.borderStrong, backgroundColor: selected ? t.colors.primary : 'transparent' }} />
                    <Text variant="bodyLg" color={selected ? 'primary' : 'text'}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </MotiView>
        </AnimatePresence>
      </View>

      {i > 0 && (
        <Pressable onPress={() => setI(i - 1)} style={{ alignSelf: 'center', paddingVertical: t.spacing.md }}>
          <Text variant="label" color="textMuted">‹ Back</Text>
        </Pressable>
      )}
    </ScreenFrame>
  );
}
