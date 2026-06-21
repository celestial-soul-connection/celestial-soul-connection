---
name: celestial-design-system
description: The single source of truth for Celestial Soul Connection's UI. Invoke this BEFORE building, styling, or restyling ANY screen, component, or feature in this app (mobile Expo/React Native). It enforces the one-theme rule — every feature reuses the same token contract and never introduces a new colour scheme, font, or one-off style. Use whenever a task touches visuals: new screens, components, animations, "make it look nice", palette changes, or design review.
---

# Celestial Soul Connection — Design System

This skill governs ALL UI work in this repo. The prime directive:

> **A new feature is never a new theme.** Every screen reads from ONE token
> contract. Adding a feature must NOT introduce a new palette, font, raw hex
> value, spacing number, or bespoke component look. If something can't be built
> from the tokens, the fix is to EXTEND THE TOKENS (a deliberate, reviewed act),
> never to hard-code a local style.

## 0. Before you touch any UI

1. Read the token sources — they are the contract:
   - `apps/mobile/src/theme/palettes.ts` — the 3 colour palettes (warmDusk = default, cosmicTwilight, sunriseTeal) all implementing `ThemeTokens`.
   - `apps/mobile/src/theme/tokens.ts` — spacing, radii, typography, motion, elevation (shared across all palettes).
   - `apps/mobile/src/theme/ThemeProvider.tsx` — `useTheme()` / `useThemeControls()`.
2. Read the existing primitives in `apps/mobile/src/components/` and REUSE them. Do not re-create a button, card, chip, text, ring, or background.

## 1. Hard rules (non-negotiable)

- **No raw colours.** Never write a hex string, `rgba(...)`, or a named colour in a screen/component. Always `const t = useTheme(); ... t.colors.primary`. The only file allowed to contain hex literals is `palettes.ts`.
- **No raw type.** Never use RN `<Text>` or ad-hoc `fontSize`. Use `components/Text.tsx` with a `variant` and a `color` token.
- **No magic spacing.** Use `t.spacing.*` / `t.radii.*` — not literal pixel margins (except 0/1 hairlines and `StyleSheet.absoluteFill`).
- **No new fonts.** Display = Playfair Display; Body = Manrope. That's it.
- **One motion physics.** All animation durations/springs/easings come from `t.motion.*`. No ad-hoc `duration: 300`.
- **Theme-agnostic.** Code must look correct in all 3 palettes incl. the dark one (cosmicTwilight). Never assume a light or dark background — derive from `t.colors.bg` and `t.mode`.

## 2. How to build a screen

Wrap it in `ScreenFrame` (gives safe area + aura backdrop + entrance reveal).
Compose from primitives:

```tsx
import { ScreenFrame } from '../components/ScreenFrame';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { useTheme } from '../theme/ThemeProvider';

export function ExampleScreen() {
  const t = useTheme();
  return (
    <ScreenFrame>
      <Text variant="displayLg">A meaningful headline</Text>
      <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
        Body copy stays on token.
      </Text>
      <Card glow style={{ marginTop: t.spacing.xl }}>
        <Chip label="Secure attachment" tone="primary" />
      </Card>
      <Button label="Continue" onPress={...} style={{ marginTop: t.spacing.xl }} />
    </ScreenFrame>
  );
}
```

## 3. Token roles — pick by MEANING, not by hue

| Role | Token | Use for |
|------|-------|---------|
| Background | `colors.bg` / `bgElevated` / `bgSunken` | page / cards / wells & inputs |
| Primary action | `colors.primary` (+`primaryHover`,`primarySoft`) | main CTAs, brand |
| Spark/highlight | `colors.accent` (+`accentSoft`) | warmth, secondary emphasis |
| Compatibility heat | `colors.heat0..heat3` | alignment scores low→high |
| Report/destructive | `colors.danger` (+`dangerSoft`) | report user, delete, errors |
| Text | `text` / `textMuted` / `textFaint` | hierarchy |
| Gradients | `gradients.brand` / `aura` / `match` | buttons, backdrop, high-match cards |

Because every palette implements the SAME roles, swapping the active theme restyles the whole app with zero component edits. That is the entire point — protect it.

## 4. Signature look (so the brand stays consistent)

- **Atmosphere over shadow:** depth comes from the slow-breathing `AuraBackground` + soft tinted shadows, never harsh black drop-shadows.
- **Serif soul, sans utility:** Playfair Display for emotional/headline moments (use it generously for "soul"/match copy); Manrope for everything functional.
- **Calm motion:** one orchestrated entrance per screen (via `ScreenFrame`), gentle spring on press, ambient aura pulse. Never frantic, never bouncy-everywhere.
- **Rounded & safe:** pill buttons, `radii.xl` cards, circular avatars/rings — soft, intimate, never sharp.
- **Generous void:** lean on whitespace (`spacing.xl`/`2xl`/`3xl`) to signal premium intent and calm.

## 5. Adding to the system (the ONLY sanctioned way to "go off token")

If a genuine need isn't covered:
1. Add the token to `tokens.ts` (shared) or to EVERY palette in `palettes.ts` (colour) — all three must define it or the contract breaks.
2. If it's a recurring UI shape, add a primitive to `components/` that reads tokens.
3. Then use it. Never short-circuit by hard-coding in a screen "just this once."

## 6. Review checklist (run before declaring UI done)

- [ ] Zero hex / rgba / named colours outside `palettes.ts`.
- [ ] Zero RN `<Text>`; all via `Text` primitive with a variant.
- [ ] Spacing/radii from tokens only.
- [ ] Renders correctly in warmDusk, sunriseTeal, AND cosmicTwilight (dark).
- [ ] Reused existing primitives; no duplicate button/card/etc.
- [ ] Motion uses `t.motion.*`.
- [ ] New screen wrapped in `ScreenFrame`.
