# PROGRESS.md — Vibe App Sprint Tracker

> Updated at the end of every work session.
> Both Claude instances read this to understand current state.

---

## Current Status

| Field | Value |
|-------|-------|
| Phase | Sprint 0 — Setup & Architecture |
| Last updated | 2026-05-04 |
| Mobile app boots | ✅ Yes (Expo Go) |
| Backend deployed | ❌ Not yet — stubs + mock data only |
| GitHub repo | ✅ Initialized — needs initial commit (see Session 2 notes) |

---

## Sprint 0 — Setup & Architecture

### Tasks

| # | Task | Status | Owner |
|---|------|--------|-------|
| 0.1 | Define tech stack | ✅ Done | Both |
| 0.2 | Write ARCHITECTURE.md | ✅ Done | Claude |
| 0.3 | Write FEATURES.md (v1 spec) | ✅ Done | Claude |
| 0.4 | Write TECH_STACK.md | ✅ Done | Claude |
| 0.5 | Scaffold mobile/ (Expo Router) | ✅ Done | Claude |
| 0.6 | Write shared theme + Button component | ✅ Done | Claude |
| 0.7 | Write auth screens (welcome, login, phone, verify) | ✅ Done | Claude |
| 0.8 | Write onboarding screen (connect-music) | ✅ Done | Claude |
| 0.9 | Write placeholder app screens (discover, matches, chat, profile) | ✅ Done | Claude |
| 0.10 | Fix Metro bundler crash (metro.config.js + mmkv removal) | ✅ Done | Claude |
| 0.11 | Fix babel.config.js (remove redundant module-resolver) | ✅ Done | Claude |
| 0.12 | Write CDK infra — AuthStack, NotificationsStack | ✅ Done | Claude |
| 0.13 | Write CDK infra — DatabaseStack, StorageStack, LambdaStack, ApiStack | ✅ Done | Claude |
| 0.14 | Write backend shared types + first Lambda pattern | ✅ Done | Claude |
| 0.15 | Write all Lambda stub handlers | ✅ Done | Claude |
| 0.16 | Write mobile services layer (mock data) | ✅ Done | Claude |
| 0.17 | Initialize git repo + write .gitignore | ✅ Done | Claude |
| 0.18 | Initial commit + push to GitHub | ⏳ Pending — user runs commands |

### Pending user action — GitHub push
Run these in your terminal inside the `musicdateapp ` folder:
```bash
cd ~/Desktop/musicdateapp\ 
git add .
git commit -m "feat: Sprint 0 — project scaffold, architecture docs, mobile app foundation"
# Create repo on github.com/new first (name: vibe-app, private, no README)
git remote add origin https://github.com/YOUR_USERNAME/vibe-app.git
git push -u origin main
```

---

## Sprint 1 — Auth UI Polish (Up Next)

| # | Task | Status |
|---|------|--------|
| 1.1 | Implement real phone OTP flow (Cognito SMS) | ⬜ Pending |
| 1.2 | Implement Spotify OAuth (expo-auth-session PKCE) | ⬜ Pending |
| 1.3 | Implement Apple Music OAuth (MusicKit) | ⬜ Pending |
| 1.4 | Implement Apple Sign In (expo-apple-authentication) | ⬜ Pending |
| 1.5 | Implement Google Sign In (expo-auth-session) | ⬜ Pending |
| 1.6 | Persist auth tokens securely (expo-secure-store) | ⬜ Pending |
| 1.7 | Wire auth screens to Cognito (replace mocks) | ⬜ Pending |

---

## Sprint 2 — Discover / Swipe UI

| # | Task | Status |
|---|------|--------|
| 2.1 | Build swipe card component with gesture (react-native-gesture-handler) | ⬜ Pending |
| 2.2 | Animate swipe (react-native-reanimated) — like/pass indicators | ⬜ Pending |
| 2.3 | Build compatibility score display on card | ⬜ Pending |
| 2.4 | Build profile detail sheet (bottom sheet on tap) | ⬜ Pending |
| 2.5 | Build match notification modal ("You matched!") | ⬜ Pending |
| 2.6 | Wire discover screen to matchingService.getFeed() mock | ⬜ Pending |
| 2.7 | Build matches list screen (wire to matchingService.getMatches()) | ⬜ Pending |

---

## Sprint 3 — Backend Deployment

