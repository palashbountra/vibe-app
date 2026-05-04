# Tech Stack — Vibe App
> Last updated: 2026-05-02
> Every tech decision is documented here with rationale. Add new deps here before introducing them.

---

## Mobile — React Native + Expo SDK 51

**Why React Native**: Single codebase iOS + Android. TypeScript full-stack. Better music SDK ecosystem than Flutter. Strong community for dating-app UI patterns (gestures, card stacks).
**Why Expo**: EAS Build handles App Store/Play Store submissions without a Mac per build. OTA updates via Expo Updates skip app store review for bug fixes. Managed workflow saves huge setup time.
**Why not native Swift + Kotlin**: Two-person team can't maintain two codebases.

### Key Mobile Dependencies
| Package | Purpose |
|---------|---------|
| `expo-router` ~3.5 | File-based navigation (replaces React Navigation boilerplate) |
| `react-native-reanimated` ~3.10 | 60fps swipe animations (card stack) |
| `react-native-gesture-handler` ~2.16 | Swipe gesture recognition |
| `zustand` ^4.5 | Global state — lightweight, no boilerplate |
| `@tanstack/react-query` ^5 | Server state, caching, loading/error states |
| `axios` ^1.7 | HTTP client with token-refresh interceptors |
| `expo-secure-store` | Encrypted device storage for auth tokens |
| `@shopify/flash-list` | High-performance chat + matches lists |
| `react-native-mmkv` | Fast local key-value store (settings, cache) |
| `expo-auth-session` | OAuth 2.0 PKCE for Spotify/Google |
| `expo-apple-authentication` | Sign in with Apple |

---

## Backend — Node.js 20.x Lambda (TypeScript)

**Why Node.js**: Cold starts ~100–300ms (vs Java 2–5s). TypeScript across full stack enables type sharing. Team is proficient.
**Build**: esbuild (10x faster than webpack, small bundles → faster cold starts).
**No ORM in v1**: Prisma has Lambda cold start issues with its engine binary. Using raw SQL via Aurora Data API. Will evaluate **Drizzle ORM** in v1.1.

### Key Backend Dependencies
| Package | Purpose |
|---------|---------|
| `@aws-sdk/client-*` (v3) | AWS service clients — built into Node 20 runtime |
| `ioredis` ^5 | Redis client for ElastiCache |
| `zod` ^3 | Runtime input validation on all Lambda handlers |
| `ulid` ^2 | Sortable unique IDs for chat messages |

---

## Infrastructure — AWS CDK v2 (TypeScript)

**Why CDK over Terraform**: AWS-only project. CDK's L2/L3 constructs dramatically reduce boilerplate. No second language needed.
All infra is code. Nothing created manually in AWS console (except initial IAM bootstrap + Route 53 domain).

---

## Database Choices

### Aurora PostgreSQL Serverless v2
- Complex joins, geo queries (PostGIS), full SQL for matching algorithm
- Auto-scales to 0 ACUs when idle (critical for dev/staging cost)
- **Why not DynamoDB for everything**: Ad-hoc queries and joins needed for matching + analytics

### DynamoDB
- Chat messages: high-throughput writes, simple time-series access pattern, TTL for auto-cleanup
- WS connections: ephemeral, high-churn

### ElastiCache Redis 7.x
- Industry standard for presence, caching, rate limiting
- `ioredis` client is excellent

---

## Auth — AWS Cognito
- Fully managed, no auth server to run
- Native integration with API Gateway JWT authorizer
- Free up to 50K MAUs
- Custom attributes for music platform connection state
- We build our own UI; Cognito Hosted UI is disabled

---

## Music APIs

### Spotify Web API
Richest data source. Audio features (energy, valence, tempo, danceability, acousticness) power the matching algorithm.
Auth: OAuth 2.0 PKCE (mobile-safe, no client secret on device).
Scopes: `user-top-read`, `user-read-recently-played`, `user-read-currently-playing`

### Apple Music (MusicKit)
iOS only — no Android support. Less granular data than Spotify (no audio features).
Falls back to genre + artist overlap matching.

### YouTube Data API v3
No official YouTube Music API exists. We proxy via YouTube Data API (liked videos + history, `youtube.readonly` scope) and filter for music content by channel/title.
Rate limit: 10K units/day free tier — sufficient for our sync pattern.

---

## Push Notifications — Expo Push + SNS
Expo Push Notifications service abstracts APNs (iOS) and FCM (Android). Free + managed.
Migration path to direct APNs/FCM via SNS is clean if needed at scale (just change Lambda HTTP target).

---

## Explicitly Rejected

| Tech | Why rejected |
|------|-------------|
| GraphQL / AppSync | Overhead not justified; REST handles our access patterns |
| Kubernetes / EKS | Over-engineered for v1; Lambda scales better at our size |
| MongoDB | No ACID transactions; PostgreSQL handles relational data better |
| Firebase | Vendor lock-in; AWS gives better pricing + control at scale |
| Redux Toolkit | Zustand is sufficient; Redux adds boilerplate without benefit |
| Socket.io | Requires persistent process; defeats serverless model |
| Prisma | Lambda cold start issues with engine binary |
