# CLAUDE.md — Vibe App: Master Project Context

> **Read this first.** This file is the single source of truth for both collaborators' Claude instances.
> Update it whenever a major decision is made. Every new session should start by reading this file.

---

## What We're Building

**Vibe** is a music-taste-based dating app for iOS and Android.

The core premise: instead of swiping on photos first, users are matched based on **musical compatibility** — shared artists, genres, listening habits, and audio preferences. Music is the first-class citizen. Profiles showcase your taste. Matches are ranked by compatibility scores derived from real listening data.

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
├── mobile/                    ← React Native (Expo) app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   └── utils/
│   └── app.json
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
| Mobile | React Native + Expo (SDK 51+) |
| Language | TypeScript everywhere |
| State | Zustand + React Query (TanStack) |
| Navigation | Expo Router (file-based) |
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
- [ ] User profile with music showcase (top artists, genres, current track)
- [ ] Matching algorithm + swipe interface
- [ ] Match notifications
- [ ] In-app real-time chat between matches
- [ ] Live "Now Playing" on profiles

Full specs in `docs/FEATURES.md`.

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

## Current Status

**Phase**: Project initialization / architecture design
**Active Sprint**: Sprint 0 — Setup & Architecture
**Last updated**: 2026-05-02
