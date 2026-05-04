# Architecture — Vibe App
> Last updated: 2026-05-02

## Overview
Vibe is fully cloud-native on **AWS**, serverless-first. The React Native app talks only to AWS-managed services. No self-managed servers.

## AWS Services Map

```
Mobile (React Native/Expo)
    │ HTTPS / WSS
    ▼
CloudFront (CDN) + Route 53 (DNS)
    │
    ▼
API Gateway REST  ──────  API Gateway WebSocket
    │                           │
    ▼                           ▼
Lambda Functions (Node.js 20.x TypeScript)
    │
    ├── Aurora PostgreSQL Serverless v2  (users, matches, swipes)
    ├── DynamoDB                         (chat messages, WS connections)
    ├── ElastiCache Redis                (feed cache, now-playing, presence)
    ├── S3 + CloudFront                  (profile photos)
    └── SQS / SNS                        (match queue, push notifications)
```

## Service Decisions

### Aurora PostgreSQL Serverless v2
- Relational data needing complex joins + geo queries (PostGIS)
- Auto-scales 0.5–128 ACUs (near-zero cost at idle)
- Data API enabled → Lambda calls without VPC connection pool

### DynamoDB
- Chat messages: `matchId` (PK) + `timestamp#messageId` (SK), TTL 1 year
- WS connections: `connectionId` (PK), GSI on `userId`, TTL 24h

### ElastiCache Redis
- `feed:{userId}` — pre-computed candidate list, TTL 30 min
- `nowplaying:{userId}` — current track, TTL 90s
- `presence:{userId}` — online status, TTL 5 min

### API Gateway WebSocket
- Routes: `$connect`, `$disconnect`, `sendMessage`, `typing`, `nowPlaying`
- Connection IDs stored in DynamoDB; Lambda posts to connected clients

## Matching Algorithm

### Step 1 — Music Vector per user
```typescript
{
  genres: Record<string, number>,     // genre → weight 0–1 (top 20)
  artists: string[],                   // top 50 artist IDs
  audioFeatures?: {                    // Spotify users only
    avgEnergy, avgValence, avgDanceability, avgTempo, avgAcousticness
  }
}
```

### Step 2 — Compatibility Score (0–100)
```
score = (
  0.40 × genreCosineSimilarity +
  0.35 × artistJaccardSimilarity +
  0.25 × audioFeatureEuclideanSimilarity  // drops to 0 if no Spotify, redistributed
) × 100
```

### Step 3 — Feed Query
SQL: filter already-swiped users, ST_DWithin for geo, ORDER BY score DESC + 15% random shuffle, LIMIT 50. Cached in Redis 30 min.

## Music Sync Architecture
```
EventBridge (every 6 hours)
  → music-sync Lambda
  → Fetch Spotify/Apple Music/YouTube data
  → Compute music vector
  → Update Aurora music_profiles
  → Invalidate Redis feed cache
```

## CDK Stacks
```
infra/lib/stacks/
├── AuthStack.ts          ← Cognito User Pool + App Client
├── DatabaseStack.ts      ← Aurora, DynamoDB, ElastiCache, VPC
├── StorageStack.ts       ← S3 + CloudFront
├── LambdaStack.ts        ← All Lambda functions + IAM grants
├── ApiStack.ts           ← REST API + WebSocket API
└── NotificationsStack.ts ← SNS topic
```

## Environments
| Env | Purpose | Aurora Size |
|-----|---------|------------|
| dev | Local dev | 0.5–2 ACU |
| staging | Pre-prod | 0.5–8 ACU |
| prod | Live | 0.5–64 ACU, read replica |

## Security
- All REST routes protected by Cognito JWT authorizer (at API GW level)
- S3 access only via Lambda-generated pre-signed URLs
- Redis + Aurora in private VPC subnets
- Music OAuth tokens AES-256 encrypted at rest in Aurora
- Secrets in AWS Secrets Manager

## Cost Estimates
| Traffic | Monthly AWS Cost |
|---------|----------------|
| < 1K MAU (beta) | ~$30–60 |
| 10K MAU | ~$150–300 |
| 100K MAU | ~$800–1500 |
