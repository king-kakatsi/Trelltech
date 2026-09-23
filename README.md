# TrellTech

A cross-platform Trello client built with React Native and Expo, plus an Automation Studio that builds full boards from a markdown plan.

![version](https://img.shields.io/badge/version-1.0.0-blue) ![license](https://img.shields.io/badge/license-MIT-green) ![expo](https://img.shields.io/badge/expo-SDK%2054-black)

## Quick Start

```bash
npm install
cp .env.example .env   # fill in Trello API key and OAuth values
npx expo start
```

Then open the app with Expo Go, an emulator, or `npm run android` / `npm run ios`.

## Key Features

- Trello OAuth login with persistent session
- Browse workspaces, boards, lists, and cards
- Create, edit, and archive boards, lists, and cards
- Card comments, due dates, and member management
- Automation Studio: generate boards from markdown, branch comments, resource cards
- Dark-themed gesture-friendly mobile UI

## Tech Stack

- React Native 0.81.5, React 19.1, Expo SDK 54, expo-router 6
- Axios, NativeWind 4, AsyncStorage
- Trello REST API (external), Jest + React Native Testing Library

## Deployment Status

[Standalone Application] — see [docs/INSTALLATION.md](docs/INSTALLATION.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — system design and project tree
- [Features](docs/FEATURES.md) — feature catalog with user flows
- [Database](docs/DATABASE.md) — Trello entities and local storage
- [Testing Strategy](docs/TESTING_STRATEGY.md) — how quality is ensured
- [Page Listing](docs/PAGE_LISTING.md) — all screens and routes
- [Charts Provider](docs/CHARTS_PROVIDER.md) — every diagram in one place
- [Modules](docs/modules/) — deep dives per feature area
- [User Guides](docs/user-guides/) — step-by-step usage guides

## License & Contributing

MIT. See `LICENSE` if present. Contributions are welcome — open an issue or a pull request describing the change first.

## Developed By

**Leroi Kakatsi**

- Email: [leroi.kakatsi@epitech.eu](mailto:leroi.kakatsi@epitech.eu)
- WhatsApp: [+233 53 561 0908](https://wa.me/233535610908)
- Portfolio: [king-kakatsi.netlify.app](https://king-kakatsi.netlify.app)


**Joel Houinsavi**
- Email: [joel.houinsavi@epitech.eu](joel.houinsavi@epitech.eu)
- WhatsApp: [+229 01 97 70 38 37](https://wa.me/2290197703837)
- Portfolio: [www.paqo.net](https://paqo.net/Auteur)

**Regina Dokponou**
- Email: [regina.dokponou@epitech.eu](regina.dokponou@epitech.eu)
- **WhatsApp**: [+221 01 94 42 82 15](https://wa.me/22101 94 42 82 15)
- **Portfolio**: [regina-dokponou.linkedin](https://www.linkedin.com/in/regina-dokponou-61a343312)

### Waren Konnon
- **Email**: waren.konnon@epitech.eu
- **WhatsApp**: +229 01 61 62 32 32
- **Portfolio**: [waren-konnon.linkedin](https://www.linkedin.com/in/waren-konnon-651095310)



## Screenshots

### Login page
![login](./docs/screenshots/trelltech_login.jpeg)

### User connexion to trello app
![Authentification](./docs/screenshots/trelltech_oauth.jpeg)

### User profile
![Workspaces list](./docs/screenshots/trelltech_profile.jpeg)

### Home & Workspaces
![Workspaces list](./docs/screenshots/trelltech_workspaces.jpeg)

### Management of workspace members 
![action for Workspace members](./docs/screenshots/trelltech_board_action.jpeg)

### Action on workspace 
![workspace action](./docs/screenshots/trelltech_workspace_action.jpeg)

### User boards
![Boards](./docs/screenshots/trelltech_boards.jpeg)

### Board creation
![board creation form ](./docs/screenshots/trelltech_add_board.jpeg)


### User board detail
![Board detail ](./docs/screenshots/trelltech_board.jpeg)


### Management of board members 
![action for board members](./docs/screenshots/trelltech_manage_board_members.jpeg)

