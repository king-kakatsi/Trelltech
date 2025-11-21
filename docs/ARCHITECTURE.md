# Architecture Overview

Complete guide to TrellTech's architecture, structure, and design patterns.

## System Architecture

### High-Level Overview

```
┌────────────────────────────────────────────────┐
│           TrellTech Mobile App                 │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │      Presentation Layer (UI)             │  │
│  │  - Expo Router Pages                     │  │
│  │  - React Components                      │  │
│  │  - NativeWind Styling                    │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                              │
│  ┌──────────────▼───────────────────────────┐  │
│  │      State Management Layer              │  │
│  │  - React Context API                     │  │
│  │  - AuthContext                           │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                              │
│  ┌──────────────▼───────────────────────────┐  │
│  │      Service Layer                       │  │
│  │  - Axios Service (HTTP)                  │  │
│  │  - Trello Service (API)                  │  │
│  │  - Storage Service (AsyncStorage)        │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼──────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌──────┐ ┌──────────┐
   │ Trello │ │Local │ │ Device   │
   │  API   │ │Store │ │ Features │
   └────────┘ └──────┘ └──────────┘
```

## Project Structure

### Complete Directory Tree

```

├── app/                           # Expo Router application
│   ├── (auth)/                   # Auth route group
│   │   └── login.jsx            # Login screen
│   │
│   ├── (tabs)/                   # Bottom tabs group
│   │   ├── _layout.jsx          # Tabs navigator
│   │   ├── home.jsx             # Workspaces list
│   │   └── profile.jsx          # User profile
│   │
│   ├── workspace/                # Workspace routes
│   │   └── [workspaceId]/       # Dynamic workspace
│   │       ├── boards.jsx       # Boards list
│   │       ├── settings.jsx     # Workspace settings
│   │       └── board/           # Board routes
│   │           └── [boardId]/   # Dynamic board
│   │               ├── index.jsx # Board detail (Kanban)
│   │               └── card/    # Card routes
│   │                   └── [cardId].jsx # Card detail
│   │
│   ├── _layout.jsx               # Root layout
│   └── index.jsx                 # Entry point
│
├── components/                    # Reusable UI components
│   ├── workspace/
│   │   ├── WorkspaceCard.jsx
│   │   └── WorkspaceList.jsx
│   ├── board/
│   │   ├── BoardCard.jsx
│   │   └── BoardList.jsx
│   ├── kanban/
│   │   ├── KanbanColumn.jsx
│   │   ├── KanbanCarousel.jsx
│   │   └── TaskCard.jsx
│   ├── card/
│   │   ├── CardDetail.jsx
│   │   └── CommentItem.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── LoadingSpinner.jsx
│       └── BottomSheet.jsx
│
├── contexts/                      # React Context
│   ├── AuthContext.jsx           # Authentication state
│   └── WorkspaceContext.jsx      # Workspace state (optional)
│
├── services/                      # Service layer
│   ├── axiosService.js           # HTTP client wrapper
│   ├── localStorageService.js    # AsyncStorage wrapper
│   └── trello.js                 # Trello API integration
│
├── constants/                     # Configuration
│   ├── config.js                 # API keys, URLs
│   └── colors.js                 # Color palette
│
├── utils/                         # Utility functions
│   ├── formatters.js             # Date, text formatters
│   └── validators.js             # Form validation
│
├── hooks/                         # Custom React hooks
│   ├── useAuth.js                # Authentication hook
│   └── useTrello.js              # Trello data hook
│
├── assets/                        # Static assets
│   ├── images/
│   └── fonts/
│
├── docs/                          # Documentation
│
├── .gitignore
├── app.json                       # Expo configuration
├── package.json
├── tailwind.config.js             # NativeWind config
└── global.css                     # Global styles
```

## Expo Router (File-Based Routing)

### How Expo Router Works

Expo Router uses a file-based routing system similar to Next.js:

```
app/
├── index.jsx                 → /
├── login.jsx                 → /login
├── workspace/
│   └── [workspaceId]/
│       └── boards.jsx        → /workspace/:workspaceId/boards
```

### Route Groups

Routes in parentheses don't appear in the URL:

