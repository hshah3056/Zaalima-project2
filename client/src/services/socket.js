import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("⚡ [Socket Client] Connected to server:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ [Socket Client] Disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.warn("⚠️ [Socket Client] Connection error:", error.message);
});

// Helper Emitters
export const registerUser = (userId, userName) => {
  if (socket.connected) {
    socket.emit("register_user", { userId, userName });
  }
};

export const joinBoardRoom = (boardId, userId, userName) => {
  if (socket.connected && boardId) {
    socket.emit("join_board", { boardId, userId, userName });
  }
};

export const leaveBoardRoom = (boardId) => {
  if (socket.connected && boardId) {
    socket.emit("leave_board", { boardId });
  }
};

export const emitCardMoved = (data) => {
  if (socket.connected) {
    socket.emit("card_moved", data);
  }
};

export const emitCardCreated = (data) => {
  if (socket.connected) {
    socket.emit("card_created", data);
  }
};

export const emitCardUpdated = (data) => {
  if (socket.connected) {
    socket.emit("card_updated", data);
  }
};

export const emitCardDeleted = (data) => {
  if (socket.connected) {
    socket.emit("card_deleted", data);
  }
};

export const emitListCreated = (data) => {
  if (socket.connected) {
    socket.emit("list_created", data);
  }
};

export const emitListUpdated = (data) => {
  if (socket.connected) {
    socket.emit("list_updated", data);
  }
};

export const emitListReordered = (data) => {
  if (socket.connected) {
    socket.emit("list_reordered", data);
  }
};

export const emitListDeleted = (data) => {
  if (socket.connected) {
    socket.emit("list_deleted", data);
  }
};

// Card-level comment thread & typing indicator emitters
export const joinCardRoom = (cardId, userId, userName) => {
  if (socket.connected && cardId) {
    socket.emit("join_card", { cardId, userId, userName });
  }
};

export const leaveCardRoom = (cardId) => {
  if (socket.connected && cardId) {
    socket.emit("leave_card", { cardId });
  }
};

export const emitTypingStart = ({ cardId, userId, userName, avatar, threadId, boardId }) => {
  if (socket.connected && cardId) {
    socket.emit("typing_start", { cardId, userId, userName, avatar, threadId, boardId });
  }
};

export const emitTypingStop = ({ cardId, userId, threadId, boardId }) => {
  if (socket.connected && cardId) {
    socket.emit("typing_stop", { cardId, userId, threadId, boardId });
  }
};

export const emitPostComment = ({ cardId, comment, boardId }) => {
  if (socket.connected && cardId) {
    socket.emit("post_comment", { cardId, comment, boardId });
  }
};

export const emitCommentUpdated = ({ cardId, comment, boardId }) => {
  if (socket.connected && cardId) {
    socket.emit("comment_updated", { cardId, comment, boardId });
  }
};

export const emitCommentDeleted = ({ cardId, commentId, boardId }) => {
  if (socket.connected && cardId) {
    socket.emit("comment_deleted", { cardId, commentId, boardId });
  }
};

export const emitCommentReaction = ({ cardId, commentId, reactions, boardId }) => {
  if (socket.connected && cardId) {
    socket.emit("comment_reaction", { cardId, commentId, reactions, boardId });
  }
};

export const emitCommentResolved = ({ cardId, commentId, isResolved, boardId }) => {
  if (socket.connected && cardId) {
    socket.emit("comment_resolved", { cardId, commentId, isResolved, boardId });
  }
};
