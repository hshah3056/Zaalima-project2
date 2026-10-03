const express = require('express');
const cors = require('cors');
const { UserSchemaDefinition } = require('./models/User');
const { WorkspaceSchemaDefinition } = require('./models/Workspace');
const { BoardSchemaDefinition } = require('./models/Board');
const { ListSchemaDefinition } = require('./models/List');
const { CardSchemaDefinition } = require('./models/Card');
const { ActivitySchemaDefinition } = require('./models/Activity');
const seed = require('./seed/seedData');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory data store for initial demonstration & API execution
let store = {
  users: [...seed.mockUsers],
  workspaces: [...seed.mockWorkspaces],
  boards: [...seed.mockBoards],
  lists: [...seed.mockLists],
  cards: [...seed.mockCards],
  activities: [...seed.mockActivities]
};

// 1. Schema Inspector API Endpoint for Day 1-2 Review
app.get('/api/data-models', (req, res) => {
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
      Activity: ActivitySchemaDefinition
    }
  });
});

// 2. Auth & Users Endpoints
app.get('/api/users', (req, res) => {
  res.json({ status: 'success', data: store.users });
});

app.post('/api/users', (req, res) => {
  const { name, email, accountId, password, role, avatar } = req.body;
  if (!name || !email) return res.status(400).json({ status: 'error', message: 'Name and Email are required' });

  const existing = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(200).json({ status: 'success', data: existing, isExisting: true });
  }

  const generatedAccountId = accountId || name.toLowerCase().replace(/[^a-z0-9]+/g, '') + Math.floor(Math.random() * 899 + 100);
  const newUser = {
    _id: `usr_${Date.now()}`,
    accountId: generatedAccountId,
    password: password || 'password123',
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role || 'developer',
    avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    status: 'online',
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);

  // Auto-add new user to all default workspaces
  store.workspaces.forEach(ws => {
    if (!ws.members.some(m => m.user === newUser._id)) {
      ws.members.push({ user: newUser._id, role: 'member', joinedAt: new Date().toISOString() });
    }
  });

  res.status(201).json({ status: 'success', data: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { userId, accountId, email, password } = req.body;

  let user;
  if (userId) {
    user = store.users.find(u => u._id === userId);
  } else {
    const term = (accountId || email || '').trim().toLowerCase();
    user = store.users.find(u => 
      (u._id && u._id.toLowerCase() === term) ||
      (u.accountId && u.accountId.toLowerCase() === term) ||
      (u.email && u.email.toLowerCase() === term)
    );
  }

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'Invalid Account ID or Email address.' });
  }

  if (password && user.password && password !== user.password) {
    return res.status(401).json({ status: 'error', message: 'Incorrect Password. Please check your credentials.' });
  }

  // Set status online upon login
  user.status = 'online';
  res.json({ status: 'success', data: user });
});

app.post('/api/auth/logout', (req, res) => {
  const { userId } = req.body;
  const user = store.users.find(u => u._id === userId);
  if (user) {
    user.status = 'offline';
  }
  res.json({ status: 'success', message: 'Logged out successfully' });
});

app.get('/api/users/:id/dashboard', (req, res) => {
  const userId = req.params.id;
  const user = store.users.find(u => u._id === userId);
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

  // Get user assigned cards
  const assignedCards = store.cards.filter(c => c.assignees && c.assignees.includes(userId)).map(card => {
    const board = store.boards.find(b => b._id === card.board);
    const list = store.lists.find(l => l._id === card.list);
    const workspace = store.workspaces.find(w => w._id === card.workspace);
    return { ...card, boardName: board?.name, listTitle: list?.title, workspaceName: workspace?.name };
  });

  // Get user created cards
  const createdCards = store.cards.filter(c => c.reporter === userId);

  // Get user workspaces
  const userWorkspaces = store.workspaces.filter(w => w.members && w.members.some(m => m.user === userId));

  // Get user activities
  const userActivities = store.activities.filter(a => a.user === userId);

  res.json({
    status: 'success',
    data: {
      user,
      assignedCards,
      createdCards,
      userWorkspaces,
      userActivities
    }
  });
});

// 3. Workspaces Endpoints
app.get('/api/workspaces', (req, res) => {
  res.json({ status: 'success', data: store.workspaces });
});

