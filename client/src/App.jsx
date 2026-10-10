import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BoardView from "./components/BoardView";
import UserPanel from "./components/UserPanel";
import TeamView from "./components/TeamView";
import LoginForm from "./components/LoginForm";
import LoginModal from "./components/LoginModal";
import InviteMemberModal from "./components/InviteMemberModal";
import DataModelsModal from "./components/DataModelsModal";
import CardModal from "./components/CardModal";
import CreateCardModal from "./components/CreateCardModal";
import CreateBoardModal from "./components/CreateBoardModal";
import CreateWorkspaceModal from "./components/CreateWorkspaceModal";
import WorkspaceSettings from "./components/WorkspaceSettings";
import Toast from "./components/Toast";
import {
  mockUsers,
  mockWorkspaces,
  mockBoards,
  mockLists,
  mockCards,
} from "./mockData";

import {
  socket,
  registerUser,
  joinBoardRoom,
  leaveBoardRoom,
  emitCardMoved,
  emitCardCreated,
  emitCardUpdated,
  emitCardDeleted,
  emitListCreated,
  emitListUpdated,
  emitListReordered,
  emitListDeleted,
} from "./services/socket";

const API_BASE = "http://localhost:5001/api";

export default function App() {
  const [users, setUsers] = useState(mockUsers);
  const [workspaces, setWorkspaces] = useState(mockWorkspaces);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState("ws_001");
  const [currentBoardId, setCurrentBoardId] = useState("brd_001");
  const [boardDetails, setBoardDetails] = useState(null);
  const [activeBoardPeers, setActiveBoardPeers] = useState([]);

  // Toast Notification State for Optimistic UI Feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => setToast({ message, type });

  // Socket Connection Status State
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  // In-App Notification Center State (Week 4 Milestone)
  const [notifications, setNotifications] = useState([]);

  const addNotification = (title, message) => {
    const newNotif = {
      id: `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 24)]);
  };

  const clearNotifications = () => setNotifications([]);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("pulse_current_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Modals & Views
  const [activeView, setActiveView] = useState("kanban"); // 'kanban' | 'user_panel' | 'team' | 'models' | 'settings'
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

  // Track real-time socket connection status
  useEffect(() => {
    const handleConnect = () => setIsSocketConnected(true);
    const handleDisconnect = () => setIsSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    setIsSocketConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // Real-Time Socket.io Connection & Event Engine Subscriptions
  useEffect(() => {
    if (currentUser) {
      registerUser(currentUser._id, currentUser.name);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentBoardId) return;

    joinBoardRoom(currentBoardId, currentUser?._id, currentUser?.name);

    const handleUserJoined = (data) => {
      showToast(`${data.userName || "A user"} joined the board room`, "info");
      setActiveBoardPeers((prev) => {
        if (prev.some((p) => p.socketId === data.socketId)) return prev;
        return [...prev, data];
      });
    };

    const handleUserLeft = (data) => {
      setActiveBoardPeers((prev) =>
        prev.filter((p) => p.socketId !== data.socketId),
      );
    };

    const handleUserDisconnected = (data) => {
      setActiveBoardPeers((prev) =>
        prev.filter((p) => p.socketId !== data.socketId),
      );
    };

    const handleBoardPeers = (data) => {
      if (data.boardId === currentBoardId) {
        setActiveBoardPeers(data.peers || []);
      }
    };

    const handleRealtimeCardMoved = (data) => {
      if (data.socketId === socket.id) return;
      showToast("Real-time: Card position synced", "info");
      addNotification("Card Moved", `${data.user?.name || "A team member"} moved a card.`);
      fetchBoardDetails(currentBoardId);
    };

    const handleRealtimeCardCreated = (data) => {
      if (data.socketId === socket.id) return;
      showToast("Real-time: New card created by team member", "success");
      addNotification("New Card Added", `${data.user?.name || "A team member"} created "${data.card?.title || 'a task'}".`);
      fetchBoardDetails(currentBoardId);
    };

    const handleRealtimeCardUpdated = (data) => {
      if (data.socketId === socket.id) return;
      showToast("Real-time: Card updated by team member", "info");
      addNotification("Card Updated", `${data.user?.name || "A team member"} modified a task.`);
      fetchBoardDetails(currentBoardId);
    };

    const handleRealtimeCardDeleted = (data) => {
      if (data.socketId === socket.id) return;
      showToast("Real-time: Card deleted by team member", "info");
      addNotification("Card Removed", `${data.user?.name || "A team member"} deleted a card.`);
      fetchBoardDetails(currentBoardId);
    };

    const handleRealtimeListEvent = (data) => {
      if (data.socketId === socket.id) return;
      fetchBoardDetails(currentBoardId);
    };

    socket.on("user_joined_board", handleUserJoined);
    socket.on("user_left_board", handleUserLeft);
    socket.on("user_disconnected", handleUserDisconnected);
    socket.on("board_peers", handleBoardPeers);

    socket.on("card_moved", handleRealtimeCardMoved);
    socket.on("card_created", handleRealtimeCardCreated);
    socket.on("card_updated", handleRealtimeCardUpdated);
    socket.on("card_deleted", handleRealtimeCardDeleted);

    socket.on("list_created", handleRealtimeListEvent);
    socket.on("list_updated", handleRealtimeListEvent);
    socket.on("list_reordered", handleRealtimeListEvent);
    socket.on("list_deleted", handleRealtimeListEvent);

    return () => {
      leaveBoardRoom(currentBoardId);
      socket.off("user_joined_board", handleUserJoined);
      socket.off("user_left_board", handleUserLeft);
      socket.off("user_disconnected", handleUserDisconnected);
      socket.off("board_peers", handleBoardPeers);

      socket.off("card_moved", handleRealtimeCardMoved);
      socket.off("card_created", handleRealtimeCardCreated);
      socket.off("card_updated", handleRealtimeCardUpdated);
      socket.off("card_deleted", handleRealtimeCardDeleted);

      socket.off("list_created", handleRealtimeListEvent);
      socket.off("list_updated", handleRealtimeListEvent);
      socket.off("list_reordered", handleRealtimeListEvent);
      socket.off("list_deleted", handleRealtimeListEvent);
    };
  }, [currentBoardId, currentUser]);

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

  const [boardActivities, setBoardActivities] = useState([]);

  const fetchBoardActivities = (bId) => {
    fetch(`${API_BASE}/boards/${bId}/activities`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          setBoardActivities(res.data);
        }
      })
      .catch(() => {});
  };

  const fetchBoardDetails = (bId) => {
    fetchBoardActivities(bId);
    fetch(`${API_BASE}/boards/${bId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          setBoardDetails(res.data);
        }
      })
      .catch(() => {
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

  // Auth & Team Handlers
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
    if (currentUser) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser._id }),
      }).catch(() => {});
    }
    setCurrentUser(null);
    localStorage.removeItem("pulse_current_user");
    setIsLoginModalOpen(true);
  };

  const handleAddTeamMember = (memberPayload) => {
    fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberPayload),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          const newUser = res.data;
          setUsers((prev) => {
            if (prev.some((u) => u._id === newUser._id)) return prev;
            return [...prev, newUser];
          });

          handleLoginUser(newUser);
        }
      })
      .catch(() => {
        const localNewUser = {
          _id: `usr_${Date.now()}`,
          name: memberPayload.name,
          email: memberPayload.email,
          role: memberPayload.role,
          avatar: memberPayload.avatar,
          status: "online",
        };
        setUsers([...users, localNewUser]);
        handleLoginUser(localNewUser);
      });
  };

  // Workspace & Card Actions
  const handleSelectWorkspace = (wsId) => {
    setCurrentWorkspaceId(wsId);
    const targetWs = workspaces.find((w) => w._id === wsId);
    if (targetWs && targetWs.boards && targetWs.boards.length > 0) {
      setCurrentBoardId(targetWs.boards[0]);
    }
  };

  const handleMoveCard = (
    cardId,
    sourceListId,
    targetListId,
    sourceIndex,
    targetIndex,
  ) => {
    if (!boardDetails || !boardDetails.lists) return;

    const previousBoardDetails = JSON.parse(JSON.stringify(boardDetails));

    const newLists = boardDetails.lists.map((l) => ({
      ...l,
      cards: [...(l.cards || [])],
    }));

    const sourceList = newLists.find(
      (l) => l._id === (sourceListId || targetListId),
    );
    const targetList = newLists.find((l) => l._id === targetListId);

    if (sourceList && targetList) {
      if (sourceList._id === targetList._id) {
        const cardIdx = sourceList.cards.findIndex((c) => c._id === cardId);
        if (cardIdx !== -1) {
          const [movedCard] = sourceList.cards.splice(cardIdx, 1);
          sourceList.cards.splice(
            targetIndex !== undefined ? targetIndex : 0,
            0,
            movedCard,
          );
        }
      } else {
        const cardIdx = sourceList.cards.findIndex((c) => c._id === cardId);
        if (cardIdx !== -1) {
          const [movedCard] = sourceList.cards.splice(cardIdx, 1);
          movedCard.list = targetListId;
          targetList.cards.splice(
            targetIndex !== undefined ? targetIndex : targetList.cards.length,
            0,
            movedCard,
          );
        }
      }
      setBoardDetails({ ...boardDetails, lists: newLists });
    }

    emitCardMoved({
      boardId: currentBoardId,
      cardId,
      sourceListId,
      targetListId,
      sourceIndex,
      targetIndex,
      user: currentUser,
    });

    fetch(`${API_BASE}/cards/${cardId}/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetListId,
        position: targetIndex !== undefined ? targetIndex : 0,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server move failed");
        return res.json();
      })
      .catch((err) => {
        console.warn("Optimistic move card failed, rolling back:", err);
        setBoardDetails(previousBoardDetails);
        showToast("Network sync failed. Reverted card position.", "error");
      });
  };

  const handleReorderLists = (sourceIndex, destinationIndex) => {
    if (!boardDetails || !boardDetails.lists) return;

    const previousBoardDetails = JSON.parse(JSON.stringify(boardDetails));

    const reorderedLists = [...boardDetails.lists];
    const [removed] = reorderedLists.splice(sourceIndex, 1);
    reorderedLists.splice(destinationIndex, 0, removed);

    setBoardDetails({ ...boardDetails, lists: reorderedLists });

    const orderedListIds = reorderedLists.map((l) => l._id);
    emitListReordered({
      boardId: currentBoardId,
      orderedListIds,
      user: currentUser,
    });
    fetch(`${API_BASE}/lists/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: currentBoardId, orderedListIds }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server reorder failed");
        return res.json();
      })
      .catch((err) => {
        console.warn("Optimistic reorder lists failed, rolling back:", err);
        setBoardDetails(previousBoardDetails);
        showToast("Server sync failed. Restored column order.", "error");
      });
  };

  const handleCreateCard = (cardData) => {
    if (!boardDetails) return;
    const previousBoardDetails = JSON.parse(JSON.stringify(boardDetails));

    const tempCardId = `crd_${Date.now()}`;
    const newCrd = {
      _id: tempCardId,
      key: `${boardDetails?.key || "PULSE"}-${Math.floor(Math.random() * 800 + 100)}`,
      title: cardData.title,
      description: cardData.description || "",
      list: cardData.listId,
      board: currentBoardId,
      workspace: currentWorkspaceId,
      position: 0,
      priority: cardData.priority || "medium",
      status: "todo",
      assignees: [currentUser || users[0]],
      reporter: currentUser?._id || users[0]._id,
      labels: [{ name: "New Task", color: "#4F46E5" }],
      storyPoints: cardData.storyPoints || 1,
      subtasks: [],
      comments: [],
    };

    const updatedLists = (boardDetails.lists || []).map((l) => {
      if (l._id === cardData.listId) {
        return { ...l, cards: [...l.cards, newCrd] };
      }
      return l;
    });
    setBoardDetails({ ...boardDetails, lists: updatedLists });
    showToast("Card created", "success");

    emitCardCreated({
      boardId: currentBoardId,
      listId: cardData.listId,
      card: newCrd,
      user: currentUser,
    });

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
      .then((res) => {
        if (!res.ok) throw new Error("Server card creation failed");
        return res.json();
      })
      .then(() => fetchBoardDetails(currentBoardId))
      .catch((err) => {
        console.warn("Optimistic card creation failed, rolling back:", err);
        setBoardDetails(previousBoardDetails);
        showToast("Card creation failed on server. Reverted.", "error");
      });
  };

  const handleUpdateCard = (cardId, updatePayload) => {
    if (!boardDetails) return;
    const previousBoardDetails = JSON.parse(JSON.stringify(boardDetails));

    const updatedLists = boardDetails.lists.map((l) => ({
      ...l,
      cards: l.cards.map((c) =>
        c._id === cardId ? { ...c, ...updatePayload } : c,
      ),
    }));
    setBoardDetails({ ...boardDetails, lists: updatedLists });
    showToast("Card updated", "success");

    emitCardUpdated({
      boardId: currentBoardId,
      cardId,
      card: updatePayload,
      user: currentUser,
    });

    fetch(`${API_BASE}/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server card update failed");
        return res.json();
      })
      .then(() => fetchBoardDetails(currentBoardId))
      .catch((err) => {
        console.warn("Optimistic update card failed, rolling back:", err);
        setBoardDetails(previousBoardDetails);
        showToast("Card update failed on server. Reverted.", "error");
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
          showToast("Board created successfully", "success");
        }
      })
      .catch(() => {
        const newBoardId = `brd_${Date.now()}`;
        const isScrum = boardPayload.type === "SCRUM";

        const templateLists = isScrum
          ? [
              {
                _id: `lst_${Date.now()}_1`,
                board: newBoardId,
                title: "Sprint Backlog",
                position: 0,
                wipLimit: 0,
                color: "#64748B",
                cards: [],
              },
              {
                _id: `lst_${Date.now()}_2`,
                board: newBoardId,
                title: "Active Sprint",
                position: 1,
                wipLimit: 5,
                color: "#3B82F6",
                cards: [],
              },
              {
                _id: `lst_${Date.now()}_3`,
                board: newBoardId,
                title: "Testing / QA",
                position: 2,
                wipLimit: 3,
                color: "#F59E0B",
                cards: [],
              },
              {
                _id: `lst_${Date.now()}_4`,
                board: newBoardId,
                title: "Sprint Completed",
                position: 3,
                wipLimit: 0,
                color: "#10B981",
                cards: [],
              },
            ]
          : [
              {
                _id: `lst_${Date.now()}_1`,
                board: newBoardId,
                title: "Backlog",
                position: 0,
                wipLimit: 20,
                color: "#64748B",
                cards: [],
              },
              {
                _id: `lst_${Date.now()}_2`,
                board: newBoardId,
                title: "In Progress",
                position: 1,
                wipLimit: 5,
                color: "#3B82F6",
                cards: [],
              },
              {
                _id: `lst_${Date.now()}_3`,
                board: newBoardId,
                title: "In Review",
                position: 2,
                wipLimit: 3,
                color: "#8B5CF6",
                cards: [],
              },
              {
                _id: `lst_${Date.now()}_4`,
                board: newBoardId,
                title: "Done",
                position: 3,
                wipLimit: 0,
                color: "#10B981",
                cards: [],
              },
            ];

        const newBoardObj = {
          _id: newBoardId,
          workspace: currentWorkspaceId,
          name: boardPayload.name,
          key: boardPayload.key,
          type: boardPayload.type,
          accessTier: boardPayload.accessTier,
          leadId: boardPayload.leadId,
          description: boardPayload.description,
          icon: isScrum ? "Sparkles" : "Kanban",
          lists: templateLists,
          members: users,
        };

        setWorkspaces(
          workspaces.map((ws) => {
            if (ws._id === currentWorkspaceId) {
              return {
                ...ws,
                boards: [...(ws.boards || []), newBoardId],
              };
            }
            return ws;
          }),
        );

        setBoardDetails(newBoardObj);
        setCurrentBoardId(newBoardId);
        setActiveView("kanban");
        showToast("Board created locally", "success");
      });
  };

  const handleAddListColumn = () => {
    const listTitle = prompt(
      "Enter New Column / List Title (e.g., Code Review):",
    );
    if (!listTitle) return;

    if (!boardDetails) return;
    const previousBoardDetails = JSON.parse(JSON.stringify(boardDetails));

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
    showToast(`Column "${listTitle}" added`, "success");

    emitListCreated({
      boardId: currentBoardId,
      list: newListObj,
      user: currentUser,
    });

    fetch(`${API_BASE}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: currentBoardId, title: listTitle }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server list creation failed");
        return res.json();
      })
      .then(() => fetchBoardDetails(currentBoardId))
      .catch((err) => {
        console.warn("Optimistic list creation failed, rolling back:", err);
        setBoardDetails(previousBoardDetails);
        showToast(
          "Server error: Could not create list column. Reverted.",
          "error",
        );
      });
  };

  const handleUpdateList = (listId, listData) => {
    if (!boardDetails) return;
    const previousBoardDetails = JSON.parse(JSON.stringify(boardDetails));

    const updatedLists = boardDetails.lists.map((l) =>
      l._id === listId ? { ...l, ...listData } : l,
    );
    setBoardDetails({ ...boardDetails, lists: updatedLists });
    showToast("Column updated", "success");

    emitListUpdated({
      boardId: currentBoardId,
      listId,
      list: listData,
      user: currentUser,
    });

    fetch(`${API_BASE}/lists/${listId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server list update failed");
        return res.json();
      })
      .then(() => fetchBoardDetails(currentBoardId))
      .catch((err) => {
        console.warn("Optimistic update list failed, rolling back:", err);
        setBoardDetails(previousBoardDetails);
        showToast("Server error: Could not update column. Reverted.", "error");
      });
  };

  const handleDeleteList = (listId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this column and all its cards?",
      )
    )
      return;
    if (!boardDetails) return;
    const previousBoardDetails = JSON.parse(JSON.stringify(boardDetails));

    const updatedLists = boardDetails.lists.filter((l) => l._id !== listId);
    setBoardDetails({ ...boardDetails, lists: updatedLists });
    showToast("Column deleted", "info");

    emitListDeleted({
      boardId: currentBoardId,
      listId,
      user: currentUser,
    });

    fetch(`${API_BASE}/lists/${listId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server list deletion failed");
        return res.json();
      })
      .then(() => fetchBoardDetails(currentBoardId))
      .catch((err) => {
        console.warn("Optimistic delete list failed, rolling back:", err);
        setBoardDetails(previousBoardDetails);
        showToast("Server error: Could not delete column. Restored.", "error");
      });
  };

  const handleQuickAddCard = (listId, title, priority = "medium") => {
    handleCreateCard({
      listId,
      title,
      description: "",
      priority,
      storyPoints: 1,
    });
  };

  const handleDeleteCard = (cardId) => {
    if (!boardDetails) return;
    const previousBoardDetails = JSON.parse(JSON.stringify(boardDetails));

    const updatedLists = boardDetails.lists.map((l) => ({
      ...l,
      cards: l.cards.filter((c) => c._id !== cardId),
    }));
    setBoardDetails({ ...boardDetails, lists: updatedLists });
    showToast("Card deleted", "info");

    emitCardDeleted({
      boardId: currentBoardId,
      cardId,
      user: currentUser,
    });

    fetch(`${API_BASE}/cards/${cardId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server card deletion failed");
        return res.json();
      })
      .then(() => fetchBoardDetails(currentBoardId))
      .catch((err) => {
        console.warn("Optimistic delete card failed, rolling back:", err);
        setBoardDetails(previousBoardDetails);
        showToast("Server error: Could not delete card. Restored.", "error");
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

  const allCards = boardDetails?.lists
    ? boardDetails.lists.flatMap((l) => l.cards || [])
    : mockCards;

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

  if (!currentUser) {
    return (
      <LoginForm
        users={users}
        onLogin={handleLoginUser}
        onRegisterAndLogin={handleAddTeamMember}
      />
    );
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
        onLogoutUser={handleLogoutUser}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        activeBoardPeers={activeBoardPeers}
        isSocketConnected={isSocketConnected}
        notifications={notifications}
        onClearNotifications={clearNotifications}
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
          onLogoutUser={handleLogoutUser}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          activeView={activeView}
          onSelectView={(view) => setActiveView(view)}
        />

        {/* View Switcher */}
        {activeView === "settings" ? (
          <WorkspaceSettings
            workspace={currentWorkspace}
            boards={workspaceBoards}
            users={users}
            currentUser={currentUser}
            onUpdateWorkspace={handleUpdateWorkspace}
            onOpenCreateBoard={() => setIsCreateBoardModalOpen(true)}
          />
        ) : activeView === "team" ? (
          <TeamView
            currentWorkspace={currentWorkspace}
            users={users}
            currentUser={currentUser}
            boards={workspaceBoards}
            cards={allCards}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onSelectBoard={(boardId) => {
              setCurrentBoardId(boardId);
              setActiveView("kanban");
            }}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
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
            onUpdateList={handleUpdateList}
            onDeleteList={handleDeleteList}
            onQuickAddCard={handleQuickAddCard}
            onDeleteCard={handleDeleteCard}
            onMoveCard={handleMoveCard}
            onReorderLists={handleReorderLists}
            currentUser={currentUser}
            activeBoardPeers={activeBoardPeers}
            activities={boardActivities}
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

      {/* Invite Team Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onAddTeamMember={handleAddTeamMember}
      />

      {/* Day 1-2 Data Models Inspector Modal */}
      <DataModelsModal
        isOpen={isDataModelsModalOpen}
        onClose={() => setIsDataModelsModalOpen(false)}
        schemaData={schemaData}
      />

      {/* Card Details Modal (Wired with Socket instance) */}
      <CardModal
        isOpen={Boolean(activeCardId)}
        onClose={() => setActiveCardId(null)}
        card={activeCard}
        users={users}
        currentUser={currentUser}
        onUpdateCard={handleUpdateCard}
        socket={socket}
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

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}