# Fonts

Place these `.ttf` files here (names must match `src/theme/fonts.ts`):

- `PlayfairDisplay-Regular.ttf`, `PlayfairDisplay-Italic.ttf` — https://fonts.google.com/specimen/Playfair+Display
- `Manrope-Regular.ttf`, `Manrope-Medium.ttf`, `Manrope-Bold.ttf` — https://fonts.google.com/specimen/Manrope

They are not committed to git (binary). Run `npx expo install expo-font` already covered by package.json.
Until the files are present, `useFonts` will keep the splash up; add them before first run.