app.get('/api/workspaces/:id', (req, res) => {
  const workspace = store.workspaces.find(w => w._id === req.params.id);
  if (!workspace) return res.status(404).json({ status: 'error', message: 'Workspace not found' });

  // Populate boards
  const workspaceBoards = store.boards.filter(b => b.workspace === workspace._id);
  // Populate members
  const populatedMembers = workspace.members.map(m => {
    const userDetail = store.users.find(u => u._id === m.user);
    return { ...m, userDetail };
  });

  res.json({
    status: 'success',
    data: {
      ...workspace,
      boards: workspaceBoards,
      members: populatedMembers
    }
  });
});

app.post('/api/workspaces', (req, res) => {
  const { name, description, icon, color, ownerId } = req.body;
  if (!name) return res.status(400).json({ status: 'error', message: 'Name is required' });

  const newWorkspace = {
    _id: `ws_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    icon: icon || 'Briefcase',
    color: color || '#6366F1',
    owner: ownerId || store.users[0]._id,
    members: [{ user: ownerId || store.users[0]._id, role: 'owner', joinedAt: new Date().toISOString() }],
    boards: [],
    settings: { visibility: 'team', allowGuestInvites: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.workspaces.push(newWorkspace);
  res.status(201).json({ status: 'success', data: newWorkspace });
});

app.put('/api/workspaces/:id', (req, res) => {
  const workspace = store.workspaces.find(w => w._id === req.params.id);
  if (!workspace) return res.status(404).json({ status: 'error', message: 'Workspace not found' });

  const { name, description, icon, color, settings } = req.body;
  if (name) workspace.name = name.trim();
  if (description !== undefined) workspace.description = description.trim();
  if (icon) workspace.icon = icon;
  if (color) workspace.color = color;
  if (settings) workspace.settings = { ...workspace.settings, ...settings };

  workspace.updatedAt = new Date().toISOString();
  res.json({ status: 'success', data: workspace });
});

app.post('/api/workspaces/:id/invitations', (req, res) => {
  const workspace = store.workspaces.find(w => w._id === req.params.id);
  if (!workspace) return res.status(404).json({ status: 'error', message: 'Workspace not found' });

  const { email, role } = req.body;
  if (!email) return res.status(400).json({ status: 'error', message: 'Email is required for workspace invitation' });

  let user = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    user = {
      _id: `usr_${Date.now()}`,
      accountId: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '') + '123',
      password: 'password123',
      name: email.split('@')[0].replace('.', ' ').replace(/^./, c => c.toUpperCase()),
      email: email.trim().toLowerCase(),
      role: role || 'member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'offline',
      createdAt: new Date().toISOString()
    };
    store.users.push(user);
  }

  const existingMember = workspace.members.find(m => m.user === user._id);
  if (!existingMember) {
    workspace.members.push({
      user: user._id,
      role: role || 'member',
      joinedAt: new Date().toISOString()
    });
  }

  res.status(201).json({ status: 'success', message: 'Invitation sent and member added to workspace', data: { workspace, user } });
});

// 4. Boards Endpoints
app.get('/api/boards/:id', (req, res) => {
  const board = store.boards.find(b => b._id === req.params.id);
  if (!board) return res.status(404).json({ status: 'error', message: 'Board not found' });

  const lists = store.lists
    .filter(l => l.board === board._id)
    .sort((a, b) => a.position - b.position)
    .map(list => {
      const listCards = store.cards
        .filter(c => c.list === list._id)
        .sort((a, b) => a.position - b.position)
        .map(card => {
          const assignees = card.assignees.map(aid => store.users.find(u => u._id === aid)).filter(Boolean);
          const reporter = store.users.find(u => u._id === card.reporter);
          return { ...card, assignees, reporter };
        });
      return { ...list, cards: listCards };
    });

  const boardMembers = board.members.map(mid => store.users.find(u => u._id === mid)).filter(Boolean);

  res.json({
    status: 'success',
    data: {
      ...board,
      lists,
      members: boardMembers
    }
  });
});

app.post('/api/boards', (req, res) => {
  const { workspaceId, name, key, description, type, color, icon } = req.body;
  if (!workspaceId || !name) return res.status(400).json({ status: 'error', message: 'Workspace ID and Name are required' });

  const boardId = `brd_${Date.now()}`;
  const generatedKey = key ? key.toUpperCase() : name.slice(0, 4).toUpperCase();

  const newBoard = {
    _id: boardId,
    workspace: workspaceId,
    name,
    key: generatedKey,
    description: description || '',
    type: type || 'kanban',
    icon: icon || 'Kanban',
    color: color || '#8B5CF6',
    isFavorite: false,
    members: store.users.map(u => u._id),
    lists: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Create default default lists for new board
  const defaultListNames = ['Backlog', 'In Progress', 'In Review', 'Done'];
  const createdListIds = defaultListNames.map((title, idx) => {
    const listId = `lst_${Date.now()}_${idx}`;
    store.lists.push({
      _id: listId,
      board: boardId,
      title,
      position: idx,
      color: idx === 3 ? '#10B981' : '#3B82F6',
      wipLimit: idx === 1 ? 5 : 0,
      cards: [],
      createdAt: new Date().toISOString()
    });
    return listId;
  });

  newBoard.lists = createdListIds;
  store.boards.push(newBoard);

  // Link to workspace
  const ws = store.workspaces.find(w => w._id === workspaceId);
  if (ws) ws.boards.push(boardId);

  res.status(201).json({ status: 'success', data: newBoard });
});

// 5. Lists Endpoints (CRUD & Reorder)

// GET /api/lists - Fetch all lists (with optional ?boardId=... filter)
app.get('/api/lists', (req, res) => {
  const { boardId } = req.query;
  let resultLists = store.lists;

  if (boardId) {
    resultLists = resultLists.filter(l => l.board === boardId);
  }

  // Populate cards for each list
  const populatedLists = resultLists
    .sort((a, b) => a.position - b.position)
    .map(list => {
      const listCards = store.cards
        .filter(c => c.list === list._id)
        .sort((a, b) => a.position - b.position)
        .map(card => {
          const assignees = (card.assignees || []).map(aid => store.users.find(u => u._id === aid)).filter(Boolean);
          const reporter = store.users.find(u => u._id === card.reporter);
          return { ...card, assignees, reporter };
        });
      return { ...list, cards: listCards };
    });

  res.json({ status: 'success', data: populatedLists });
});

// GET /api/lists/:id - Fetch single list details
app.get('/api/lists/:id', (req, res) => {
  const list = store.lists.find(l => l._id === req.params.id);
  if (!list) return res.status(404).json({ status: 'error', message: 'List not found' });

  const listCards = store.cards
    .filter(c => c.list === list._id)
    .sort((a, b) => a.position - b.position)
    .map(card => {
      const assignees = (card.assignees || []).map(aid => store.users.find(u => u._id === aid)).filter(Boolean);
      const reporter = store.users.find(u => u._id === card.reporter);
      return { ...card, assignees, reporter };
    });

  res.json({ status: 'success', data: { ...list, cards: listCards } });
});

// POST /api/lists - Create a new List in a board
app.post('/api/lists', (req, res) => {
  const { boardId, title, color, wipLimit } = req.body;
  if (!boardId || !title) return res.status(400).json({ status: 'error', message: 'Board ID and Title are required' });

  const board = store.boards.find(b => b._id === boardId);
  if (!board) return res.status(404).json({ status: 'error', message: 'Board not found' });

  const existingLists = store.lists.filter(l => l.board === boardId);
  const newList = {
    _id: `lst_${Date.now()}`,
    board: boardId,
    title: title.trim(),
    position: existingLists.length,
    color: color || '#3B82F6',
    wipLimit: Number(wipLimit) || 0,
    cards: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.lists.push(newList);
  board.lists.push(newList._id);

  res.status(201).json({ status: 'success', data: newList });
});

// PUT /api/lists/reorder - Reorder lists for a board
app.put('/api/lists/reorder', (req, res) => {
  const { boardId, orderedListIds } = req.body;
  if (!boardId || !Array.isArray(orderedListIds)) {
    return res.status(400).json({ status: 'error', message: 'boardId and orderedListIds array are required' });
  }

  orderedListIds.forEach((listId, idx) => {
    const list = store.lists.find(l => l._id === listId && l.board === boardId);
    if (list) {
      list.position = idx;
      list.updatedAt = new Date().toISOString();
    }
  });

  const updatedBoardLists = store.lists
    .filter(l => l.board === boardId)
    .sort((a, b) => a.position - b.position);

  res.json({ status: 'success', data: updatedBoardLists });
});

// PUT & PATCH /api/lists/:id - Update List details
const handleUpdateList = (req, res) => {
  const listIndex = store.lists.findIndex(l => l._id === req.params.id);
  if (listIndex === -1) return res.status(404).json({ status: 'error', message: 'List not found' });

  const existingList = store.lists[listIndex];
  const { title, color, wipLimit, position } = req.body;

  const updatedList = {
    ...existingList,
    ...(title !== undefined && { title: title.trim() }),
    ...(color !== undefined && { color }),
    ...(wipLimit !== undefined && { wipLimit: Number(wipLimit) }),
    ...(position !== undefined && { position: Number(position) }),
    updatedAt: new Date().toISOString()
  };

  store.lists[listIndex] = updatedList;
  res.json({ status: 'success', data: updatedList });
};

app.put('/api/lists/:id', handleUpdateList);
app.patch('/api/lists/:id', handleUpdateList);

// DELETE /api/lists/:id - Delete List and clean up associated board & cards
app.delete('/api/lists/:id', (req, res) => {
  const listIndex = store.lists.findIndex(l => l._id === req.params.id);
  if (listIndex === -1) return res.status(404).json({ status: 'error', message: 'List not found' });

  const deletedList = store.lists[listIndex];

  // Remove list from store
  store.lists.splice(listIndex, 1);

  // Remove list ID from board.lists
  const parentBoard = store.boards.find(b => b._id === deletedList.board);
  if (parentBoard && parentBoard.lists) {
    parentBoard.lists = parentBoard.lists.filter(lid => lid !== deletedList._id);
  }

  // Remove cards in this list
  store.cards = store.cards.filter(c => c.list !== deletedList._id);

  res.json({ status: 'success', message: 'List and associated cards deleted successfully', data: { _id: req.params.id } });
});

// 6. Cards Endpoints & Subtasks/Comments Operations

// GET /api/cards - Fetch all cards with filters (?boardId, ?listId, ?assignee, ?priority, ?search)
app.get('/api/cards', (req, res) => {
  const { boardId, listId, workspaceId, assignee, priority, status, search } = req.query;
  let resultCards = store.cards;

  if (boardId) resultCards = resultCards.filter(c => c.board === boardId);
  if (listId) resultCards = resultCards.filter(c => c.list === listId);
  if (workspaceId) resultCards = resultCards.filter(c => c.workspace === workspaceId);
  if (priority) resultCards = resultCards.filter(c => c.priority === priority);
  if (status) resultCards = resultCards.filter(c => c.status === status);
  if (assignee) resultCards = resultCards.filter(c => c.assignees && c.assignees.includes(assignee));
  if (search) {
    const q = search.toLowerCase();
    resultCards = resultCards.filter(c => c.title.toLowerCase().includes(q) || c.key.toLowerCase().includes(q));
  }

  const populatedCards = resultCards.map(card => {
    const assignees = (card.assignees || []).map(aid => store.users.find(u => u._id === aid)).filter(Boolean);
    const reporter = store.users.find(u => u._id === card.reporter);
    const board = store.boards.find(b => b._id === card.board);
    const list = store.lists.find(l => l._id === card.list);
    return { ...card, assignees, reporter, boardName: board?.name, listTitle: list?.title };
  });

  res.json({ status: 'success', data: populatedCards });
});

// GET /api/cards/:id - Fetch single card details
app.get('/api/cards/:id', (req, res) => {
  const card = store.cards.find(c => c._id === req.params.id);
  if (!card) return res.status(404).json({ status: 'error', message: 'Card not found' });

  const assignees = (card.assignees || []).map(aid => store.users.find(u => u._id === aid)).filter(Boolean);
  const reporter = store.users.find(u => u._id === card.reporter);
  const board = store.boards.find(b => b._id === card.board);
  const list = store.lists.find(l => l._id === card.list);
  const workspace = store.workspaces.find(w => w._id === card.workspace);

  res.json({
    status: 'success',
    data: {
      ...card,
      assignees,
      reporter,
      boardDetail: board,
      listDetail: list,
      workspaceDetail: workspace
    }
  });
});

// POST /api/cards - Create a new Card
app.post('/api/cards', (req, res) => {
  const { listId, boardId, workspaceId, title, description, priority, assignees, storyPoints, dueDate, labels, subtasks, reporter } = req.body;
  if (!title || !listId || !boardId) return res.status(400).json({ status: 'error', message: 'Title, List ID, and Board ID are required' });

  const board = store.boards.find(b => b._id === boardId);
  const cardCount = store.cards.length + 101;
  const cardKey = board ? `${board.key}-${cardCount}` : `PULSE-${cardCount}`;
  const listCards = store.cards.filter(c => c.list === listId);

  const newCard = {
    _id: `crd_${Date.now()}`,
    key: cardKey,
    title: title.trim(),
    description: description || '',
    list: listId,
    board: boardId,
    workspace: workspaceId || store.workspaces[0]._id,
    position: listCards.length,
    priority: priority || 'medium',
    status: 'todo',
    assignees: assignees || [store.users[0]._id],
    reporter: reporter || store.users[0]._id,
    labels: labels || [{ name: 'New Task', color: '#3B82F6' }],
    dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
    storyPoints: Number(storyPoints) || 1,
    subtasks: subtasks || [],
    attachments: [],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.cards.push(newCard);
  const targetList = store.lists.find(l => l._id === listId);
  if (targetList) targetList.cards.push(newCard._id);

  // Record Activity Log
  store.activities.unshift({
    _id: `act_${Date.now()}`,
    workspace: newCard.workspace,
    board: boardId,
    card: newCard._id,
    user: reporter || store.users[0]._id,
    action: 'created_card',
    details: { cardTitle: title },
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ status: 'success', data: newCard });
});

// PUT & PATCH /api/cards/:id - Update Card details
const handleUpdateCard = (req, res) => {
  const cardIndex = store.cards.findIndex(c => c._id === req.params.id);
  if (cardIndex === -1) return res.status(404).json({ status: 'error', message: 'Card not found' });

  const existingCard = store.cards[cardIndex];
  const { title, description, priority, listId, position, assignees, storyPoints, dueDate, status, labels, subtasks, comments } = req.body;

  let moved = false;
  if (listId && listId !== existingCard.list) {
    // Remove from old list
    const oldList = store.lists.find(l => l._id === existingCard.list);
    if (oldList) oldList.cards = oldList.cards.filter(cid => cid !== existingCard._id);
    // Add to new list
    const newList = store.lists.find(l => l._id === listId);
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
    updatedAt: new Date().toISOString()
  };

  store.cards[cardIndex] = updatedCard;

  if (moved) {
    store.activities.unshift({
      _id: `act_${Date.now()}`,
      workspace: updatedCard.workspace,
      board: updatedCard.board,
      card: updatedCard._id,
      user: store.users[0]._id,
      action: 'moved_card',
      details: { cardTitle: updatedCard.title },
      createdAt: new Date().toISOString()
    });
  }

  res.json({ status: 'success', data: updatedCard });
};

app.put('/api/cards/:id', handleUpdateCard);
app.patch('/api/cards/:id', handleUpdateCard);

// DELETE /api/cards/:id - Delete Card
app.delete('/api/cards/:id', (req, res) => {
  const cardIndex = store.cards.findIndex(c => c._id === req.params.id);
  if (cardIndex === -1) return res.status(404).json({ status: 'error', message: 'Card not found' });

  const deletedCard = store.cards[cardIndex];

  // Remove card from store
  store.cards.splice(cardIndex, 1);

  // Remove card ID from list.cards
  const parentList = store.lists.find(l => l._id === deletedCard.list);
  if (parentList && parentList.cards) {
    parentList.cards = parentList.cards.filter(cid => cid !== deletedCard._id);
  }

  // Record Activity Log
  store.activities.unshift({
    _id: `act_${Date.now()}`,
    workspace: deletedCard.workspace,
    board: deletedCard.board,
    card: deletedCard._id,
    user: store.users[0]._id,
    action: 'deleted_card',
    details: { cardTitle: deletedCard.title },
    createdAt: new Date().toISOString()
  });

  res.json({ status: 'success', message: 'Card deleted successfully', data: { _id: req.params.id } });
});

// PUT & PATCH /api/cards/:id/move - Move card between lists & positions
const handleMoveCardRoute = (req, res) => {
  const { targetListId, position } = req.body;
  const card = store.cards.find(c => c._id === req.params.id);
  if (!card) return res.status(404).json({ status: 'error', message: 'Card not found' });

  if (targetListId && targetListId !== card.list) {
    const oldList = store.lists.find(l => l._id === card.list);
    if (oldList) oldList.cards = oldList.cards.filter(cid => cid !== card._id);

    const newList = store.lists.find(l => l._id === targetListId);
    if (newList) newList.cards.push(card._id);

    card.list = targetListId;
  }

  if (position !== undefined) {
    card.position = Number(position);
  }

  card.updatedAt = new Date().toISOString();

  res.json({ status: 'success', data: card });
};

app.put('/api/cards/:id/move', handleMoveCardRoute);
app.patch('/api/cards/:id/move', handleMoveCardRoute);

// Subtasks CRUD Endpoints

// POST /api/cards/:id/subtasks - Add Subtask to Card
app.post('/api/cards/:id/subtasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ status: 'error', message: 'Subtask title is required' });

  const card = store.cards.find(c => c._id === req.params.id);
  if (!card) return res.status(404).json({ status: 'error', message: 'Card not found' });

  const newSubtask = {
    id: `st_${Date.now()}`,
    title: title.trim(),
    completed: false
  };

  card.subtasks = card.subtasks || [];
  card.subtasks.push(newSubtask);
  card.updatedAt = new Date().toISOString();

  res.status(201).json({ status: 'success', data: newSubtask, card });
});

// PUT /api/cards/:id/subtasks/:subtaskId - Update Subtask (Toggle/Rename)
app.put('/api/cards/:id/subtasks/:subtaskId', (req, res) => {
  const card = store.cards.find(c => c._id === req.params.id);
  if (!card) return res.status(404).json({ status: 'error', message: 'Card not found' });

  const subtask = (card.subtasks || []).find(s => s.id === req.params.subtaskId);
  if (!subtask) return res.status(404).json({ status: 'error', message: 'Subtask not found' });

  const { title, completed } = req.body;
  if (title !== undefined) subtask.title = title.trim();
  if (completed !== undefined) subtask.completed = Boolean(completed);

  card.updatedAt = new Date().toISOString();
  res.json({ status: 'success', data: subtask, card });
});

// DELETE /api/cards/:id/subtasks/:subtaskId - Delete Subtask
app.delete('/api/cards/:id/subtasks/:subtaskId', (req, res) => {
  const card = store.cards.find(c => c._id === req.params.id);
  if (!card) return res.status(404).json({ status: 'error', message: 'Card not found' });

  card.subtasks = (card.subtasks || []).filter(s => s.id !== req.params.subtaskId);
  card.updatedAt = new Date().toISOString();

  res.json({ status: 'success', message: 'Subtask removed', card });
});

// Comments CRUD Endpoints

// POST /api/cards/:id/comments - Add Comment to Card
app.post('/api/cards/:id/comments', (req, res) => {
  const { userId, content } = req.body;
  if (!content) return res.status(400).json({ status: 'error', message: 'Comment content is required' });

  const card = store.cards.find(c => c._id === req.params.id);
  if (!card) return res.status(404).json({ status: 'error', message: 'Card not found' });

  const newComment = {
    id: `cmt_${Date.now()}`,
    user: userId || store.users[0]._id,
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  card.comments = card.comments || [];
  card.comments.push(newComment);
  card.updatedAt = new Date().toISOString();

  res.status(201).json({ status: 'success', data: newComment, card });
});

// DELETE /api/cards/:id/comments/:commentId - Delete Comment
app.delete('/api/cards/:id/comments/:commentId', (req, res) => {
  const card = store.cards.find(c => c._id === req.params.id);
  if (!card) return res.status(404).json({ status: 'error', message: 'Card not found' });

  card.comments = (card.comments || []).filter(c => c.id !== req.params.commentId);
  card.updatedAt = new Date().toISOString();

  res.json({ status: 'success', message: 'Comment removed', card });
});

// 7. Seed Reset API
app.post('/api/seed/reset', (req, res) => {
  store = {
    users: JSON.parse(JSON.stringify(seed.mockUsers)),
    workspaces: JSON.parse(JSON.stringify(seed.mockWorkspaces)),
    boards: JSON.parse(JSON.stringify(seed.mockBoards)),
    lists: JSON.parse(JSON.stringify(seed.mockLists)),
    cards: JSON.parse(JSON.stringify(seed.mockCards)),
    activities: JSON.parse(JSON.stringify(seed.mockActivities))
  };
  res.json({ status: 'success', message: 'Store reset to initial seed state.' });
});

const server = app.listen(PORT, () => {
  console.log(`⚡ [PulseWork Backend] Day 1-3 MERN REST APIs listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚡ [PulseWork Backend] Port ${PORT} is already in use. Express API backend active.`);
  } else {
    console.error('Server error:', err);
  }
});


