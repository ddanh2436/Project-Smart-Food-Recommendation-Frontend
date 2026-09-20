# VietNomNom — Frontend

Next.js 16 (App Router) UI for the VietNomNom food recommendation app.

Deployment: see [DEPLOY.md](./DEPLOY.md).

## Stack

- Next.js 16 + React 19, App Router
- TypeScript (strict — `ignoreBuildErrors` is **off**, see below)
- Plain CSS per component, plus Tailwind v4 for the chat surfaces
- Leaflet + leaflet-routing-machine for directions
- axios via a single configured client in `app/lib/api.ts`

## Layout

```
app/
  (main)/            header + footer shell
    page.tsx         home: hero, city spotlights, six "Top ..." sections
    restaurants/     listing with filters, map modal, detail pages
    chatbot/         full-page AI assistant
    about-us/        cuisine encyclopaedia
    profile/         account settings
  (user)/auth/       sign in / sign up, Google callback
  contexts/          AuthContext — session *and* language
  hooks/             useGeolocation
  lib/api.ts         the single API client
components/
  ReviewAspects/     NEW — per-aspect AI review breakdown
  ChatWidget/        floating assistant
  ...
```

## Configuration

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | backend base URL, no trailing slash |
| `NEXT_PUBLIC_SITE_URL` | own URL, for SEO metadata |

Everything prefixed `NEXT_PUBLIC_` is embedded in the browser bundle — never put
a secret in one.

## The API client

`app/lib/api.ts` is the only place that talks to the backend. It handles:

- **Token refresh.** On a 401 it exchanges the refresh token once and replays the
  original request. Concurrent 401s share a single in-flight refresh, because
  each rotation invalidates the previous token and parallel refreshes would race
  and lose.
- **Safe storage.** Every `localStorage` access is guarded for SSR and wrapped in
  try/catch, so private mode or blocked site data cannot throw.
- **Readable errors.** `describeError` unwraps Nest's validation-message array,
  which otherwise rendered as `[object Object]`.

## What was fixed

**Session handling**

- There was **no token refresh at all**. The access token lives 15 minutes, so
  users were silently signed out mid-session.
- Logout only cleared `localStorage` and never called `POST /auth/logout`, so the
  refresh token stayed valid server-side for its full 7 days — a token captured
  from a shared machine kept working long after signing out.
- The interceptor read `localStorage` unguarded, which throws during SSR.

**Two competing i18n systems.** `AuthContext` stored `'vn'|'en'` under `appLang`;
`Header` wrote `'vi'|'en'` under `app-language` and broadcast its own
`language-change` event that only some pages listened for. Switching language
updated the header but not the restaurants page, and after a reload the two
disagreed. There is now one key, one event, and one source of truth, with a
migration for the old value.

**Invented locations.** Several pages seeded their location state with a
hardcoded District 1 coordinate, and the chat components sent
`"10.7769", "106.7009"` on every request. So "distance from you" was measured
from an arbitrary street — and stayed wrong forever if the user denied
permission. `useGeolocation` returns `null` until a real position is granted, and
the UI omits distances rather than inventing them.

**`typescript.ignoreBuildErrors: true`** meant every type error shipped to
production. Turning it off surfaced real ones: six components each redeclared the
`Restaurant` interface with fields marked required that the API can legitimately
omit, so `score.toFixed()` could run on `undefined`. There is now one shared type.

**Other**

- `images.remotePatterns` was `hostname: "**"` — an open image proxy that also
  let a third party burn the Vercel image quota. Now an explicit host list.
- Modal scroll lock was set imperatively with no cleanup, so navigating away with
  a modal open left `overflow: hidden` on `<body>` and the next page could not
  scroll. Now driven by an effect, and Escape closes the dialog.
- The sign-up form validated a 6-character password while the API required 8, and
  did not check the username format at all, so both failed server-side with raw
  validation errors.
- The greeting message was set via `setState` inside an effect, causing a
  cascading render on every chat mount.
- Six near-identical `getTopXRestaurants` functions collapsed into one
  `getTopRestaurants(sortBy, limit)`; `getAllRestaurants`'s ten positional
  parameters became a single options object.

## New features

- **AI review breakdown** (`components/ReviewAspects`). The existing overview
  answers "is this place good?"; this answers "good at *what*?" — food, price,
  service, ambience, hygiene and parking each get a verdict and a verbatim quote
  pulled from real reviews.
- **Conversational follow-ups.** The chat now sends its history, so "rẻ hơn đi"
  and "còn gì khác" refine the previous search instead of starting a new one.
- **Real geolocation**, cached per session, only prompting when it is needed.
- **Security headers** via `next.config.ts` (`nosniff`, frame options,
  referrer policy, a `Permissions-Policy` that allows only geolocation).

## Known remaining lint warnings

`npm run lint` still reports pre-existing `no-explicit-any` and
`no-unescaped-entities` findings in `RoutingMap`, `about-us` and
`ReviewOverview`. They are cosmetic, do not affect the build, and were left alone
to keep this change reviewable.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npx tsc --noEmit
npm run lint
```
