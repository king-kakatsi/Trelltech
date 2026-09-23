# Trelltech — Architecture Overview

This document describes the target architecture after the portfolio refactor. The goal is a codebase that is easy to navigate, test, and extend.

## Layer map

```
app/                 — Expo Router screens (presentation / routing only)
components/
  ui/                — Reusable primitives (BottomDrawer, Button, Input, EmptyState, MemberAvatar, FormActions, LoadingSpinner)
  home/              — Home screen pieces
  boards/            — Board list pieces
  boardDetail/       — Board detail pieces
  cards/             — Card detail / create / update pieces
  workspace/         — Workspace pieces
  automation/        — Automation Studio pieces (split from create-board.jsx)
contexts/            — React contexts (Auth only)
services/
  api/               — HTTP client, auth interceptor, typed errors
  boards.js          — Board API facade
  lists.js           — List API facade
  cards.js           — Card API facade
  workspaces.js      — Workspace API facade
  members.js         — Member API facade
  auth.js            — OAuth + current user
  localStorage.js    — AsyncStorage wrapper
  index.js           — Optional barrel export
lib/
  validation.js      — Shared validators (required, url, email, ...)
utils/               — Domain helpers (markdown parser, templates, colors, branch names)
  markdown/          — Parser / labels / checklists / cards / sync
  trello/            — retry / throttle helpers
__tests__/           — Integration / unit tests
```

## Service contract

All service functions return:

```ts
{ success: boolean; data?: T; error?: string }
```

Never throw plain strings. Network errors are normalized to the above shape by the HTTP client.

## HTTP client

- `services/api/client.js` wraps axios.
- Base URL and `key` param are injected centrally.
- A request interceptor reads `trello_token` from AsyncStorage and injects the `token` param.
- No manual `?key=...&token=...` string concatenation lives outside the interceptor.

## Authentication

- `services/auth.js` owns `authenticate()` and `getCurrentUser()`.
- `contexts/AuthContext.jsx` consumes only those named exports.
- The token is always read by the interceptor; services never call `fetchFromLocalStorage('trello_token')` directly.

## Validation

- `lib/validation.js` exposes `required(value, fieldName)` and `validateUrl(url)`.
- Screens use these helpers before calling services; inline validation duplication is avoided.

## Naming conventions

- English everywhere: file names, variables, comments, user-facing messages.
- Components: PascalCase files export default PascalCase.
- Services/helpers: camelCase files export named functions.
- Avoid abbreviations except universally known ones (`id`, `desc` is OK when matching the external API).

## Styling

- NativeWind/Tailwind only.
- Shared colors live in `utils/theme.js`.
- Shared layout primitives live in `components/ui/`.

## Dead-code policy

- Empty files are deleted.
- Commented-out blocks are removed.
- Unused imports are cleaned by lint.

## Tests

- `npm test` and `npm run lint` must pass before a change is considered complete.