| # | Task | Status |
|---|------|--------|
| 3.1 | Set up AWS account + IAM roles | ⬜ Pending |
| 3.2 | `npm install` in infra/ | ⬜ Pending |
| 3.3 | `cdk bootstrap` | ⬜ Pending |
| 3.4 | Deploy stacks in order (Auth → DB → Storage → Lambda → Api) | ⬜ Pending |
| 3.5 | Run DB migrations (Aurora schema) | ⬜ Pending |
| 3.6 | Implement auth Lambda handlers (register, login) | ⬜ Pending |
| 3.7 | Implement user Lambda handlers (getProfile, updateProfile) | ⬜ Pending |
| 3.8 | Implement music sync Lambda (Spotify API integration) | ⬜ Pending |
| 3.9 | Implement matching feed Lambda (compatibility scoring) | ⬜ Pending |
| 3.10 | Swap mobile services from mock → real API calls | ⬜ Pending |

---

## Sprint 4 — Chat + Now Playing

| # | Task | Status |
|---|------|--------|
| 4.1 | Build chat screen (message bubbles, keyboard avoidance) | ⬜ Pending |
| 4.2 | Implement WebSocket connection in chatService | ⬜ Pending |
| 4.3 | Implement WS Lambda handlers (connect/disconnect/send) | ⬜ Pending |
| 4.4 | Build "Now Playing" widget on profile cards | ⬜ Pending |
| 4.5 | Poll now-playing endpoint every 30s | ⬜ Pending |

---

## Sprint 5 — EAS + Store Submission

| # | Task | Status |
|---|------|--------|
| 5.1 | Set up EAS project (`eas init`) | ⬜ Pending |
| 5.2 | Configure eas.json (dev/preview/prod profiles) | ⬜ Pending |
| 5.3 | `eas build --platform all --profile preview` | ⬜ Pending |
| 5.4 | Beta test via TestFlight + Google Play Internal | ⬜ Pending |
| 5.5 | `eas submit` to App Store + Play Store | ⬜ Pending |

---

## Session Log

### Session 1 — 2026-05-02
- Defined full product concept, team, tech stack
- Wrote ARCHITECTURE.md, FEATURES.md, TECH_STACK.md, CLAUDE.md
- Scaffolded mobile/ with Expo Router, all auth + onboarding screens
- Wrote CDK AuthStack + NotificationsStack
- Wrote backend shared types + first Lambda (register.ts)

### Session 2 — 2026-05-04
- Fixed Metro bundler crashes: created metro.config.js, removed react-native-mmkv, fixed babel.config.js
- Initialized git repo, wrote .gitignore
- Clarified deployment: **EAS not Vercel** for mobile
- Wrote remaining CDK stacks: DatabaseStack (Aurora v2 + DynamoDB + VPC), StorageStack (S3 + CloudFront), LambdaStack (14 functions), ApiStack (REST + WebSocket)
- Wrote all Lambda stub handlers (14 files)
- Wrote mobile services layer: apiClient, userService, matchingService, chatService, musicService (all mock-backed, ready to swap to real API)
- Updated authStore to include accessToken

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-02 | React Native + Expo SDK 51 | Cross-platform, fast iteration, EAS deployment |
| 2026-05-02 | AWS fully serverless | No idle server cost, scales to zero |
| 2026-05-02 | Aurora PostgreSQL Serverless v2 | Relational for user/match data, scales with usage |
| 2026-05-02 | DynamoDB for chat | High-throughput key-value, cheap at scale |
| 2026-05-02 | Zustand for global state | Minimal boilerplate vs Redux |
| 2026-05-02 | Expo Router (file-based) | Consistent with Next.js mental model, deep linking built in |
| 2026-05-04 | EAS Build + Submit (not Vercel) | Vercel is web-only; EAS is the official Expo mobile deployment tool |
| 2026-05-04 | Mock data in services layer | Unblock UI development while backend is being deployed |
| 2026-05-04 | Services seam pattern | All API calls go through src/services/; swapping mock→real doesn't touch screens |
| 2026-05-04 | metro.config.js for @ alias | Babel module-resolver conflicts with Expo SDK 51; metro alias is the right approach |

---

## Blockers Log

| Date | Blocker | Resolution |
|------|---------|------------|
| 2026-05-04 | Metro crash — missing metro.config.js | Created metro.config.js with getDefaultConfig + resolver.alias |
| 2026-05-04 | Metro crash — react-native-mmkv (JSI) | Removed from package.json; use expo-secure-store for key-value in Expo Go |
