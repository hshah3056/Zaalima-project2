const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { UserSchemaDefinition } = require("./models/User");
const { WorkspaceSchemaDefinition } = require("./models/Workspace");
const { BoardSchemaDefinition } = require("./models/Board");
const { ListSchemaDefinition } = require("./models/List");
const { CardSchemaDefinition } = require("./models/Card");
const { ActivitySchemaDefinition } = require("./models/Activity");
const seed = require("./seed/seedData");

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Wrap Express with HTTP Server
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// 2. Attach Socket.io with updated CORS Configuration
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));

// In-memory data store for initial demonstration & API execution
let store = {
  users: [...seed.mockUsers],
  workspaces: [...seed.mockWorkspaces],
  boards: [...seed.mockBoards],
  lists: [...seed.mockLists],
  cards: [...seed.mockCards],
  activities: [...seed.mockActivities],
};

// --------------------------------------------------------------------------
// Milestone 3 (Day 1-2 & Day 3-5): Socket.io Real-Time Connection & Event Engine
// --------------------------------------------------------------------------
const activeConnections = new Map(); // socketId -> { userId, userName, boardId, connectedAt, lastPing }

io.on("connection", (socket) => {
  console.log(`🔌 [Socket Connected] ID: ${socket.id}`);

  // Safe registration of logged-in user onto the socket session
  socket.on("register_user", ({ userId, userName }) => {
    const existing = activeConnections.get(socket.id) || {};
    activeConnections.set(socket.id, {
      ...existing,
      userId,
      userName,
      connectedAt: existing.connectedAt || new Date(),
    });
    console.log(
      `👤 [User Registered] ${userName || "User"} (${userId || "guest"}) on socket ${socket.id}`,
    );
  });

  // Safe room joining for board real-time scoping
  socket.on("join_board", ({ boardId, userId, userName }) => {
    if (!boardId) return;

    // Leave existing board room if switching
    const current = activeConnections.get(socket.id) || {};
    if (current.boardId && current.boardId !== boardId) {
      socket.leave(current.boardId);
      socket.to(current.boardId).emit("user_left_board", {
        socketId: socket.id,
        userId: current.userId,
        userName: current.userName,
        timestamp: new Date().toISOString(),
      });
    }

    socket.join(boardId);
    activeConnections.set(socket.id, { ...current, boardId, userId, userName });

    console.log(
      `📋 [Board Joined] Socket ${socket.id} (${userName || "User"}) joined board: ${boardId}`,
    );

    // Get active peers currently connected to this board room
    const peersInRoom = [];
    for (const [sId, info] of activeConnections.entries()) {
      if (info.boardId === boardId && sId !== socket.id) {
        peersInRoom.push({
          socketId: sId,
          userId: info.userId,
          userName: info.userName,
        });
      }
    }

    // Emit active peers roster back to joining socket
    socket.emit("board_peers", { boardId, peers: peersInRoom });

    // Notify other peers viewing this specific board
    socket.to(boardId).emit("user_joined_board", {
      socketId: socket.id,
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });
  });

  // Explicit leave room handler
  socket.on("leave_board", ({ boardId }) => {
    if (!boardId) return;

    socket.leave(boardId);
    const user = activeConnections.get(socket.id);
    if (user) {
      delete user.boardId;
      activeConnections.set(socket.id, user);
    }

    console.log(`🚪 [Board Left] Socket ${socket.id} left board: ${boardId}`);
    socket.to(boardId).emit("user_left_board", {
      socketId: socket.id,
      userId: user?.userId,
      userName: user?.userName,
      timestamp: new Date().toISOString(),
    });
  });

  // ------------------------------------------------------------------------
  // Day 3-5: Real-Time Event Handlers (Broadcasting to Board Room)
  // ------------------------------------------------------------------------

  // 1. Broadcast Card Movement
  socket.on("card_moved", (data) => {
    if (!data.boardId) return;
    console.log(`🔄 [Socket Event] card_moved on board ${data.boardId}:`, data.cardId);
    socket.to(data.boardId).emit("card_moved", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Broadcast Card Creation
  socket.on("card_created", (data) => {
    if (!data.boardId) return;
    console.log(`➕ [Socket Event] card_created on board ${data.boardId}:`, data.card?._id || data.card?.title);
    socket.to(data.boardId).emit("card_created", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // 3. Broadcast Card Update
  socket.on("card_updated", (data) => {
    if (!data.boardId) return;
    console.log(`✏️ [Socket Event] card_updated on board ${data.boardId}:`, data.cardId || data.card?._id);
    socket.to(data.boardId).emit("card_updated", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // 4. Broadcast Card Deletion
  socket.on("card_deleted", (data) => {
    if (!data.boardId) return;
    console.log(`🗑️ [Socket Event] card_deleted on board ${data.boardId}:`, data.cardId);
    socket.to(data.boardId).emit("card_deleted", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // 5. Broadcast List Creation
  socket.on("list_created", (data) => {
    if (!data.boardId) return;
    socket.to(data.boardId).emit("list_created", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // 6. Broadcast List Update
  socket.on("list_updated", (data) => {
    if (!data.boardId) return;
    socket.to(data.boardId).emit("list_updated", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // 7. Broadcast List Reorder
  socket.on("list_reordered", (data) => {
    if (!data.boardId) return;
    socket.to(data.boardId).emit("list_reordered", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // 8. Broadcast List Deletion
  socket.on("list_deleted", (data) => {
    if (!data.boardId) return;
    socket.to(data.boardId).emit("list_deleted", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Heartbeat ping to keep track of connection responsiveness
  socket.on("heartbeat", () => {
    const user = activeConnections.get(socket.id);
    if (user) {
      user.lastPing = Date.now();
    }
  });

  // Safe disconnection cleanup handler
  socket.on("disconnect", (reason) => {
    const user = activeConnections.get(socket.id);

    if (user && user.boardId) {
      socket.to(user.boardId).emit("user_disconnected", {
        socketId: socket.id,
        userId: user.userId,
        userName: user.userName,
        reason,
        timestamp: new Date().toISOString(),
      });
    }

    activeConnections.delete(socket.id);
    console.log(
      `❌ [Socket Disconnected] ID: ${socket.id} | Reason: ${reason}`,
    );
  });

  socket.on("error", (err) => {
    console.error(`⚠️ [Socket Error] ID ${socket.id}:`, err);
  });
});

// Expose io instance to Express request/route handlers
app.set("io", io);

// --------------------------------------------------------------------------
// 1. Schema Inspector API Endpoint for Day 1-2 Review
// --------------------------------------------------------------------------
app.get("/api/data-models", (req, res) => {
  res.json({
    status: "success",
    phase: "Day 1–2: Data Models Definition",
    stack: "MERN Stack (MongoDB, Express, React, Node.js)",
    models: {
      User: UserSchemaDefinition,
      Workspace: WorkspaceSchemaDefinition,
      Board: BoardSchemaDefinition,
      List: ListSchemaDefinition,
      Card: CardSchemaDefinition,
      Activity: ActivitySchemaDefinition,
    },
  });
});

// --------------------------------------------------------------------------
// 2. Auth & Users Endpoints
// --------------------------------------------------------------------------
app.get("/api/users", (req, res) => {
  res.json({ status: "success", data: store.users });
});

app.post("/api/users", (req, res) => {
  const { name, email, accountId, password, role, avatar } = req.body;
  if (!name || !email)
    return res
      .status(400)
      .json({ status: "error", message: "Name and Email are required" });

  const existing = store.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (existing) {
    return res
      .status(200)
      .json({ status: "success", data: existing, isExisting: true });
  }

  const generatedAccountId =
    accountId ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, "") +
      Math.floor(Math.random() * 899 + 100);
  const newUser = {
    _id: `usr_${Date.now()}`,
    accountId: generatedAccountId,
    password: password || "password123",
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role || "developer",
    avatar:
      avatar ||
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    status: "online",
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);

  // Auto-add new user to all default workspaces
  store.workspaces.forEach((ws) => {
    if (!ws.members.some((m) => m.user === newUser._id)) {
      ws.members.push({
        user: newUser._id,
        role: "member",
        joinedAt: new Date().toISOString(),
      });
    }
  });

  res.status(201).json({ status: "success", data: newUser });
});

app.post("/api/auth/login", (req, res) => {
  const { userId, accountId, email, password } = req.body;

  let user;
  if (userId) {
    user = store.users.find((u) => u._id === userId);
  } else {
    const term = (accountId || email || "").trim().toLowerCase();
    user = store.users.find(
      (u) =>
        (u._id && u._id.toLowerCase() === term) ||
        (u.accountId && u.accountId.toLowerCase() === term) ||
        (u.email && u.email.toLowerCase() === term),
    );
  }

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "Invalid Account ID or Email address.",
    });
  }

  if (password && user.password && password !== user.password) {
    return res.status(401).json({
      status: "error",
      message: "Incorrect Password. Please check your credentials.",
    });
  }

  user.status = "online";
  res.json({ status: "success", data: user });
});

app.post("/api/auth/logout", (req, res) => {
  const { userId } = req.body;
  const user = store.users.find((u) => u._id === userId);
  if (user) {
    user.status = "offline";
  }
  res.json({ status: "success", message: "Logged out successfully" });
});

app.get("/api/users/:id/dashboard", (req, res) => {
  const userId = req.params.id;
  const user = store.users.find((u) => u._id === userId);
  if (!user)
    return res.status(404).json({ status: "error", message: "User not found" });

  const assignedCards = store.cards
    .filter((c) => c.assignees && c.assignees.includes(userId))
    .map((card) => {
      const board = store.boards.find((b) => b._id === card.board);
      const list = store.lists.find((l) => l._id === card.list);
      const workspace = store.workspaces.find((w) => w._id === card.workspace);
      return {
        ...card,
        boardName: board?.name,
        listTitle: list?.title,
        workspaceName: workspace?.name,
      };
    });

  const createdCards = store.cards.filter((c) => c.reporter === userId);
  const userWorkspaces = store.workspaces.filter(
    (w) => w.members && w.members.some((m) => m.user === userId),
  );
  const userActivities = store.activities.filter((a) => a.user === userId);

  res.json({
    status: "success",
    data: {
      user,
      assignedCards,
      createdCards,
      userWorkspaces,
      userActivities,
    },
  });
});

// --------------------------------------------------------------------------
// 3. Workspaces Endpoints
// --------------------------------------------------------------------------
app.get("/api/workspaces", (req, res) => {
  res.json({ status: "success", data: store.workspaces });
});

app.get("/api/workspaces/:id", (req, res) => {
  const workspace = store.workspaces.find((w) => w._id === req.params.id);
  if (!workspace)
    return res
      .status(404)
      .json({ status: "error", message: "Workspace not found" });

  const workspaceBoards = store.boards.filter(
    (b) => b.workspace === workspace._id,
  );
  const populatedMembers = workspace.members.map((m) => {
    const userDetail = store.users.find((u) => u._id === m.user);
    return { ...m, userDetail };
  });

  res.json({
    status: "success",
    data: {
      ...workspace,
      boards: workspaceBoards,
      members: populatedMembers,
    },
  });
});

app.post("/api/workspaces", (req, res) => {
  const { name, description, icon, color, ownerId } = req.body;
  if (!name)
    return res
      .status(400)
      .json({ status: "error", message: "Name is required" });

  const newWorkspace = {
    _id: `ws_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: description || "",
    icon: icon || "Briefcase",
    color: color || "#6366F1",
    owner: ownerId || store.users[0]._id,
    members: [
      {
        user: ownerId || store.users[0]._id,
        role: "owner",
        joinedAt: new Date().toISOString(),
      },
    ],
    boards: [],
    settings: { visibility: "team", allowGuestInvites: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.workspaces.push(newWorkspace);
  res.status(201).json({ status: "success", data: newWorkspace });
});

app.put("/api/workspaces/:id", (req, res) => {
  const workspace = store.workspaces.find((w) => w._id === req.params.id);
  if (!workspace)
    return res
      .status(404)
      .json({ status: "error", message: "Workspace not found" });

  const { name, description, icon, color, settings } = req.body;
  if (name) workspace.name = name.trim();
  if (description !== undefined) workspace.description = description.trim();
  if (icon) workspace.icon = icon;
  if (color) workspace.color = color;
  if (settings) workspace.settings = { ...workspace.settings, ...settings };

  workspace.updatedAt = new Date().toISOString();
  res.json({ status: "success", data: workspace });
});

app.post("/api/workspaces/:id/invitations", (req, res) => {
  const workspace = store.workspaces.find((w) => w._id === req.params.id);
  if (!workspace)
    return res
      .status(404)
      .json({ status: "error", message: "Workspace not found" });

  const { email, role } = req.body;
  if (!email)
    return res.status(400).json({
      status: "error",
      message: "Email is required for workspace invitation",
    });

  let user = store.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!user) {
    user = {
      _id: `usr_${Date.now()}`,
      accountId:
        email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "") + "123",
      password: "password123",
      name: email
        .split("@")[0]
        .replace(".", " ")
        .replace(/^./, (c) => c.toUpperCase()),
      email: email.trim().toLowerCase(),
      role: role || "member",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      status: "offline",
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  }

  const existingMember = workspace.members.find((m) => m.user === user._id);
  if (!existingMember) {
    workspace.members.push({
      user: user._id,
      role: role || "member",
      joinedAt: new Date().toISOString(),
    });
  }

  res.status(201).json({
    status: "success",
    message: "Invitation sent and member added to workspace",
    data: { workspace, user },
  });
});

// --------------------------------------------------------------------------
// 4. Boards Endpoints
// --------------------------------------------------------------------------
app.get("/api/boards/:id", (req, res) => {
  const board = store.boards.find((b) => b._id === req.params.id);
  if (!board)
    return res
      .status(404)
      .json({ status: "error", message: "Board not found" });

  const lists = store.lists
    .filter((l) => l.board === board._id)
    .sort((a, b) => a.position - b.position)
    .map((list) => {
      const listCards = store.cards
        .filter((c) => c.list === list._id)
        .sort((a, b) => a.position - b.position)
        .map((card) => {
          const assignees = card.assignees
            .map((aid) => store.users.find((u) => u._id === aid))
            .filter(Boolean);
          const reporter = store.users.find((u) => u._id === card.reporter);
          return { ...card, assignees, reporter };
        });
      return { ...list, cards: listCards };
    });

  const boardMembers = board.members
    .map((mid) => store.users.find((u) => u._id === mid))
    .filter(Boolean);

  res.json({
    status: "success",
    data: {
      ...board,
      lists,
      members: boardMembers,
    },
  });
});

app.post("/api/boards", (req, res) => {
  const { workspaceId, name, key, description, type, color, icon } = req.body;
  if (!workspaceId || !name)
    return res
      .status(400)
      .json({ status: "error", message: "Workspace ID and Name are required" });

  const boardId = `brd_${Date.now()}`;
  const generatedKey = key ? key.toUpperCase() : name.slice(0, 4).toUpperCase();

  const newBoard = {
    _id: boardId,
    workspace: workspaceId,
    name,
    key: generatedKey,
    description: description || "",
    type: type || "kanban",
    icon: icon || "Kanban",
    color: color || "#8B5CF6",
    isFavorite: false,
    members: store.users.map((u) => u._id),
    lists: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultListNames = ["Backlog", "In Progress", "In Review", "Done"];
  const createdListIds = defaultListNames.map((title, idx) => {
    const listId = `lst_${Date.now()}_${idx}`;
    store.lists.push({
      _id: listId,
      board: boardId,
      title,
      position: idx,
      color: idx === 3 ? "#10B981" : "#3B82F6",
      wipLimit: idx === 1 ? 5 : 0,
      cards: [],
      createdAt: new Date().toISOString(),
    });
    return listId;
  });

  newBoard.lists = createdListIds;
  store.boards.push(newBoard);

  const ws = store.workspaces.find((w) => w._id === workspaceId);
  if (ws) ws.boards.push(boardId);

  res.status(201).json({ status: "success", data: newBoard });
});

// --------------------------------------------------------------------------
// 5. Lists Endpoints (CRUD & Reorder)
// --------------------------------------------------------------------------
app.get("/api/lists", (req, res) => {
  const { boardId } = req.query;
  let resultLists = store.lists;

  if (boardId) {
    resultLists = resultLists.filter((l) => l.board === boardId);
  }

  const populatedLists = resultLists
    .sort((a, b) => a.position - b.position)
    .map((list) => {
      const listCards = store.cards
        .filter((c) => c.list === list._id)
        .sort((a, b) => a.position - b.position)
        .map((card) => {
          const assignees = (card.assignees || [])
            .map((aid) => store.users.find((u) => u._id === aid))
            .filter(Boolean);
          const reporter = store.users.find((u) => u._id === card.reporter);
          return { ...card, assignees, reporter };
        });
      return { ...list, cards: listCards };
    });

  res.json({ status: "success", data: populatedLists });
});

app.get("/api/lists/:id", (req, res) => {
  const list = store.lists.find((l) => l._id === req.params.id);
  if (!list)
    return res.status(404).json({ status: "error", message: "List not found" });

  const listCards = store.cards
    .filter((c) => c.list === list._id)
    .sort((a, b) => a.position - b.position)
    .map((card) => {
      const assignees = (card.assignees || [])
        .map((aid) => store.users.find((u) => u._id === aid))
        .filter(Boolean);
      const reporter = store.users.find((u) => u._id === card.reporter);
      return { ...card, assignees, reporter };
    });

  res.json({ status: "success", data: { ...list, cards: listCards } });
});

app.post("/api/lists", (req, res) => {
  const { boardId, title, color, wipLimit } = req.body;
  if (!boardId || !title)
    return res
      .status(400)
      .json({ status: "error", message: "Board ID and Title are required" });

  const board = store.boards.find((b) => b._id === boardId);
  if (!board)
    return res
      .status(404)
      .json({ status: "error", message: "Board not found" });

  const existingLists = store.lists.filter((l) => l.board === boardId);
  const newList = {
    _id: `lst_${Date.now()}`,
    board: boardId,
    title: title.trim(),
    position: existingLists.length,
    color: color || "#3B82F6",
    wipLimit: Number(wipLimit) || 0,
    cards: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.lists.push(newList);
  board.lists.push(newList._id);

  // Broadcast list creation to board room
  io.to(boardId).emit("list_created", { boardId, list: newList });

  res.status(201).json({ status: "success", data: newList });
});

app.put("/api/lists/reorder", (req, res) => {
  const { boardId, orderedListIds } = req.body;
  if (!boardId || !Array.isArray(orderedListIds)) {
    return res.status(400).json({
      status: "error",
      message: "boardId and orderedListIds array are required",
    });
  }

  orderedListIds.forEach((listId, idx) => {
    const list = store.lists.find(
      (l) => l._id === listId && l.board === boardId,
    );
    if (list) {
      list.position = idx;
      list.updatedAt = new Date().toISOString();
    }
  });

  const updatedBoardLists = store.lists
    .filter((l) => l.board === boardId)
    .sort((a, b) => a.position - b.position);

  // Broadcast list reorder to board room
  io.to(boardId).emit("list_reordered", { boardId, orderedListIds, lists: updatedBoardLists });

  res.json({ status: "success", data: updatedBoardLists });
});

const handleUpdateList = (req, res) => {
  const listIndex = store.lists.findIndex((l) => l._id === req.params.id);
  if (listIndex === -1)
    return res.status(404).json({ status: "error", message: "List not found" });

  const existingList = store.lists[listIndex];
  const { title, color, wipLimit, position } = req.body;

  const updatedList = {
    ...existingList,
    ...(title !== undefined && { title: title.trim() }),
    ...(color !== undefined && { color }),
    ...(wipLimit !== undefined && { wipLimit: Number(wipLimit) }),
    ...(position !== undefined && { position: Number(position) }),
    updatedAt: new Date().toISOString(),
  };

  store.lists[listIndex] = updatedList;

  // Broadcast list update to board room
  if (updatedList.board) {
    io.to(updatedList.board).emit("list_updated", { boardId: updatedList.board, list: updatedList });
  }

  res.json({ status: "success", data: updatedList });
};

app.put("/api/lists/:id", handleUpdateList);
app.patch("/api/lists/:id", handleUpdateList);

app.delete("/api/lists/:id", (req, res) => {
  const listIndex = store.lists.findIndex((l) => l._id === req.params.id);
  if (listIndex === -1)
    return res.status(404).json({ status: "error", message: "List not found" });

  const deletedList = store.lists[listIndex];
  store.lists.splice(listIndex, 1);

  const parentBoard = store.boards.find((b) => b._id === deletedList.board);
  if (parentBoard && parentBoard.lists) {
    parentBoard.lists = parentBoard.lists.filter(
      (lid) => lid !== deletedList._id,
    );
  }

  store.cards = store.cards.filter((c) => c.list !== deletedList._id);

  // Broadcast list deletion to board room
  if (deletedList.board) {
    io.to(deletedList.board).emit("list_deleted", { boardId: deletedList.board, listId: deletedList._id });
  }

  res.json({
    status: "success",
    message: "List and associated cards deleted successfully",
    data: { _id: req.params.id },
  });
});

// --------------------------------------------------------------------------
// 6. Cards Endpoints & Subtasks/Comments Operations
// --------------------------------------------------------------------------
app.get("/api/cards", (req, res) => {
  const { boardId, listId, workspaceId, assignee, priority, status, search } =
    req.query;
  let resultCards = store.cards;

  if (boardId) resultCards = resultCards.filter((c) => c.board === boardId);
  if (listId) resultCards = resultCards.filter((c) => c.list === listId);
  if (workspaceId)
    resultCards = resultCards.filter((c) => c.workspace === workspaceId);
  if (priority)
    resultCards = resultCards.filter((c) => c.priority === priority);
  if (status) resultCards = resultCards.filter((c) => c.status === status);
  if (assignee)
    resultCards = resultCards.filter(
      (c) => c.assignees && c.assignees.includes(assignee),
    );
  if (search) {
    const q = search.toLowerCase();
    resultCards = resultCards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.key.toLowerCase().includes(q),
    );
  }

  const populatedCards = resultCards.map((card) => {
    const assignees = (card.assignees || [])
      .map((aid) => store.users.find((u) => u._id === aid))
      .filter(Boolean);
    const reporter = store.users.find((u) => u._id === card.reporter);
    const board = store.boards.find((b) => b._id === card.board);
    const list = store.lists.find((l) => l._id === card.list);
    return {
      ...card,
      assignees,
      reporter,
      boardName: board?.name,
      listTitle: list?.title,
    };
  });

  res.json({ status: "success", data: populatedCards });
});

app.get("/api/cards/:id", (req, res) => {
  const card = store.cards.find((c) => c._id === req.params.id);
  if (!card)
    return res.status(404).json({ status: "error", message: "Card not found" });

  const assignees = (card.assignees || [])
    .map((aid) => store.users.find((u) => u._id === aid))
    .filter(Boolean);
  const reporter = store.users.find((u) => u._id === card.reporter);
  const board = store.boards.find((b) => b._id === card.board);
  const list = store.lists.find((l) => l._id === card.list);
  const workspace = store.workspaces.find((w) => w._id === card.workspace);

  res.json({
    status: "success",
    data: {
      ...card,
      assignees,
      reporter,
      boardDetail: board,
      listDetail: list,
      workspaceDetail: workspace,
    },
  });
});

app.post("/api/cards", (req, res) => {
  const {
    listId,
    boardId,
    workspaceId,
    title,
    description,
    priority,
    assignees,
    storyPoints,
    dueDate,
    labels,
    subtasks,
    reporter,
  } = req.body;
  if (!title || !listId || !boardId)
    return res.status(400).json({
      status: "error",
      message: "Title, List ID, and Board ID are required",
    });

  const board = store.boards.find((b) => b._id === boardId);
  const cardCount = store.cards.length + 101;
  const cardKey = board ? `${board.key}-${cardCount}` : `PULSE-${cardCount}`;
  const listCards = store.cards.filter((c) => c.list === listId);

  const newCard = {
    _id: `crd_${Date.now()}`,
    key: cardKey,
    title: title.trim(),
    description: description || "",
    list: listId,
    board: boardId,
    workspace: workspaceId || store.workspaces[0]._id,
    position: listCards.length,
    priority: priority || "medium",
    status: "todo",
    assignees: assignees || [store.users[0]._id],
    reporter: reporter || store.users[0]._id,
    labels: labels || [{ name: "New Task", color: "#3B82F6" }],
    dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
    storyPoints: Number(storyPoints) || 1,
    subtasks: subtasks || [],
    attachments: [],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.cards.push(newCard);
  const targetList = store.lists.find((l) => l._id === listId);
  if (targetList) targetList.cards.push(newCard._id);

  store.activities.unshift({
    _id: `act_${Date.now()}`,
    workspace: newCard.workspace,
    board: boardId,
    card: newCard._id,
    user: reporter || store.users[0]._id,
    action: "created_card",
    details: { cardTitle: title },
    createdAt: new Date().toISOString(),
  });

  // Broadcast card creation to board room
  io.to(boardId).emit("card_created", { boardId, listId, card: newCard });

  res.status(201).json({ status: "success", data: newCard });
});

const handleUpdateCard = (req, res) => {
  const cardIndex = store.cards.findIndex((c) => c._id === req.params.id);
  if (cardIndex === -1)
    return res.status(404).json({ status: "error", message: "Card not found" });

  const existingCard = store.cards[cardIndex];
  const {
    title,
    description,
    priority,
    listId,
    position,
    assignees,
    storyPoints,
    dueDate,
    status,
    labels,
    subtasks,
    comments,
  } = req.body;

  let moved = false;
  if (listId && listId !== existingCard.list) {
    const oldList = store.lists.find((l) => l._id === existingCard.list);
    if (oldList)
      oldList.cards = oldList.cards.filter((cid) => cid !== existingCard._id);
    const newList = store.lists.find((l) => l._id === listId);
    if (newList) newList.cards.push(existingCard._id);
    moved = true;
  }

  const updatedCard = {
    ...existingCard,
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description }),
    ...(priority !== undefined && { priority }),
    ...(listId !== undefined && { list: listId }),
    ...(position !== undefined && { position: Number(position) }),
    ...(assignees !== undefined && { assignees }),
    ...(storyPoints !== undefined && { storyPoints: Number(storyPoints) }),
    ...(dueDate !== undefined && { dueDate }),
    ...(status !== undefined && { status }),
    ...(labels !== undefined && { labels }),
    ...(subtasks !== undefined && { subtasks }),
    ...(comments !== undefined && { comments }),
    updatedAt: new Date().toISOString(),
  };

  store.cards[cardIndex] = updatedCard;

  if (moved) {
    store.activities.unshift({
      _id: `act_${Date.now()}`,
      workspace: updatedCard.workspace,
      board: updatedCard.board,
      card: updatedCard._id,
      user: store.users[0]._id,
      action: "moved_card",
      details: { cardTitle: updatedCard.title },
      createdAt: new Date().toISOString(),
    });
  }

  // Broadcast card update to board room
  if (updatedCard.board) {
    io.to(updatedCard.board).emit("card_updated", {
      boardId: updatedCard.board,
      cardId: updatedCard._id,
      card: updatedCard,
      moved,
    });
  }

  res.json({ status: "success", data: updatedCard });
};

app.put("/api/cards/:id", handleUpdateCard);
app.patch("/api/cards/:id", handleUpdateCard);

app.delete("/api/cards/:id", (req, res) => {
  const cardIndex = store.cards.findIndex((c) => c._id === req.params.id);
  if (cardIndex === -1)
    return res.status(404).json({ status: "error", message: "Card not found" });

  const deletedCard = store.cards[cardIndex];
  store.cards.splice(cardIndex, 1);

  const parentList = store.lists.find((l) => l._id === deletedCard.list);
  if (parentList && parentList.cards) {
    parentList.cards = parentList.cards.filter(
      (cid) => cid !== deletedCard._id,
    );
  }

  store.activities.unshift({
    _id: `act_${Date.now()}`,
    workspace: deletedCard.workspace,
    board: deletedCard.board,
    card: deletedCard._id,
    user: store.users[0]._id,
    action: "deleted_card",
    details: { cardTitle: deletedCard.title },
    createdAt: new Date().toISOString(),
  });

  // Broadcast card deletion to board room
  if (deletedCard.board) {
    io.to(deletedCard.board).emit("card_deleted", {
      boardId: deletedCard.board,
      cardId: deletedCard._id,
      listId: deletedCard.list,
    });
  }

  res.json({
    status: "success",
    message: "Card deleted successfully",
    data: { _id: req.params.id },
  });
});

const handleMoveCardRoute = (req, res) => {
  const { targetListId, position } = req.body;
  const card = store.cards.find((c) => c._id === req.params.id);
  if (!card)
    return res.status(404).json({ status: "error", message: "Card not found" });

  if (targetListId && targetListId !== card.list) {
    const oldList = store.lists.find((l) => l._id === card.list);
    if (oldList)
      oldList.cards = oldList.cards.filter((cid) => cid !== card._id);

    const newList = store.lists.find((l) => l._id === targetListId);
    if (newList) newList.cards.push(card._id);

    card.list = targetListId;
  }

  if (position !== undefined) {
    card.position = Number(position);
  }

  card.updatedAt = new Date().toISOString();

  // Broadcast card movement to board room
  if (card.board) {
    io.to(card.board).emit("card_moved", {
      boardId: card.board,
      cardId: card._id,
      targetListId,
      position: card.position,
      card,
    });
  }

  res.json({ status: "success", data: card });
};

app.put("/api/cards/:id/move", handleMoveCardRoute);
app.patch("/api/cards/:id/move", handleMoveCardRoute);

// --------------------------------------------------------------------------
// Subtasks & Comments Endpoints
// --------------------------------------------------------------------------
app.post("/api/cards/:id/subtasks", (req, res) => {
  const { title } = req.body;
  if (!title)
    return res
      .status(400)
      .json({ status: "error", message: "Subtask title is required" });

  const card = store.cards.find((c) => c._id === req.params.id);
  if (!card)
    return res.status(404).json({ status: "error", message: "Card not found" });

  const newSubtask = {
    id: `st_${Date.now()}`,
    title: title.trim(),
    completed: false,
  };

  card.subtasks = card.subtasks || [];
  card.subtasks.push(newSubtask);
  card.updatedAt = new Date().toISOString();

  res.status(201).json({ status: "success", data: newSubtask, card });
});

app.put("/api/cards/:id/subtasks/:subtaskId", (req, res) => {
  const card = store.cards.find((c) => c._id === req.params.id);
  if (!card)
    return res.status(404).json({ status: "error", message: "Card not found" });

  const subtask = (card.subtasks || []).find(
    (s) => s.id === req.params.subtaskId,
  );
  if (!subtask)
    return res
      .status(404)
      .json({ status: "error", message: "Subtask not found" });

  const { title, completed } = req.body;
  if (title !== undefined) subtask.title = title.trim();
  if (completed !== undefined) subtask.completed = Boolean(completed);

  card.updatedAt = new Date().toISOString();
  res.json({ status: "success", data: subtask, card });
});

app.delete("/api/cards/:id/subtasks/:subtaskId", (req, res) => {
  const card = store.cards.find((c) => c._id === req.params.id);
  if (!card)
    return res.status(404).json({ status: "error", message: "Card not found" });

  card.subtasks = (card.subtasks || []).filter(
    (s) => s.id !== req.params.subtaskId,
  );
  card.updatedAt = new Date().toISOString();

  res.json({ status: "success", message: "Subtask removed", card });
});

app.post("/api/cards/:id/comments", (req, res) => {
  const { userId, content } = req.body;
  if (!content)
    return res
      .status(400)
      .json({ status: "error", message: "Comment content is required" });

  const card = store.cards.find((c) => c._id === req.params.id);
  if (!card)
    return res.status(404).json({ status: "error", message: "Card not found" });

  const newComment = {
    id: `cmt_${Date.now()}`,
    user: userId || store.users[0]._id,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  card.comments = card.comments || [];
  card.comments.push(newComment);
  card.updatedAt = new Date().toISOString();

  res.status(201).json({ status: "success", data: newComment, card });
});

app.delete("/api/cards/:id/comments/:commentId", (req, res) => {
  const card = store.cards.find((c) => c._id === req.params.id);
  if (!card)
    return res.status(404).json({ status: "error", message: "Card not found" });

  card.comments = (card.comments || []).filter(
    (c) => c.id !== req.params.commentId,
  );
  card.updatedAt = new Date().toISOString();

  // Broadcast card update for subtasks/comments
  if (card.board) {
    io.to(card.board).emit("card_updated", {
      boardId: card.board,
      cardId: card._id,
      card,
    });
  }

  res.json({ status: "success", message: "Comment removed", card });
});

// --------------------------------------------------------------------------
// 7. Seed Reset API
// --------------------------------------------------------------------------
app.post("/api/seed/reset", (req, res) => {
  store = {
    users: JSON.parse(JSON.stringify(seed.mockUsers)),
    workspaces: JSON.parse(JSON.stringify(seed.mockWorkspaces)),
    boards: JSON.parse(JSON.stringify(seed.mockBoards)),
    lists: JSON.parse(JSON.stringify(seed.mockLists)),
    cards: JSON.parse(JSON.stringify(seed.mockCards)),
    activities: JSON.parse(JSON.stringify(seed.mockActivities)),
  };
  res.json({
    status: "success",
    message: "Store reset to initial seed state.",
  });
});

// --------------------------------------------------------------------------
// Server Startup using HTTP + Socket.io Wrapper
// --------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log(
    `⚡ [PulseWork Backend + Socket.io] Active and listening on http://localhost:${PORT}`,
  );
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(
      `⚡ [PulseWork Backend] Port ${PORT} is already in use. Please terminate existing process or use another port.`,
    );
  } else {
    console.error("Server error:", err);
  }
});
