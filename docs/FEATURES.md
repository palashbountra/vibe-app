# Vibe — Feature Specifications

> **Product**: Music social discovery app (NOT a dating app).
> **Platform**: iOS + Android (React Native / Expo)
> **Last updated**: 2026-05-05

---

## Core Concept

Vibe removes the stigma of dating apps by being purely a **social discovery platform**. You connect your music services, the app surfaces people nearby who share your taste, and you can connect with them — like Instagram follow but based on audio compatibility. There's also a full Communities layer for genre/artist/local scenes.

---

## v1 Feature List

### 1. Auth & Onboarding

**Screens**: welcome → login → (phone → verify) → setup-profile → connect-music → discover

| Feature | Details |
|---------|---------|
| Apple Sign In | iOS only via `expo-apple-authentication` |
| Google Sign In | `expo-auth-session` OAuth 2.0 |
| Phone + OTP | AWS Cognito SMS. 6-digit code, auto-advance inputs |
| Profile setup | Display name, username (@handle), avatar color |
| Music connect | Spotify OAuth PKCE, Apple MusicKit, YouTube OAuth |

**Acceptance criteria:**
- User can complete full auth flow in < 60 seconds
- Profile setup validates: name ≥ 2 chars, username ≥ 3 chars, alphanumeric + . + _
- Can skip music connect (degrades matching quality, shown warning)
- Sign-out clears all local state

---

### 2. Discover

The main feed — people around you, ranked by music compatibility.

| Feature | Details |
|---------|---------|
| User cards | Avatar, display name, @username, top 3 genres, compatibility % badge |
| Compatibility score | Computed server-side from shared artists, genres, audio features |
| "Connect" action | Sends a connection request to the other user |
| Expand card | Tap card → full mini-profile with top artists, now playing |
| Proximity filter | Configurable radius (1km – 50km) |
| Refresh | Pull-to-refresh fetches new batch of users |
| Empty state | "No one nearby yet — invite a friend" |

**Acceptance criteria:**
- Cards load within 2s (mock data in Sprint 2, real in Sprint 3)
- Compatibility % clearly displayed (color-coded: green ≥ 70%, yellow 40–70%, grey < 40%)
- Cannot see same user card twice in one session

---

### 3. Connection System

| Feature | Details |
|---------|---------|
| Send request | Tap "Connect" on any user card or profile |
| Receive request | Push notification + in-app badge on Connections tab |
| Accept / Decline | Swipe or tap on pending request |
| Connected users | Appear in Connections tab, can now chat |
| Remove connection | Long-press → Remove |
| Mutual connections | Show "X mutual connections" on user cards |

---

### 4. Communities

| Feature | Details |
|---------|---------|
| Browse | "Popular" tab with trending communities |
| Categories | Genre-based, artist fan clubs, local city scenes, custom |
| Join | One tap to join public communities |
| Create | Name + description + category + cover image |
| Community feed | Posts, shared tracks, event announcements |
| Members list | See who's in the community + their compatibility |

---

### 5. Chat

| Feature | Details |
|---------|---------|
| 1:1 messaging | Real-time via WebSocket (API Gateway) |
| Message types | Text, share a track (Spotify/Apple Music link preview) |
| Read receipts | Delivered / Read |
| Typing indicator | "..." bubble |
| Push notifications | For new messages when app is backgrounded |
| Chat list | Sorted by last message, unread badge |

---

### 6. Profile

| Feature | Details |
|---------|---------|
| Display name + username | Editable |
| Avatar | Color-based for v1, photo upload in v2 |
| Bio | Short text (140 chars) |
| Top artists | Pulled from connected music platforms |
| Top genres | Derived from listening history |
| Now Playing | Live "currently listening to" widget |
| Connected platforms | Shows which music services are linked |
| Connection count | "42 connections" |

---

### 7. Now Playing

| Feature | Details |
|---------|---------|
| Source | Spotify "currently playing" API endpoint |
| Display | Track name + artist + album art thumbnail |
| Visibility | Shows on your profile card in Discover feed |
| Refresh | Polls every 30s or on app foreground |
| Privacy | User can disable in settings |

---

## v2 Roadmap (Post-Launch)

- Photo-based avatar upload
- Voice notes in chat
- Events: create/attend music events nearby
- Collaborative playlists with connections
- Spotify / Apple Music integration deeplinking (tap track → opens in streaming app)
- Web app (React, same API)

---

## Non-Features (Intentionally excluded from v1)

- ❌ Swiping left/right (not a dating app)
- ❌ "Super likes" or paid boosts
- ❌ Algorithm feed (just proximity + compatibility rank)
- ❌ Stories / ephemeral content
- ❌ Video calls
