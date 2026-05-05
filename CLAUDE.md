# CLAUDE.md — Vibe App: Master Project Context

> **Read this first.** This file is the single source of truth for both collaborators' Claude instances.
> Update it whenever a major decision is made. Every new session should start by reading this file.

---

## What We're Building

**Vibe** is a **music-taste-based social discovery app** for iOS and Android.

> ⚠️ **Product pivot (2026-05-05):** Vibe is NOT a dating app. The stigma/guilt of dating apps is intentionally removed. This is a social discovery platform — like "Spotify meets Meetup meets Bumble BFF."

The core premise: users connect their Spotify/Apple Music, and the app surfaces nearby people with similar music taste. You can:
- **Discover** people around you who share your sound
- **Connect** with them (send a request, they accept — like Instagram follow)
- **Create or join Communities** around genres, artists, or local scenes
- **Chat** with connections
- Browse **Popular Communities** (explore tab)
- See a live "Now Playing" on profiles

Music is the first-class citizen. Profiles showcase taste. Connections are ranked by audio compatibility scores. There is no "swiping right on a photo" — music comes first.

**Target launch**: App Store + Google Play Store (post-v1)

---

## Team

| Person | Role | Notes |
|--------|------|-------|
| Palash | Full-stack | Primary repo owner |
| Collaborator | Full-stack | Uses separate Claude instance — reads this file for context |

Both collaborators work across frontend (React Native) and backend (AWS). Feature ownership is decided sprint-by-sprint and documented in `docs/PROGRESS.md`.

---

## Repository Structure

```
vibe/
├── CLAUDE.md                  ← YOU ARE HERE — read every session
├── docs/
│   ├── ARCHITECTURE.md        ← AWS system design, data flow, infra
│   ├── FEATURES.md            ← v1 feature specs, acceptance criteria, roadmap
│   ├── TECH_STACK.md          ← Every tech choice with rationale
│   ├── PROGRESS.md            ← Sprint tracker, what's done, what's next
│   ├── API_SPEC.md            ← REST + WebSocket API contracts (created when backend starts)
│   └── DATA_MODELS.md         ← DB schema, DynamoDB tables (created when backend starts)
├── mobile-fresh/              ← React Native (Expo SDK 54) app — ACTIVE
│   ├── app/
│   │   ├── (auth)/            ← welcome, login, phone, verify
│   │   ├── (onboarding)/      ← setup-profile, connect-music
│   │   └── (app)/             ← discover, matches, chat, profile (tab bar)
│   ├── src/
│   │   ├── components/common/ ← Button, etc.
│   │   ├── store/             ← authStore (Zustand)
│   │   ├── services/          ← mock API layer (swap for real later)
│   │   ├── hooks/
│   │   └── theme/             ← Colors, Spacing, Typography, BorderRadius
│   ├── index.ts
│   ├── app.json
│   ├── metro.config.js
│   └── babel.config.js
├── mobile/                    ← OLD — ignore, will be deleted
├── backend/                   ← AWS Lambda functions (Node.js/TypeScript)
│   ├── functions/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── matching/
│   │   ├── chat/
│   │   └── music/
│   ├── shared/
│   └── package.json
└── infra/                     ← AWS CDK (TypeScript)
    ├── lib/stacks/
    └── bin/
```

---

## Core Tech Stack (Quick Reference)

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo (SDK 54) |
| Language | TypeScript everywhere |
| State | Zustand + React Query (TanStack) |
| Navigation | Expo Router 6 (file-based) |
| Auth | AWS Cognito + OAuth2 (Spotify / Apple Music) |
| API | AWS API Gateway (REST + WebSocket) |
| Compute | AWS Lambda (Node.js 20.x) |
| Primary DB | Amazon Aurora PostgreSQL Serverless v2 |
| Chat / Events | Amazon DynamoDB |
| Real-time | API Gateway WebSocket API |
| Cache / Presence | Amazon ElastiCache (Redis) |
| Media Storage | Amazon S3 + CloudFront CDN |
| Infra-as-Code | AWS CDK (TypeScript) |
| Music Sources | Spotify API, Apple Music (MusicKit), YouTube Data API v3 |
| Mobile Deploy | EAS (Expo Application Services) — NOT Vercel |

Full rationale in `docs/TECH_STACK.md`.

---

## Music Integration Strategy

| Platform | Data Available | Auth Method |
|----------|---------------|-------------|
| Spotify | Top artists, top tracks, recently played, audio features (tempo, energy, valence, danceability), genres | OAuth 2.0 PKCE |
| Apple Music | Top artists, top albums, recently played, genre affinity | MusicKit (device-level auth) |
| YouTube Music | Search history proxy via YouTube Data API v3 (limited) | Google OAuth 2.0 |

---

## v1 Scope (Non-Negotiable)

- [ ] Music platform OAuth (Spotify, Apple Music, YouTube Music)
- [ ] User profile with username, avatar color, music showcase (top artists, genres, now playing)
- [ ] Discover screen — nearby people sorted by music compatibility score
- [ ] Connection system (send/accept requests — not swipe-based dating)
- [ ] Communities — create, join, browse popular communities
- [ ] In-app real-time chat between connections
- [ ] Live "Now Playing" on profiles

Full specs in `docs/FEATURES.md`.

---

## Auth Flow (Sprint 1 — Complete)

```
welcome → login (Apple / Google / Phone)
         ↓
         [phone path] → phone → verify (OTP)
         ↓
         setup-profile (name + username + avatar color)
         ↓
         connect-music (Spotify / Apple Music / YouTube Music)
         ↓
         /(app)/discover  [tab bar: Discover | Connections | Messages | Profile]
```

---

## Conventions

### Git
- Branch naming: `feature/short-description`, `fix/short-description`, `infra/short-description`
- Commits: conventional commits — `feat:`, `fix:`, `chore:`, `docs:`
- `main` = production-ready. `dev` = integration branch.

### Code
- TypeScript strict mode everywhere (`"strict": true`)
- No `any` types
- All API responses: `{ data: T | null, error: string | null, meta?: object }`

### Docs
- **Update `docs/PROGRESS.md` at the start and end of every work session**

---

## Critical SDK Notes (learned the hard way)

- **Expo Go only runs the latest SDK** — currently SDK 54. Don't use SDK 51 or older in mobile-fresh.
- **Expo Go SDK 54 permanently enables New Architecture (Bridgeless)** — `newArchEnabled: false` in app.json does nothing in Expo Go. Only works for custom builds.
- **react-native-reanimated is incompatible with Expo Go SDK 54** — worklets version mismatch (expects 0.4.x, Expo Go has 0.5.1). Use React Native's built-in `Animated` API instead for Expo Go development.
- **Use `bundledNativeModules.json`** for authoritative package versions compatible with a given Expo SDK.
- **expo-router version for SDK 54**: `~6.0.23` (NOT 4.x)
- **EAS** is the deployment tool (not Vercel). Vercel is web-only.

---

## Current Status

**Phase**: Sprint 1 complete — auth flow end-to-end
**Active Sprint**: Sprint 2 — Core screens (Discover, Communities, Chat, Profile)
**Last updated**: 2026-05-05
