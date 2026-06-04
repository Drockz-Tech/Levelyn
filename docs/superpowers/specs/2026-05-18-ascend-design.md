# Ascend Design Spec

Date: 2026-05-18
Author: GitHub Copilot (assistant)

## Goal

Build a mobile-first, offline-first Expo app called Ascend: a gamified self-improvement tracker focused on short, beautiful story-card shareability. Priorities: polished UI, smooth animations, robust local data model, and a best-in-class story card generator.

## High-level Architecture

- Expo (managed) with TypeScript and Expo Router for navigation
- State: Zustand with persisted slices using AsyncStorage
- UI: React Native + NativeWind for utility styles, React Native Reanimated for motion, React Native SVG for card graphics
- Data model: append-only session/activity event log; derived selectors compute XP, levels, streaks, and stats
- Card export: render cards as SVG/Canvas inside RN and export to image using `expo-file-system` + `expo-sharing` / `react-native-view-shot` as fallback

## Key Principles

- Local-first: all user data lives on device; sync is a future seam via event-log replication
- Minimal onboarding and immediate gratification (start a session within two taps)
- Dark-mode-first with neon accents and rounded, minimal typography
- Keep domain logic deterministic and testable via pure functions (XP math, level calc, streak logic)

## Core Data Model

Store an append-only array of events. Example event shape (TypeScript):

```ts
type ActivityCategory = 'study' | 'coding' | 'reading'

interface SessionEvent {
  id: string // uuid
  type: 'session' // future events: profile_update, theme_change
  category: ActivityCategory
  startedAt: string // ISO
  endedAt?: string // ISO (absent if active)
  pausedDurations?: Array<{from: string; to?: string}>
  xpEarned?: number
}
```

Derived projections are pure functions that compute:
- Total XP
- Current level and progress to next level
- Daily streak (days with >= 1 minute activity)
- Weekly and monthly hours
- Achievement badges

XP rules (fixed constants):
- Study = 40 XP / hour
- Coding = 50 XP / hour
- Reading = 30 XP / hour

XP calculation uses seconds of active duration (excluding paused time) * rate/3600, rounded to integers.

Level system (example thresholds):
- Level 1: 0 XP
- Level 2: 500 XP
- Level 3: 1500 XP
- Level n: use formula: xpForLevel(n) = 250 * (n-1) * n (tunable)

Rank titles (derived from level ranges): Beginner, Scholar, Specialist, Elite, Ascended

## Screens & UX Flow

- Onboarding (modal): choose avatar (preset + initials), pick neon theme palette, set username
- Home (default tab): big XP ring, progress bar, streak chip, total hours, quick-start buttons for three categories, active session card with pause/end
- Sessions tab: list of recent sessions, active session controls, ability to edit session end/notes
- Stats tab: weekly hours chart, monthly aggregate, breakdown, streak calendar heatmap
- Profile tab: avatar, username, rank, badges, export backup
- Share flow: from session end or stats view -> preview card types -> export/save/share

## Story Card Generator (detailed)

Card types:
- Session Summary: category, duration, XP gained, username, rank, streak
- Weekly Recap: total hours, top category, weekly XP, streak
- Streak Milestone: current streak length, personal best, celebratory glow
- Level Up: old level -> new level, XP gained, date

Design rules:
- 1080x1920 story aspect ratio by default (vertical)
- Use layered SVG with neon gradient backgrounds, subtle noise texture, rounded panels, and glow for progress bars
- Keep text minimal and highly legible: headline + 1-2 supporting lines

Implementation:
- Build card UI as a React component tree that renders to an SVG root (React Native SVG). Keep layout param-driven.
- For export, either rasterize the SVG to PNG with `react-native-view-shot` or render to Canvas/Skia later if needed. Prefer `view-shot` for v1.
- Provide a small share sheet using `expo-sharing` and `Share.share`.

## Design System / Tokens

- Colors: background `#0A0A0F`, surface `#0E0E14`, neonBlue `#7BE7FF`, neonPurple `#B77BFF`, accent gradients
- Typography: Inter / System, weights: 600 headline, 400 body
- Spacing: 4pt base unit, rounded corners 12-18px
- Motion: small springs for interactions, 400-600ms celebratory animations

## File Structure (initial)

- `app/` - Expo Router entry + tabs
- `app/(tabs)/home.tsx`, `app/(tabs)/stats.tsx`, `app/(tabs)/sessions.tsx`, `app/(tabs)/profile.tsx`
- `components/` - Button, Card, XPBar, Avatar, Icon, NeonBackground
- `features/sessions/` - SessionList, SessionTimer, session slice
- `features/story-cards/` - Card components + export helpers
- `store/` - zustand store slices and persistence
- `utils/` - xp.ts, levels.ts, date.ts, svgExport.ts
- `constants/` - colors.ts, activity.ts, ranks.ts

## Persistence & Migrations

- Persist raw event log under `ascend:events` in AsyncStorage
- Persist user profile under `ascend:profile`
- On startup, load events and run lightweight migrations: verify event schema versions and migrate if needed
- Provide backup/export (JSON) and import UI in profile

## Performance & Testing

- Keep selectors memoized (use Zustand + derived selectors via `zustand/middleware` or `zustand` computed selectors)
- Avoid heavy per-frame work; run expensive aggregations off UI thread when possible (debounce updates)
- Add unit tests for XP math, level calculation, streak logic

## Acceptance Criteria (v1)

- App boots to onboarding or home within 2s on mid-range devices
- Can start/pause/end sessions and earn XP using the rules above
- Home shows correct level, XP bar, streak, and total hours
- Stats show weekly summary and breakdown
- Story cards can be generated, previewed, exported, and shared (save image + share intent)

## Next Steps

1. Implement this spec's files and core store (event log).  
2. Build basic Home and Session timer UI with no animations to validate flows.  
3. Ship story-card component and export flow early for marketing assets.  

---
Spec saved to `docs/superpowers/specs/2026-05-18-ascend-design.md`.

Please review and approve; after approval I'll write the implementation plan and begin scaffolding the project.
