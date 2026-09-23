# Project Tree

```text
trelltech/
├── app/                        # expo-router screens (presentation only)
│   ├── _layout.jsx             # root stack + AuthProvider
│   ├── index.jsx               # splash + auth redirect
│   ├── onboarding.jsx          # first-run onboarding
│   ├── (auth)/login.jsx        # login screen
│   ├── (tabs)/                 # home + profile tabs
│   ├── workspace/[workspaceId]/boards.jsx
│   ├── workspace/[workspaceId]/board/[boardId]/index.jsx
│   ├── workspace/[workspaceId]/board/[boardId]/card/[cardId].jsx
│   └── create-board.jsx        # Automation Studio screen
├── components/                 # reusable UI
│   ├── ui/                     # BottomDrawer, FormActions, MemberAvatar, EmptyState, LoadingSpinner
│   ├── automation/             # ActionBtn, ResultBanner, LiveTimeline
│   ├── boards/                 # BoardsList, BoardCard, CreateBoardDrawer
│   ├── boardDetail/            # header, drawers, ListCarousel, members bar
│   ├── home/                   # WorkspaceList, WorkspaceAccordion, BoardList
│   ├── workspace/              # NewWorkspace, UpdateWorkspace, ManageWorkspaceMembers
│   ├── cards/                  # CardDetails, CardComments, CardCreate, CardUpdate
│   ├── Kanban.jsx              # list column with cards
│   └── TaskCard.jsx            # card row
├── contexts/AuthContext.jsx    # session state (user, token, login, logout)
├── hooks/                      # useAutomationLogs, useBoardBuilder, useBranchTools
├── services/                   # domain facades over the Trello API
│   ├── api/client.js           # single axios client + {success, data, error} contract
│   ├── auth.js                 # OAuth + current user
│   ├── workspaces.js           # organizations CRUD + members
│   ├── boards.js               # boards CRUD + board members
│   ├── lists.js                # lists CRUD
│   ├── cards.js                # cards, dates, comments
│   └── members.js              # board and card membership by scope
├── utils/                      # markdown parser, branch names, theme, retry helpers
│   ├── markdown/               # parse, labels, checklists, cards, sync
│   ├── trello/                 # retry + throttle
│   └── boardFromMarkdown.js    # public entry point (re-export)
├── lib/validation.js           # shared form validators
├── styles/createBoard.js       # Automation Studio styles
├── __tests__/                  # Auth + BoardDetail integration tests
└── docs/                       # this documentation
```

Top-level folders: `app` holds screens only (no API calls except through services). `services` is the only layer that talks to Trello. `components` and `hooks` compose services into UI. `utils` holds pure logic such as the markdown parser. `contexts` holds the single global session store.