```
app/
├── (auth)/
│   └── login.jsx             → /login (not /auth/login)
├── (tabs)/
│   ├── home.jsx              → /home
│   └── profile.jsx           → /profile
```

### Dynamic Routes

Use brackets for dynamic parameters:

```
app/
└── workspace/
    └── [workspaceId]/        → /workspace/123
        └── board/
            └── [boardId]/    → /workspace/123/board/456
```

### Layout Files

`_layout.jsx` files wrap child routes:

```javascript
// app/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

## Navigation Flow

### Complete User Journey

```
App Launch
    ↓
Check Authentication (AuthContext)
    ├─ Not Authenticated → /login
    │       ↓
    │   Trello OAuth
    │       ↓
    │   Store Token (AsyncStorage)
    │       ↓
    └─ Authenticated → /(tabs)/home
            ↓
      Workspaces List
            ↓ (Click workspace)
      /workspace/[id]/boards
            ↓ (Click board)
      /workspace/[id]/board/[id]
      (Kanban Carousel)
            ↓ (Click card)
      /workspace/[id]/board/[id]/card/[id]
      (Card Detail)
```

### Navigation Examples

```javascript
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  // Navigate to workspace boards
  router.push(`/workspace/${workspaceId}/boards`);
  
  // Navigate back
  router.back();
  
  // Replace current route
  router.replace('/home');
}
```

## Component Architecture

### Component Hierarchy

```
App Root
├── AuthContext.Provider
│   └── RootLayout (_layout.jsx)
│       ├── TabsLayout ((tabs)/_layout.jsx)
│       │   ├── HomeScreen (home.jsx)
│       │   │   └── WorkspaceList
│       │   │       └── WorkspaceCard (multiple)
│       │   └── ProfileScreen (profile.jsx)
│       │
│       └── WorkspaceLayout (workspace/[id]/_layout.jsx)
│           ├── BoardsScreen (boards.jsx)
│           │   └── BoardList
│           │       └── BoardCard (multiple)
│           └── BoardDetailScreen (board/[id]/index.jsx)
│               └── KanbanCarousel
│                   └── KanbanColumn (multiple)
│                       └── TaskCard (multiple)
```

### Component Design Patterns

#### 1. Container/Presentational Pattern

```javascript
// Container Component (Smart)
// workspace/[workspaceId]/boards.jsx
export default function BoardsScreen() {
  const { workspaceId } = useLocalSearchParams();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBoards(workspaceId);
  }, [workspaceId]);
  
  return <BoardList boards={boards} loading={loading} />;
}

// Presentational Component (Dumb)
// components/board/BoardList.jsx
export default function BoardList({ boards, loading }) {
  if (loading) return <LoadingSpinner />;
  
  return (
    <View className="p-4">
      {boards.map(board => (
        <BoardCard key={board.id} board={board} />
      ))}
    </View>
  );
}
```

#### 2. Custom Hooks

```javascript
// hooks/useTrello.js
export function useTrello() {
  const { token } = useAuth();
  
  const fetchWorkspaces = async () => {
    return await trelloService.getWorkspaces(token);
  };
  
  const createBoard = async (name, workspaceId) => {
    return await trelloService.createBoard(token, name, workspaceId);
  };
  
  return { fetchWorkspaces, createBoard };
}

