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

### ✅ Sprint 2 — Core Screens (complete, 2026-05-05)

**Goal:** Real, functional UI for all main app screens.

#### Completed
- [x] `discover.tsx` — scrollable FlatList feed, filter chips (All/Nearby/High Match/Online), pull-to-refresh, loading + empty states
- [x] `UserCard.tsx` — avatar/photo, name+age, @username, location, compat % badge, now playing strip, genre chips (color-coded), top artists, Connect button; **tappable → navigates to expanded profile**
- [x] `app/(app)/user/[id].tsx` — full expanded profile: photo carousel with page dots, identity/meta section (pronouns, location, job, school, height), now playing card, prompt cards with **heart/compliment buttons**, sound profile (genres + ranked artists + compat breakdown bars), floating connect action bar, **compliment bottom sheet modal** (send message + connection request together)
- [x] `communities.tsx` — search bar, "Your Communities" + "Popular" sections, join/leave toggle, 8 mock communities
- [x] `chat.tsx` (Messages tab) — conversation list with colored avatar, online dot, last message preview, timestamp, unread badge, now playing italic text
- [x] `profile.tsx` — scrollable profile: avatar, display name, @username, bio, edit button, now playing card, genre chips, top artists, connected platforms, sign out
- [x] `app/(app)/_layout.tsx` — tab bar updated to Discover/Communities/Messages/Profile; old Matches tab hidden

#### Pre-Sprint 3 additions (Hinge-style profile + expanded view)
- [x] `setup-profile.tsx` — added mandatory **age field** (18+ validation), routes to setup-profile-details
- [x] `setup-profile-details.tsx` — Hinge-style onboarding: 6-photo grid (expo-image-picker), gender picker modal (mandatory), pronouns chips, 200-char bio, 3 switchable music prompt cards (12 prompt options), height/job/school/location inputs, live **profile completion % bar** (color-coded), Continue gated on gender + 1 photo
- [x] `app/index.tsx` — gender check added to redirect chain
- [x] `app.json` — expo-image-picker plugin + photo/camera permissions
- [x] `authStore.ts` — extended User interface: age, gender, pronouns, bio, height, job, school, location, photos[], prompts[], profileComplete%; added `calcProfileCompletion()` scoring function
- [x] `matchingService.ts` — 6 rich mock users (Aanya, Rohan, Priya, Arjun, Meera, Kabir) with full profiles; `sendConnectionRequest` accepts optional compliment param
- [x] `userService.ts` — renamed photoUrls→photos; extended UserProfile interface
- [x] TypeScript: **zero errors** (`tsc --noEmit` clean)
- [x] expo-router types patched for setup-profile-details + user/[id] dynamic route

---

### 🔜 Sprint 3 — Backend (Supabase)

- [ ] Supabase project setup (free tier)
- [ ] DB schema: users, connections, communities, messages tables
- [ ] Supabase Auth (phone OTP / social providers)
- [ ] Replace mock services with real Supabase calls
- [ ] Spotify OAuth PKCE flow (expo-auth-session)
- [ ] Photo upload → Supabase Storage → CDN URL
- [ ] Real-time chat via Supabase Realtime (WebSocket)

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
| Photo picker stores local URIs only | Medium | Sprint 3: upload to Supabase Storage |

---

## Session Log

| Date | Session | Outcome |
|------|---------|---------|
| 2026-05-02 | Session 1 | Docs, architecture, CDK stacks, services layer |
| 2026-05-02 | Session 2 | GitHub setup, SDK upgrade, fresh project, app booting |
| 2026-05-05 | Session 3 | Product pivot to social discovery, Sprint 1 auth flow complete |
| 2026-05-05 | Session 4 | Sprint 2 complete — Discover/Communities/Chat/Profile screens, Hinge-style onboarding, expanded profile + compliment flow, tsc clean |
| 2026-05-08 | Session 5 | Bug fixes + full button wiring — 6 new modals (ConversationModal, EditProfileModal, SettingsModal, FilterModal, CreateCommunityModal, CommunityDetailModal); fixed isHydrated early-return bug; removed broken music connection routing gate; profile now shows user photo; tsc clean; git pushed + EAS update published |
