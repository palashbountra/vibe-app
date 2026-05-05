# Vibe — Development Progress Tracker

> Update this file at the **start and end of every work session**.
> This is the living sprint tracker — what's done, what's in flight, what's next.

---

## Product Concept (updated 2026-05-05)

**Vibe** is a **music social discovery app** — NOT a dating app.

- Users connect Spotify/Apple Music
- Discover nearby people with similar music taste
- Connect (send/accept requests), not swipe-based dating
- Create & join Communities (genre, artist, local scene)
- Chat with connections
- "Now Playing" live on profiles
- Browse Popular Communities tab

---

## Sprint History

### ✅ Sprint 0 — Setup & Architecture (complete)
- [x] CLAUDE.md, ARCHITECTURE.md, FEATURES.md, TECH_STACK.md
- [x] Full project folder structure scaffolded
- [x] All 4 CDK infra stacks written (Auth, Database, Storage, Lambda, Api)
- [x] Mobile services layer with mock data (apiClient, userService, matchingService, chatService, musicService)
- [x] GitHub repo created and pushed
- [x] Expo SDK upgrade from 51 → 54 (forced by Expo Go compatibility)
- [x] Fresh project (`mobile-fresh/`) created to resolve irrecoverable stale node_modules
- [x] App boots successfully on Expo Go (SDK 54, New Architecture)

**Key SDK lessons learned:**
- Expo Go SDK 54 = New Architecture forced on (bridgeless). Can't disable in Expo Go.
- `react-native-reanimated` incompatible with Expo Go SDK 54 (worklets version mismatch). Use RN built-in `Animated`.
- `expo-router` for SDK 54 = `~6.0.23` (not 4.x).
- Source of truth for package versions: `bundledNativeModules.json` in expo package.

---

### ✅ Sprint 1 — Auth Flow (complete, 2026-05-05)

**Goal:** Full end-to-end navigable auth flow on device.

#### Completed
- [x] `app/(auth)/welcome.tsx` — animated music bars, "vibe / connect through music" CTA
- [x] `app/(auth)/login.tsx` — Apple Sign In (iOS), Google (mock), Phone option
- [x] `app/(auth)/phone.tsx` — phone number input with country code
- [x] `app/(auth)/verify.tsx` — 6-digit OTP, auto-advance, auto-submit on complete
- [x] `app/(onboarding)/setup-profile.tsx` — display name + username + avatar color picker (NEW)
- [x] `app/(onboarding)/connect-music.tsx` — Spotify / Apple Music / YouTube Music connect (mock)
- [x] `app/(app)/` — tab bar with Discover, Connections, Messages, Profile (stub screens)
- [x] `src/store/authStore.ts` — Zustand, User interface extended with `username` + `avatarColor`
- [x] `src/components/common/Button.tsx` — reusable primary/secondary/ghost button
- [x] `app/index.tsx` — smart redirect: welcome → setup-profile → discover
- [x] Fixed `user?.name` → `user?.displayName` bug in profile.tsx
- [x] Updated all language from "dating" → "social discovery"
- [x] Updated CLAUDE.md + PROGRESS.md for product pivot

#### Auth flow route map
```
welcome → login → [Apple/Google] → setup-profile → connect-music → /(app)/discover
                → phone → verify → setup-profile → connect-music → /(app)/discover
```

---

### 🔜 Sprint 2 — Core Screens (next)

**Goal:** Real, functional UI for all main app screens.

#### Planned
- [ ] `discover.tsx` — card stack of nearby users sorted by music compatibility
  - User cards with avatar, name, username, top genres, compatibility %
  - Tap to expand profile, "Connect" button
  - Pull to refresh
- [ ] `matches.tsx` → rename to `connections.tsx` — accepted connections list
  - Pending incoming requests section
  - Accepted connections with last active / now playing
- [ ] `chat.tsx` — conversation list
  - Per-connection thread (tap → full chat screen)
  - Real-time via WebSocket (mock for now)
- [ ] `profile.tsx` — full profile view
  - Edit profile (name, username, bio)
  - Connected music platforms with top artists
  - "Now Playing" widget
- [ ] Communities tab (replace or add to tab bar)
  - Browse popular communities
  - Join/create community
- [ ] `app/(app)/_layout.tsx` — update tab bar labels to match new concept

---

### 🔜 Sprint 3 — Backend Deployment

- [ ] AWS account setup
- [ ] CDK bootstrap + deploy all stacks
- [ ] Lambda function stubs → real implementations
- [ ] Cognito user pool wired to mobile
- [ ] Aurora + DynamoDB seeded
- [ ] API Gateway routes live

---

### 🔜 Sprint 4 — Music OAuth

- [ ] Spotify OAuth 2.0 PKCE flow (expo-auth-session)
- [ ] Apple MusicKit integration
- [ ] YouTube Music via Google OAuth
- [ ] Ingest listening data → compatibility scoring

---

### 🔜 Sprint 5 — EAS Build + Store Submission

- [ ] EAS project setup (`eas.json`)
- [ ] iOS provisioning + TestFlight
- [ ] Android keystore + Play Console internal testing
- [ ] App Store listing draft

---

## Known Issues / Tech Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| `mobile/` old directory still in repo | Low | Delete once mobile-fresh is confirmed stable |
| All services return mock data | Medium | Sprint 3 will swap |
| Phone OTP not connected to real SMS | High | Cognito SMS flow in Sprint 3 |
| Google Sign In not implemented | Medium | expo-auth-session in Sprint 4 |
| Music platform connections are mock toggles | High | Real OAuth in Sprint 4 |
| Communities feature not started | Medium | Sprint 2 |

---

## Session Log

| Date | Session | Outcome |
|------|---------|---------|
| 2026-05-02 | Session 1 | Docs, architecture, CDK stacks, services layer |
| 2026-05-02 | Session 2 | GitHub setup, SDK upgrade, fresh project, app booting |
| 2026-05-05 | Session 3 | Product pivot to social discovery, Sprint 1 auth flow complete |
