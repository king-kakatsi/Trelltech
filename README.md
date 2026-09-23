# TrellTech

A cross-platform mobile client for Trello built with **React Native**, **Expo Router**, and **NativeWind**. TrellTech lets you manage workspaces, boards, lists, cards, members, and comments with a dark-themed, gesture-friendly interface.

## What this project demonstrates

- **Clean mobile architecture**: presentation (`app/`, `components/`) is separated from domain services (`services/`) and shared utilities (`utils/`, `lib/`).
- **Single HTTP client**: all Trello API calls go through one authenticated Axios client with request/response normalization.
- **Reusable UI system**: shared primitives for drawers, avatars, empty states, form actions, and loading spinners.
- **OAuth integration**: Trello authentication via `expo-web-browser` and `expo-auth-session`, with secure token storage in AsyncStorage.
- **Automation tooling**: board creation from markdown, branch-name comments, and resource-card injection.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Routing | Expo Router (file-based) |
| Styling | NativeWind / TailwindCSS |
| State | React Context (`AuthContext`) + local component state |
| HTTP | Axios + custom `services/api/client.js` |
| Storage | `@react-native-async-storage/async-storage` |
| Icons | `@expo/vector-icons`, `lucide-react-native` |

## Architecture

```
app/                 — Expo Router screens (presentation only)
components/
  ui/                — Shared primitives (BottomDrawer, Button, Input, EmptyState, MemberAvatar, FormActions, ...)
  home/              — Home screen pieces
  boards/            — Board list pieces
  boardDetail/       — Board detail pieces
  cards/             — Card detail / create / update pieces
  workspace/         — Workspace pieces
  automation/        — Automation Studio pieces
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
lib/
  validation.js      — Shared validators
utils/               — Domain helpers (markdown parser, templates, colors, branch names)
```

All service functions return a consistent shape:

```ts
{ success: boolean; data?: T; error?: string }
```

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- iOS Simulator (macOS) or Android Emulator

### Environment

Create a `.env` file at the project root:

```bash
EXPO_PUBLIC_APP_NAME=TrellTech
EXPO_PUBLIC_API_BASE_URL=https://api.trello.com/1
EXPO_PUBLIC_TRELLTECH_API_KEY=your_trello_key
EXPO_PUBLIC_TRELLTECH_API_SECRET=your_trello_secret
EXPO_PUBLIC_OAUTH_CALLBACK=exp://localhost:8081/--/auth
EXPO_PUBLIC_SCOPES=read,write
```

### Install and run

```bash
npm install
npm test        # run the test suite
npm run lint    # run ESLint
npx expo start  # start the development server
```

## Scripts

```bash
npm start       # expo start
npm test        # jest --ci
npm run lint    # expo lint
npm run android # expo start --android
npm run ios     # expo start --ios
```

## Testing

The project ships with integration tests covering the authentication flow and board-detail service contracts:

```bash
npm test
```

## Screenshots

See the [docs/screenshots](./docs/screenshots) folder for app previews.

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Installation Guide](./docs/INSTALLATION.md)
- [Quick Start](./docs/QUICKSTART.md)
- [API Integration](./docs/API_INTEGRATION.md)
- [Contributing](./docs/CONTRIBUTING.md)

## Authors

Built by the Mobomobilo team:

- **Leroi Kakatsi** — [Portfolio](https://kingweb.pythonanywhere.com)
- **Joel Houinsavi** — [Portfolio](https://paqo.net/Auteur)
- **Regina Dokponou** — [LinkedIn](https://www.linkedin.com/in/regina-dokponou-61a343312)
- **Waren Konnon** — [LinkedIn](https://www.linkedin.com/in/waren-konnon-651095310)

## License

MIT — see [LICENSE](./LICENSE.txt).