// Usage in component
function HomeScreen() {
  const { fetchWorkspaces } = useTrello();
  const [workspaces, setWorkspaces] = useState([]);
  
  useEffect(() => {
    loadWorkspaces();
  }, []);
  
  async function loadWorkspaces() {
    const data = await fetchWorkspaces();
    setWorkspaces(data);
  }
}
```

## State Management

### AuthContext Structure

```javascript
// contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { getItem, setItem, removeItem } from '@/services/localStorageService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load auth state from storage on mount
  useEffect(() => {
    loadAuthState();
  }, []);
  
  async function loadAuthState() {
    const savedToken = await getItem('trello_token');
    const savedUser = await getItem('trello_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }
  
  async function login(authToken, userData) {
    await setItem('trello_token', authToken);
    await setItem('trello_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  }
  
  async function logout() {
    await removeItem('trello_token');
    await removeItem('trello_user');
    setToken(null);
    setUser(null);
  }
  
  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Local State vs Global State

**Use Local State (useState) for:**
- UI state (loading, errors, form inputs)
- Component-specific data
- Temporary data

**Use Global State (Context) for:**
- Authentication data
- User profile
- App-wide settings
- Shared data across screens

## Service Layer Architecture

### Generic Axios Service

```javascript
// services/axiosService.js
import axios from 'axios';

export class AxiosService {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });
  }
  
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `OAuth oauth_consumer_key="${API_KEY}", oauth_token="${token}"`;
    }
  }
  
  async get(url, params = {}) {
    const response = await this.client.get(url, { params });
    return response.data;
  }
  
  async post(url, data) {
    const response = await this.client.post(url, data);
    return response.data;
  }
  
  async put(url, data) {
    const response = await this.client.put(url, data);
    return response.data;
  }
  
  async delete(url) {
    const response = await this.client.delete(url);
    return response.data;
  }
}
```

### Trello API Service

```javascript
// services/trello.js
import { AxiosService } from './axiosService';
import { TRELLO_CONFIG } from '@/constants/config';

class TrelloService extends AxiosService {
  constructor() {
    super(TRELLO_CONFIG.BASE_URL);
  }
  
  async getWorkspaces(token) {
    this.setAuthToken(token);
    return await this.get('/members/me/organizations');
  }
  
  async getBoards(workspaceId, token) {
    this.setAuthToken(token);
    return await this.get(`/organizations/${workspaceId}/boards`);
  }
  
  async createBoard(token, name, workspaceId) {
    this.setAuthToken(token);
    return await this.post('/boards', {
      name,
      idOrganization: workspaceId,
      defaultLists: false,
    });
  }
}

export const trelloService = new TrelloService();
```

## Data Flow

### Fetch Data Flow

```
Component Mount
    ↓
useEffect Hook
    ↓
Call Service Function (trelloService.getBoards)
    ↓
AxiosService makes HTTP request
    ↓
Trello API returns data
    ↓
Service returns parsed data
    ↓
Component updates state (setBoards)
    ↓
UI re-renders with new data
```

### Create/Update Flow

```
User Action (Button Click)
    ↓
Event Handler (handleCreate)
    ↓
Show Loading State
    ↓
Call Service Function (trelloService.createBoard)
    ↓
AxiosService POST request
    ↓
Trello API creates resource
    ↓
Service returns new resource
    ↓
Update local state
    ↓
Hide Loading / Show Success
    ↓
Navigate or Refresh UI
```

## Error Handling

### Service Layer Error Handling

```javascript
// services/axiosService.js
async get(url, params = {}) {
  try {
    const response = await this.client.get(url, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Request failed',
    };
  }
}
```

### Component Error Handling

```javascript
function BoardsScreen() {
  const [error, setError] = useState(null);
  
  async function loadBoards() {
    setError(null);
    const result = await trelloService.getBoards(workspaceId, token);
    
    if (!result.success) {
      setError(result.error);
      return;
    }
    
    setBoards(result.data);
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={loadBoards} />;
  }
}
```

## Performance Optimization

### Memoization

```javascript
import { useMemo, useCallback } from 'react';

function BoardList({ boards }) {
  // Memoize expensive calculations
  const sortedBoards = useMemo(() => {
    return boards.sort((a, b) => a.name.localeCompare(b.name));
  }, [boards]);
  
  // Memoize callback functions
  const handleBoardClick = useCallback((boardId) => {
    router.push(`/board/${boardId}`);
  }, [router]);
  
  return sortedBoards.map(board => (
    <BoardCard key={board.id} board={board} onClick={handleBoardClick} />
  ));
}
```

### List Optimization

```javascript
import { FlatList } from 'react-native';

function BoardList({ boards }) {
  const renderItem = ({ item }) => <BoardCard board={item} />;
  
  return (
    <FlatList
      data={boards}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={21}
    />
  );
}
```

## Design Principles

1. **Separation of Concerns**: UI, logic, and data access are separated
2. **Single Responsibility**: Each component/service has one clear purpose
3. **Reusability**: Components and services can be reused across the app
4. **Scalability**: Easy to add new features without breaking existing code
5. **Testability**: Components and services can be tested independently