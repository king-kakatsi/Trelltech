# Charts Provider

Central index of the most important diagrams. Module-specific diagrams live in each module folder and are linked at the bottom.

## System Architecture

**Purpose**: How the client layers and Trello fit together

```mermaid
flowchart TD
    User[User] -->|Tap and Type| Screens[Expo Router Screens]
    Screens -->|Compose| UIComponents[Components and Hooks]
    UIComponents -->|Call Facade| Services[Domain Services]
    Services -->|HTTP| ApiClient[Axios Client]
    ApiClient -->|Key Plus Token| TrelloApi[Trello REST API]
    TrelloApi -->|JSON| ApiClient
    ApiClient -->|Normalized Result| Services
    Services -->|Plain Data| UIComponents
```

**Usage**: Reference in ARCHITECTURE.md.

## Data Flow Diagrams

**Purpose**: Request lifecycle from screen to Trello and back

```mermaid
flowchart TD
    Screen[Screen] -->|Call Service| Svc[Service Facade]
    Svc -->|GET POST PUT DELETE| Client[API Client]
    Client -->|Inject Auth| Trello[Trello API]
    Trello -->|JSON Payload| Client
    Client -->|Success Data Error| Svc
    Svc -->|Unwrap| Screen
    Screen -->|setState| Screen
```

**Usage**: Reference in module DATA_FLOW.md files.

## Activity Diagrams

**Purpose**: Board loading with parallel fetches

```mermaid
flowchart TD
    Start([Open Board]) --> Load[Load Board Lists Members]
    Load --> AllOk{All Success}
    AllOk -->|Yes| Render[Render Kanban]
    AllOk -->|No| ShowError[Show Error Alert]
    ShowError --> RenderPartial[Render What Loaded]
```

**Usage**: Reference in boards module docs.

## Use Case Diagrams

**Purpose**: Who does what across the app

```mermaid
flowchart TD
    Member([Member]) --> Browse[Browse Workspaces and Boards]
    Member --> ManageCards[Create and Edit Cards]
    Member --> Comment[Comment on Cards]
    Member --> Automate[Run Automation Studio]
    Admin([Workspace Admin]) --> ManageMembers[Manage Members]
    Admin --> DeleteWs[Delete Workspace]
    Browse --> App[TrellTech App]
    ManageCards --> App
    Comment --> App
    Automate --> App
    ManageMembers --> App
    DeleteWs --> App
```

**Usage**: Reference in FEATURES.md.

## Sequence Diagrams

**Purpose**: Authenticated request flow

```mermaid
sequenceDiagram
    Screen->>+Service: call function
    Service->>+ApiClient: get post put del
    ApiClient->>+Storage: read trello_token
    Storage-->>-ApiClient: token
    ApiClient->>+Trello: HTTPS with key and token
    Trello-->>-ApiClient: JSON
    ApiClient-->>-Service: success data error
    Service-->>-Screen: result object
```

**Usage**: Reference in services and FUNCTIONS.md files.

## Interaction Diagrams

**Purpose**: Which services the automation touches

```mermaid
flowchart TD
    Studio[Automation Studio] --> Builder[Board Builder Hook]
    Studio --> Branch[Branch Tools Hook]
    Builder --> MdSync[Markdown Sync]
    Branch --> BranchUtil[Branch Comments Util]
    Branch --> ResourceUtil[Resource Cards Util]
    MdSync --> BoardsSvc[Boards Service]
    MdSync --> ListsSvc[Lists Service]
    MdSync --> CardsSvc[Cards Service]
```

**Usage**: Reference in automation module docs.

## State Diagrams

**Purpose**: Card lifecycle on a board

```mermaid
stateDiagram-v2
    [*] --> Open
    Open --> InProgress
    InProgress --> Done
    Done --> Archived
    Open --> Archived
    InProgress --> Archived
```

**Usage**: Reference in cards and lists module docs.

## Entity Relationship Diagrams

**Purpose**: Trello domain model (full version in DATABASE.md)

```mermaid
erDiagram
    WORKSPACE ||--o{ BOARD : contains
    BOARD ||--o{ LIST : contains
    LIST ||--o{ CARD : contains
    CARD ||--o{ COMMENT : has
    BOARD ||--o{ LABEL : defines
    CARD ||--o{ MEMBER : assigned
```

**Usage**: Reference in DATABASE.md.

## Page Hierarchy Maps

**Purpose**: Navigation from splash to card detail

```mermaid
flowchart TD
    Splash[Splash] --> Home[Home]
    Home --> Boards[Boards]
    Boards --> BoardDetail[Board Detail]
    BoardDetail --> CardDetail[Card Detail]
    Home --> Studio[Automation Studio]
```

**Usage**: Reference in PAGE_LISTING.md.

## User Journey Maps

**Purpose**: First-run to productive use

```mermaid
flowchart TD
    Install[Install] --> Login[Login]
    Login --> Browse[Browse Workspaces]
    Browse --> OpenBoard[Open Board]
    OpenBoard --> ManageCards[Manage Cards]
    ManageCards --> Automate[Try Automation]
```

**Usage**: Reference in FEATURES.md and user guides.

## Deployment Diagrams

**Purpose**: From commit to store (full version in DEPLOYMENT.md)

```mermaid
flowchart TD
    Code[Code] --> Build[EAS Build]
    Build --> Store[App Stores]
    Store --> Device[User Device]
```

**Usage**: Reference in DEPLOYMENT.md.

### Module Diagrams

- [Auth Module Diagrams](./modules/auth/DIAGRAMS.md)
- [Workspaces Module Diagrams](./modules/workspaces/DIAGRAMS.md)
- [Boards Module Diagrams](./modules/boards/DIAGRAMS.md)
- [Lists Module Diagrams](./modules/lists/DIAGRAMS.md)
- [Cards Module Diagrams](./modules/cards/DIAGRAMS.md)
- [Comments Module Diagrams](./modules/comments/DIAGRAMS.md)
- [Members Module Diagrams](./modules/members/DIAGRAMS.md)
- [Automation Module Diagrams](./modules/automation/DIAGRAMS.md)
