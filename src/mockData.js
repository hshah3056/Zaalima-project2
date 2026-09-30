/**
 * ES Module Mock Data for Client & Fallback State
 */

export const mockUsers = [
  {
    _id: "usr_001",
    name: "Alex Rivera",
    email: "alex.rivera@pulsework.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "product_owner",
    status: "online",
    preferences: { theme: "dark", notificationsEnabled: true }
  },
  {
    _id: "usr_002",
    name: "Sarah Chen",
    email: "sarah.chen@pulsework.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "scrum_master",
    status: "online",
    preferences: { theme: "dark", notificationsEnabled: true }
  },
  {
    _id: "usr_003",
    name: "Marcus Vance",
    email: "marcus.vance@pulsework.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "developer",
    status: "busy",
    preferences: { theme: "dark", notificationsEnabled: false }
  },
  {
    _id: "usr_004",
    name: "Elena Rostova",
    email: "elena.r@pulsework.io",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "designer",
    status: "away",
    preferences: { theme: "dark", notificationsEnabled: true }
  }
];

export const mockWorkspaces = [
  {
    _id: "ws_001",
    name: "Acme Corp Tech Hub",
    slug: "acme-tech",
    description: "Engineering, Product Strategy & AI Next-Gen Workspace",
    icon: "Briefcase",
    color: "#6366F1",
    owner: "usr_001",
    members: [
      { user: "usr_001", role: "owner", joinedAt: "2026-09-01T10:00:00Z" },
      { user: "usr_002", role: "admin", joinedAt: "2026-09-02T11:30:00Z" },
      { user: "usr_003", role: "member", joinedAt: "2026-09-05T09:15:00Z" },
      { user: "usr_004", role: "member", joinedAt: "2026-09-06T14:20:00Z" }
    ],
    boards: ["brd_001", "brd_002"],
    settings: { visibility: "team", allowGuestInvites: true }
  },
  {
    _id: "ws_002",
    name: "Design Studio & UX Labs",
    slug: "design-studio",
    description: "UI/UX component design systems, branding & prototypes",
    icon: "Layers",
    color: "#EC4899",
    owner: "usr_004",
    members: [
      { user: "usr_004", role: "owner", joinedAt: "2026-09-10T08:00:00Z" },
      { user: "usr_001", role: "member", joinedAt: "2026-09-12T10:00:00Z" }
    ],
    boards: ["brd_003"],
    settings: { visibility: "private", allowGuestInvites: false }
  }
];

export const mockBoards = [
  {
    _id: "brd_001",
    workspace: "ws_001",
    name: "PulseEngine Core Platform v2.0",
    key: "PULSE",
    description: "Core MERN real-time collaborative workspace sprint board",
    type: "kanban",
    icon: "Kanban",
    color: "#6366F1",
    isFavorite: true,
    members: ["usr_001", "usr_002", "usr_003", "usr_004"],
    lists: ["lst_101", "lst_102", "lst_103", "lst_104"]
  },
  {
    _id: "brd_002",
    workspace: "ws_001",
    name: "AI Copilot Integration",
    key: "AIC",
    description: "Automated ticket summary and smart task assignment",
    type: "scrum",
    icon: "Sparkles",
    color: "#10B981",
    isFavorite: false,
    members: ["usr_001", "usr_003"],
    lists: ["lst_201", "lst_202"]
  },
  {
    _id: "brd_003",
    workspace: "ws_002",
    name: "Design System & Tokens",
    key: "DS",
    description: "Glassmorphic components, dark themes, and animation specs",
    type: "kanban",
    icon: "Palette",
    color: "#EC4899",
    isFavorite: true,
    members: ["usr_004", "usr_001"],
    lists: ["lst_301", "lst_302"]
  }
];

