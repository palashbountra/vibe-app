# Features — Vibe App
> Last updated: 2026-05-02

## v1 Feature Status

| Feature | Status | Sprint |
|---------|--------|--------|
| F1 — Auth & Music Connect | Not started | Sprint 1 |
| F2 — Profile & Music Showcase | Not started | Sprint 1–2 |
| F3 — Matching & Swipe UI | Not started | Sprint 2–3 |
| F4 — Real-Time Chat | Not started | Sprint 3–4 |
| F5 — Now Playing | Not started | Sprint 4 |
| F6 — Settings | Not started | Sprint 4–5 |

---

## F1 — Auth & Music Platform Connection (P0)
Users sign up, verify email, then MUST connect at least one music platform before entering the app.

**Screens**: Splash → Sign Up → Verify Email → Connect Music Platform → OAuth flow → Success

**Acceptance Criteria**
- [ ] Email + password signup with Cognito
- [ ] Apple Sign In (required for App Store)
- [ ] Google OAuth (optional)
- [ ] Email verification enforced before app access
- [ ] Spotify OAuth 2.0 PKCE — scopes: `user-top-read`, `user-read-recently-played`, `user-read-currently-playing`
- [ ] Apple Music MusicKit on iOS (show "iOS only" on Android)
- [ ] YouTube / Google OAuth
- [ ] Tokens stored encrypted in Aurora (never in device storage)
- [ ] Token refresh handled by backend Lambda
- [ ] User can connect multiple platforms

---

## F2 — Profile Creation & Music Showcase (P0)
After music connect, users complete their profile. Music is front-and-center.

**Screens**: Setup (name/age/bio/gender) → Location → Photos → Preview

**Profile Card shows**: Name + age, photos, top 3 artists (with art), top genre pills, bio, music platform badge, Now Playing (if active), compatibility score (on other users only)

**Acceptance Criteria**
- [ ] Multi-step setup on first login
- [ ] Photo upload via S3 pre-signed URL (1–6 photos, auto-crop to square)
- [ ] Top artists + genres pulled from connected platform
- [ ] Profile not visible to others until complete (name, age, 1+ photo, music connected)
- [ ] DOB stored; age computed at render time
- [ ] Location stored as city-level only for display; precise coords for distance calc only

---

## F3 — Matching Algorithm & Swipe Interface (P0)
Core loop. Card stack ranked by compatibility score. Mutual right swipe = match.

**Screens**: Discovery feed, Profile detail (tap to expand), Match celebration, Empty state

**Swipe behaviors**: Right = like, Left = pass, Tap = expand profile, Long press artist = "you both like X"

**Acceptance Criteria**
- [ ] Feed loads < 2 seconds (Redis cache)
- [ ] Swipe gesture 60fps on both platforms (react-native-reanimated)
- [ ] Swipe recorded async via SQS (fire and forget — doesn't block UI)
- [ ] Mutual match detection runs after every right swipe
- [ ] Match celebration triggers immediately via WebSocket push
- [ ] Compatibility score + shared artists/genres shown on each card
- [ ] Feed auto-refills; no duplicate cards

---

## F4 — In-App Real-Time Chat (P0)
Matched users can chat. Real-time via WebSocket. Persists in DynamoDB.

**Screens**: Matches list, Chat thread, Match info panel (tap header), Unmatch flow

**Chat features (v1)**: Text messages, emoji reactions (long press), delivery/read receipts, typing indicator, push notification when offline

**Acceptance Criteria**
- [ ] Real-time delivery via WebSocket when both online
- [ ] Push notification via Expo + SNS when recipient offline
- [ ] Message history paginated (30/page)
- [ ] Messages survive app restarts
- [ ] Typing indicator < 1s latency
- [ ] Read receipts on message view
- [ ] Unmatching removes chat from both users
- [ ] WebSocket auto-reconnects on network drop
- [ ] Chat only possible between matched users (server-enforced)

---

## F5 — Live "Now Playing" (P1)
When listening, profile shows animated music bars + track + artist. On feed cards and in chat.

**Acceptance Criteria**
- [ ] Spotify: shows actual track name + artist (polled every 60s)
- [ ] Badge disappears within 60–90s of stopping
- [ ] Works in chat header via WebSocket push
- [ ] Apple Music: shows generic "Listening to Apple Music" badge
- [ ] YouTube Music: not supported v1
- [ ] Graceful degradation if platform API down

---

## F6 — Settings & Account Management (P1)
**Screens**: Settings home, Discovery preferences, Notifications, Connected accounts, Account, Privacy

**Acceptance Criteria**
- [ ] Discovery prefs (age range, distance, gender) update + invalidate feed cache
- [ ] Notification preferences respected per-type
- [ ] Pause mode: hide from discovery without deleting
- [ ] Account deletion: GDPR-compliant, PII deleted within 30 days, immediate removal from feed

---

## Post-v1 Roadmap

**v1.1**: Concert matching (Songkick API), undo swipe, super like, 30s track previews in app
**v1.2**: Music Rooms (group listen), shared Spotify playlists for matches, Vibes Feed (short video + song)
**v2**: Vibe Premium subscription (see who liked you, boosts, advanced filters), Stripe payments
**v3**: Photo verification, AI chat moderation, web app
