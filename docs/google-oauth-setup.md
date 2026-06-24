# Google Sign-In — setup

Google login is wired end-to-end: the mobile app runs the OAuth flow and the
FastAPI backend (`POST /auth/google`) **verifies the token server-side** before
issuing our JWT. You only need to plug in credentials.

## 1. Create OAuth client IDs (Google Cloud Console)

1. Console → **APIs & Services → OAuth consent screen** → configure (External),
   add scopes `openid`, `email`, `profile`. Add yourself as a test user.
2. **APIs & Services → Credentials → Create credentials → OAuth client ID.**
   Create up to three, depending on where you run:
   - **Web application** — required (used in Expo Go / web, and as the token
     audience the backend verifies). Add authorized redirect URIs you see logged
     by the app (see step 3).
   - **iOS** — bundle ID `com.csc.app` (for a native/dev build).
   - **Android** — package `com.csc.app` + your signing SHA-1 (for a native build).

## 2. Paste the IDs

**Mobile** — `apps/mobile/src/config.ts` → `GOOGLE_OAUTH`:
```ts
export const GOOGLE_OAUTH = {
  webClientId: '…apps.googleusercontent.com',
  iosClientId: '…apps.googleusercontent.com',
  androidClientId: '…apps.googleusercontent.com',
};
```
These are **public** identifiers — safe to ship. (The OAuth *secret* lives only
on Google's side / your server; never put it in the app.)

**Backend** — `apps/api/.env` (copy from `.env.example`):
```
GOOGLE_WEB_CLIENT_ID=…apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=…apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=…apps.googleusercontent.com
```
The backend accepts a token whose `aud` matches **any** configured client ID.

## 3. Redirect URIs (the fiddly part)

`expo-auth-session` builds the redirect URI for you; log it once and register it:
```ts
// temporarily, in the auth screen:
import { makeRedirectUri } from 'expo-auth-session';
console.log('redirect →', makeRedirectUri({ scheme: 'csc' }));
```
- **Dev build / standalone:** add the printed URI (and, for iOS, the *reversed*
  client ID `com.googleusercontent.apps.…` as a URL scheme) to the Web client's
  authorized redirect URIs.
- **Expo Go:** Google's live consent screen needs a registered redirect that
  Expo Go can't always provide (the hosted proxy is deprecated). The flow is
  fully implemented, but to exercise the **real** Google popup reliably, use a
  **development build**:
  ```bash
  cd apps/mobile && npx expo run:ios     # or: eas build --profile development
  ```

## 4. Run the backend

```bash
cd apps/api && python -m venv .venv && source .venv/bin/activate \
  && pip install -r requirements.txt && uvicorn app.main:app --reload
```
Point the app at it via `apps/mobile/src/config.ts` → `API_BASE_URL` (use your
Mac's LAN IP for a physical phone, not `localhost`).

> Dev DB: the `User` table gained `google_sub` and made `password_hash`/`dob`
> nullable. Tables are created with `create_all`; if you have an old
> `apps/api/csc_dev.db`, delete it so the new columns are created.

## 5. How it behaves

- App → Google → returns an `id_token`/`access_token` → `POST /auth/google`.
- Backend verifies the token (issuer + audience + email-verified), then:
  - **existing user** → logs in (links `google_sub` to a prior password account
    with the same email);
  - **new user** → needs a **date of birth** for the 18+ gate. Google doesn't
    provide DOB, so a new account replies `422 dob_required`; the user completes
    it in onboarding (birth portal), where 18+ is enforced before matching.
- `account_core` consent is written to the append-only ledger on account
  creation, exactly like password signup.

## Dev convenience

Until real client IDs are pasted in, the Google button shows a friendly hint.
If the backend is unreachable in dev, Google sign-in falls back to a local
session so onboarding still flows (same pattern as email/password) — **this is a
dev affordance only; production requires the backend to verify the token.**