export const mockLists = [
  {
    _id: "lst_101",
    board: "brd_001",
    title: "Backlog & Architecture",
    position: 0,
    color: "#64748B",
    wipLimit: 10,
    cards: ["crd_001", "crd_002"]
  },
  {
    _id: "lst_102",
    board: "brd_001",
    title: "In Progress (Day 1-2)",
    position: 1,
    color: "#3B82F6",
    wipLimit: 5,
    cards: ["crd_003", "crd_004"]
  },
  {
    _id: "lst_103",
    board: "brd_001",
    title: "Code Review / QA",
    position: 2,
    color: "#F59E0B",
    wipLimit: 3,
    cards: ["crd_005"]
  },
  {
    _id: "lst_104",
    board: "brd_001",
    title: "Done / Completed",
    position: 3,
    color: "#10B981",
    wipLimit: 0,
    cards: ["crd_006"]
  }
];

export const mockCards = [
  {
    _id: "crd_001",
    key: "PULSE-101",
    title: "Define MERN Data Models (Workspaces, Boards, Lists, Cards, Users)",
    description: "Establish comprehensive MongoDB Mongoose schema definitions, field validation rules, cross-collection references, and indexed keys for high-performance real-time query resolution.",
    list: "lst_102",
    board: "brd_001",
    workspace: "ws_001",
    position: 0,
    priority: "urgent",
    status: "in_progress",
    assignees: ["usr_001", "usr_003"],
    reporter: "usr_002",
    labels: [
      { name: "Day 1-2", color: "#6366F1" },
      { name: "Backend", color: "#EC4899" },
      { name: "Database", color: "#10B981" }
    ],
    dueDate: "2026-09-30T18:00:00Z",
    storyPoints: 5,
    subtasks: [
      { id: "st_1", title: "User Schema with roles and presence", completed: true },
      { id: "st_2", title: "Workspace Schema with multi-member permissions", completed: true },
      { id: "st_3", title: "Board & List relational structures", completed: true },
      { id: "st_4", title: "Card Schema with subtasks and activity logs", completed: true },
      { id: "st_5", title: "Seed initial demo datasets", completed: true }
    ],
    attachments: [
      { name: "MERN_ERD_Architecture.png", url: "#", type: "image/png" }
    ],
    comments: [
      {
        id: "cmt_1",
        user: "usr_002",
        content: "Data models must support real-time Socket updates for drag-and-drop actions across boards!",
        createdAt: "2026-09-28T11:00:00Z"
      }
    ],
    createdAt: "2026-09-28T09:00:00Z",
    updatedAt: "2026-09-28T14:00:00Z"
  },
  {
    _id: "crd_002",
    key: "PULSE-102",
    title: "Setup Express API Endpoints & CRUD Controllers",
    description: "Implement REST APIs for workspace switching, board loading, card status updates, list reordering, and real-time event broadcasting.",
    list: "lst_101",
    board: "brd_001",
    workspace: "ws_001",
    position: 1,
    priority: "high",
    status: "backlog",
    assignees: ["usr_003"],
    reporter: "usr_001",
    labels: [
      { name: "API", color: "#3B82F6" },
      { name: "Node.js", color: "#10B981" }
    ],
    dueDate: "2026-10-02T12:00:00Z",
    storyPoints: 8,
    subtasks: [
      { id: "st_201", title: "GET /api/workspaces route", completed: true },
      { id: "st_202", title: "POST /api/cards creation endpoint", completed: true },
      { id: "st_203", title: "PATCH /api/cards/:id/move card position API", completed: false }
    ],
    attachments: [],
    comments: [],
    createdAt: "2026-09-28T10:00:00Z",
    updatedAt: "2026-09-28T10:00:00Z"
  },
  {
    _id: "crd_003",
    key: "PULSE-103",
    title: "Build Modern Glassmorphic Workspace Dashboard UI",
    description: "Create high-end React interface featuring custom dark neon palette, smooth list switching, interactive card detail modals, presence badges, and live data model visualizer.",
    list: "lst_102",
    board: "brd_001",
    workspace: "ws_001",
    position: 1,
    priority: "high",
    status: "in_progress",
    assignees: ["usr_004", "usr_001"],
    reporter: "usr_001",
    labels: [
      { name: "React", color: "#06B6D4" },
      { name: "UI/UX", color: "#EC4899" }
    ],
    dueDate: "2026-10-01T15:00:00Z",
    storyPoints: 5,
    subtasks: [
      { id: "st_301", title: "Sidebar navigation & workspace selector", completed: true },
      { id: "st_302", title: "Kanban board view with list columns", completed: true },
      { id: "st_303", title: "Interactive Card Modal with comments & checklist", completed: true },
      { id: "st_304", title: "Day 1-2 Data Models Schema Inspector modal", completed: true }
    ],
    attachments: [],
    comments: [],
    createdAt: "2026-09-28T09:30:00Z",
    updatedAt: "2026-09-28T13:45:00Z"
  },
  {
    _id: "crd_004",
    key: "PULSE-104",
    title: "Configure Real-Time Websocket Event Dispatcher",
    description: "Set up bi-directional event stream for card moves, user active editing locks, and instant notifications across team members.",
    list: "lst_102",
    board: "brd_001",
    workspace: "ws_001",
    position: 2,
    priority: "medium",
    status: "in_progress",
    assignees: ["usr_002"],
    reporter: "usr_001",
    labels: [
      { name: "Realtime", color: "#F59E0B" }
    ],
    dueDate: "2026-10-03T18:00:00Z",
    storyPoints: 3,
    subtasks: [
      { id: "st_401", title: "Socket handler for card:moved", completed: true },
      { id: "st_402", title: "Presence heartbeat ping/pong", completed: true }
    ],
    attachments: [],
    comments: [],
    createdAt: "2026-09-28T11:00:00Z",
    updatedAt: "2026-09-28T12:00:00Z"
  },
  {
    _id: "crd_005",
    key: "PULSE-105",
    title: "Role-Based Access Control (RBAC) & Workspace Permissions",
    description: "Verify that Owners, Admins, Members, and Guests have granular edit/delete rights on Cards and Board configurations.",
    list: "lst_103",
    board: "brd_001",
    workspace: "ws_001",
    position: 0,
    priority: "medium",
    status: "in_review",
    assignees: ["usr_002"],
    reporter: "usr_001",
    labels: [
      { name: "Security", color: "#EF4444" }
    ],
    dueDate: "2026-10-04T12:00:00Z",
    storyPoints: 3,
    subtasks: [
      { id: "st_501", title: "Middleware for Workspace Ownership check", completed: true }
    ],
    attachments: [],
    comments: [],
    createdAt: "2026-09-27T16:00:00Z",
    updatedAt: "2026-09-28T09:00:00Z"
  },
  {
    _id: "crd_006",
    key: "PULSE-106",
    title: "Project Architecture & Day 1-2 Specification Alignment",
    description: "Formalize MERN stack data model documents for Workspaces, Boards, Lists, Cards, and Users.",
    list: "lst_104",
    board: "brd_001",
    workspace: "ws_001",
    position: 0,
    priority: "low",
    status: "done",
    assignees: ["usr_001"],
    reporter: "usr_001",
    labels: [
      { name: "Planning", color: "#8B5CF6" }
    ],
    dueDate: "2026-09-28T10:00:00Z",
    storyPoints: 2,
    subtasks: [
      { id: "st_601", title: "Write MongoDB schema specs", completed: true },
      { id: "st_602", title: "Validate relationships and key constraints", completed: true }
    ],
    attachments: [],
    comments: [],
    createdAt: "2026-09-26T10:00:00Z",
    updatedAt: "2026-09-28T08:00:00Z"
  }
];

export const mockActivities = [
  {
    _id: "act_001",
    workspace: "ws_001",
    board: "brd_001",
    card: "crd_001",
    user: "usr_001",
    action: "created_card",
    details: { cardTitle: "Define MERN Data Models" },
    createdAt: "2026-09-28T09:00:00Z"
  }
];
