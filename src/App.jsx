import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BoardView from "./components/BoardView";
import UserPanel from "./components/UserPanel";
import LoginModal from "./components/LoginModal";
import DataModelsModal from "./components/DataModelsModal";
import CardModal from "./components/CardModal";
import CreateCardModal from "./components/CreateCardModal";
import CreateBoardModal from "./components/CreateBoardModal";
import CreateWorkspaceModal from "./components/CreateWorkspaceModal";
import WorkspaceSettings from "./components/WorkspaceSettings";
import {
  mockUsers,
  mockWorkspaces,
  mockBoards,
  mockLists,
  mockCards,
} from "./mockData";

const API_BASE = "http://localhost:5001/api";

export default function App() {
  const [users, setUsers] = useState(mockUsers);
  const [workspaces, setWorkspaces] = useState(mockWorkspaces);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState("ws_001");
  const [currentBoardId, setCurrentBoardId] = useState("brd_001");
  const [boardDetails, setBoardDetails] = useState(null);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("pulse_current_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return mockUsers[0];
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals & Views
  const [activeView, setActiveView] = useState("kanban"); // 'kanban' | 'user_panel' | 'models'
  const [isDataModelsModalOpen, setIsDataModelsModalOpen] = useState(false);
  const [schemaData, setSchemaData] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [createCardListId, setCreateCardListId] = useState(null);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] =
    useState(false);

  const handleUpdateWorkspace = (updatedWs) => {
    setWorkspaces(
      workspaces.map((w) => (w._id === updatedWs._id ? updatedWs : w)),
    );
  };

  // Fetch Users & Data Models
  useEffect(() => {
    fetch(`${API_BASE}/data-models`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setSchemaData(data);
        }
      })
      .catch((err) =>
        console.log("Backend sync offline, using local schema provider"),
      );

    fetch(`${API_BASE}/users`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          setUsers(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Workspaces & Active Board
  useEffect(() => {
    fetchWorkspaceData(currentWorkspaceId);
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (currentBoardId) {
      fetchBoardDetails(currentBoardId);
    }
  }, [currentBoardId]);

  const fetchWorkspaceData = (wsId) => {
    fetch(`${API_BASE}/workspaces/${wsId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          const wsBoards = res.data.boards || [];
          if (
            wsBoards.length > 0 &&
            !wsBoards.some((b) => b._id === currentBoardId)
          ) {
            setCurrentBoardId(wsBoards[0]._id);
          }
        }
      })
      .catch(() => {});
  };

  const fetchBoardDetails = (bId) => {
    fetch(`${API_BASE}/boards/${bId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          setBoardDetails(res.data);
        }
      })
      .catch(() => {
        // Fallback to local memory mock state
        const board = mockBoards.find((b) => b._id === bId);
        if (!board) return;
        const lists = mockLists
          .filter((l) => l.board === bId)
          .map((l) => ({
            ...l,
            cards: mockCards
              .filter((c) => c.list === l._id)
              .map((c) => ({
                ...c,
                assignees: c.assignees
                  .map((aid) => mockUsers.find((u) => u._id === aid))
                  .filter(Boolean),
              })),
          }));
        setBoardDetails({ ...board, lists, members: mockUsers });
      });
  };

  // Auth Handlers
  const handleLoginUser = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem("pulse_current_user", JSON.stringify(userObj));
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userObj._id }),
    }).catch(() => {});
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("pulse_current_user");
  };

  // Workspace & Card Actions
  const handleSelectWorkspace = (wsId) => {
    setCurrentWorkspaceId(wsId);
    const targetWs = workspaces.find((w) => w._id === wsId);
    if (targetWs && targetWs.boards && targetWs.boards.length > 0) {
      setCurrentBoardId(targetWs.boards[0]);
    }
  };

  const handleMoveCard = (cardId, targetListId) => {
    fetch(`${API_BASE}/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId: targetListId }),
    })
      .then((res) => res.json())
      .then(() => fetchBoardDetails(currentBoardId))
      .catch(() => {
        if (!boardDetails) return;
        let movedCard = null;
        const newLists = boardDetails.lists.map((list) => {
          const found = list.cards.find((c) => c._id === cardId);
          if (found) movedCard = { ...found, list: targetListId };
          return {
            ...list,
            cards: list.cards.filter((c) => c._id !== cardId),
          };
        });

        if (movedCard) {
          const targetListIndex = newLists.findIndex(
            (l) => l._id === targetListId,
          );
          if (targetListIndex !== -1) {
            newLists[targetListIndex].cards.push(movedCard);
          }
        }
        setBoardDetails({ ...boardDetails, lists: newLists });
      });
  };

  const handleCreateCard = (cardData) => {
    fetch(`${API_BASE}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...cardData,
        boardId: currentBoardId,
        workspaceId: currentWorkspaceId,
        assignees: currentUser ? [currentUser._id] : [users[0]._id],
      }),
    })
      .then((res) => res.json())
      .then(() => fetchBoardDetails(currentBoardId))
      .catch(() => {
        const newCrd = {
          _id: `crd_${Date.now()}`,
          key: `${boardDetails?.key || "PULSE"}-${Math.floor(Math.random() * 800 + 100)}`,
          title: cardData.title,
          description: cardData.description,
          list: cardData.listId,
          board: currentBoardId,
          workspace: currentWorkspaceId,
          position: 0,
          priority: cardData.priority,
          status: "todo",
          assignees: [currentUser || users[0]],
          reporter: currentUser?._id || users[0]._id,
          labels: [{ name: "New Task", color: "#4F46E5" }],
          storyPoints: cardData.storyPoints,
          subtasks: [],
          comments: [],
        };
        const newLists = (boardDetails?.lists || []).map((l) => {
          if (l._id === cardData.listId) {
            return { ...l, cards: [...l.cards, newCrd] };
          }
          return l;
        });
        setBoardDetails({ ...boardDetails, lists: newLists });
      });
  };

  const handleUpdateCard = (cardId, updatePayload) => {
    fetch(`${API_BASE}/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    })
      .then((res) => res.json())
      .then(() => fetchBoardDetails(currentBoardId))
      .catch(() => {
        if (!boardDetails) return;
        const newLists = boardDetails.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) =>
            c._id === cardId ? { ...c, ...updatePayload } : c,
          ),
        }));
        setBoardDetails({ ...boardDetails, lists: newLists });
      });
  };

  const handleCreateBoard = (boardPayload) => {
    fetch(`${API_BASE}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(boardPayload),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          const newBrd = res.data;
          setCurrentBoardId(newBrd._id);
          fetchWorkspaceData(currentWorkspaceId);
        }
      })
      .catch(() => {
        const newId = `brd_${Date.now()}`;
        setCurrentBoardId(newId);
      });
  };

  const handleAddListColumn = () => {
    const listTitle = prompt(
      "Enter New Column / List Title (e.g., Code Review):",
    );
    if (!listTitle) return;

    fetch(`${API_BASE}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: currentBoardId, title: listTitle }),
    })
      .then(() => fetchBoardDetails(currentBoardId))
      .catch(() => {
        const newListObj = {
          _id: `lst_${Date.now()}`,
          board: currentBoardId,
          title: listTitle,
          position: boardDetails?.lists?.length || 0,
          color: "#3B82F6",
          cards: [],
        };
        setBoardDetails({
          ...boardDetails,
          lists: [...(boardDetails?.lists || []), newListObj],
        });
      });
  };

  const handleCreateWorkspace = (wsData) => {
    fetch(`${API_BASE}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...wsData, ownerId: currentUser?._id }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          setWorkspaces([...workspaces, res.data]);
          setCurrentWorkspaceId(res.data._id);
        }
      })
      .catch(() => {
        const newWs = {
          _id: `ws_${Date.now()}`,
          name: wsData.name,
          description: wsData.description,
          icon: "Briefcase",
          color: "#4F46E5",
          owner: currentUser?._id || users[0]._id,
          members: [{ user: currentUser?._id || users[0]._id, role: "owner" }],
          boards: [],
        };
        setWorkspaces([...workspaces, newWs]);
        setCurrentWorkspaceId(newWs._id);
      });
  };

  const handleResetData = () => {
    fetch(`${API_BASE}/seed/reset`, { method: "POST" })
      .then(() => {
        fetchWorkspaceData(currentWorkspaceId);
        fetchBoardDetails(currentBoardId);
      })
      .catch(() => window.location.reload());
  };

  const currentWorkspace =
    workspaces.find((w) => w._id === currentWorkspaceId) || workspaces[0];
  const workspaceBoards = boardDetails
    ? [boardDetails]
    : mockBoards.filter((b) => b.workspace === currentWorkspaceId);

  // All cards collection for UserPanel calculation
  const allCards = boardDetails?.lists
    ? boardDetails.lists.flatMap((l) => l.cards || [])
    : mockCards;

  // Active card finding for modal
  let activeCard = null;
  if (activeCardId && boardDetails?.lists) {
    for (const l of boardDetails.lists) {
      const found = l.cards?.find((c) => c._id === activeCardId);
      if (found) {
        activeCard = found;
        break;
      }
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      {/* Top Header */}
      <Header
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenDataModelsModal={() => setIsDataModelsModalOpen(true)}
        onOpenCreateTask={() => {
          setCreateCardListId(boardDetails?.lists?.[0]?._id);
          setIsCreateCardModalOpen(true);
        }}
        onOpenCreateBoard={() => setIsCreateBoardModalOpen(true)}
        onResetData={handleResetData}
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view === "models") setIsDataModelsModalOpen(true);
        }}
        users={users}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          currentWorkspace={currentWorkspace}
          boards={workspaceBoards}
          activeBoardId={currentBoardId}
          onSelectBoard={(id) => {
            setCurrentBoardId(id);
            setActiveView("kanban");
          }}
          onOpenCreateBoard={() => setIsCreateBoardModalOpen(true)}
          onOpenCreateWorkspace={() => setIsCreateWorkspaceModalOpen(true)}
          onOpenDataModelsModal={() => setIsDataModelsModalOpen(true)}
          workspaceMembers={currentWorkspace?.members || []}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          activeView={activeView}
          onSelectView={(view) => setActiveView(view)}
        />

        {/* View Switcher: Workspace Settings vs User Panel vs Kanban Board */}
        {activeView === "settings" ? (
          <WorkspaceSettings
            workspace={currentWorkspace}
            boards={workspaceBoards}
            users={users}
            currentUser={currentUser}
            onUpdateWorkspace={handleUpdateWorkspace}
            onOpenCreateBoard={() => setIsCreateBoardModalOpen(true)}
          />
        ) : activeView === "user_panel" ? (
          <UserPanel
            currentUser={currentUser}
            users={users}
            workspaces={workspaces}
            boards={mockBoards}
            cards={allCards}
            lists={boardDetails?.lists || mockLists}
            onCardClick={(cardId) => setActiveCardId(cardId)}
            onSelectBoard={(boardId) => {
              setCurrentBoardId(boardId);
              setActiveView("kanban");
            }}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onUpdateCardStatus={handleUpdateCard}
          />
        ) : (
          <BoardView
            board={boardDetails}
            onCardClick={(cardId) => setActiveCardId(cardId)}
            onAddCardClick={(listId) => {
              setCreateCardListId(listId);
              setIsCreateCardModalOpen(true);
            }}
            onAddListClick={handleAddListColumn}
            onMoveCard={handleMoveCard}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Auth Login & Switch User Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onLogin={handleLoginUser}
        onLogout={handleLogoutUser}
      />

      {/* Day 1-2 Data Models Inspector Modal */}
      <DataModelsModal
        isOpen={isDataModelsModalOpen}
        onClose={() => setIsDataModelsModalOpen(false)}
        schemaData={schemaData}
      />

      {/* Card Details Modal */}
      <CardModal
        isOpen={Boolean(activeCardId)}
        onClose={() => setActiveCardId(null)}
        card={activeCard}
        users={users}
        currentUser={currentUser}
        onUpdateCard={handleUpdateCard}
      />

      {/* Creation Modals */}
      <CreateCardModal
        isOpen={isCreateCardModalOpen}
        onClose={() => setIsCreateCardModalOpen(false)}
        defaultListId={createCardListId}
        lists={boardDetails?.lists || []}
        onCreateCard={handleCreateCard}
      />

      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        currentWorkspaceId={currentWorkspaceId}
        onCreateBoard={handleCreateBoard}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />
    </div>
  );
}
