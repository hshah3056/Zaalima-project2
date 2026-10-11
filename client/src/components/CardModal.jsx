import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckSquare, 
  MessageSquare, 
  User, 
  Clock, 
  Send, 
  Trash2, 
  CornerDownRight,
  Smile,
  Edit2,
  CheckCircle2,
  AtSign,
  ChevronDown,
  ChevronRight,
  Check
} from 'lucide-react';

const API_BASE = "http://localhost:5001/api";

const QUICK_REACTIONS = ['👍', '❤️', '🚀', '🎉', '👀', '💡'];

export default function CardModal({ 
  isOpen, 
  onClose, 
  card, 
  users = [], 
  onUpdateCard, 
  currentUser, 
  socket 
}) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState(card?.priority || 'medium');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState(card?.subtasks || []);
  
  // Comment threads state
  const [comments, setComments] = useState(card?.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);
  const [collapsedThreads, setCollapsedThreads] = useState(new Set());
  const [threadFilter, setThreadFilter] = useState('all'); // 'all' | 'open' | 'resolved'

  // Real-time typing indicators state
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const replyTypingTimeoutRef = useRef({});

  // Synchronize internal state whenever active card changes
  useEffect(() => {
    if (!card) return;
    setTitle(card.title || '');
    setDescription(card.description || '');
    setPriority(card.priority || 'medium');
    setSubtasks(card.subtasks || []);
    setComments(card.comments || []);
    setReplyingToId(null);
    setEditingCommentId(null);
    setActiveReactionMenuId(null);
  }, [card]);

  // Card-Level Room Scoping & Real-Time Listeners
  useEffect(() => {
    if (!socket || !isOpen || !card?._id) return;

    // Join Card Modal Room
    socket.emit('join_card', {
      cardId: card._id,
      userId: currentUser?._id,
      userName: currentUser?.name || 'Teammate',
    });

    // Remote comment added
    const handleRemoteCommentAdded = ({ cardId, comment }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          if (prev.some((c) => c.id === comment.id)) return prev;
          const updated = [...prev, comment];
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

    // Remote comment updated (edited)
    const handleRemoteCommentUpdated = ({ cardId, comment }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          const updated = prev.map((c) => (c.id === comment.id ? comment : c));
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

    // Remote comment deleted (cascading)
    const handleRemoteCommentDeleted = ({ cardId, commentId }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          const updated = prev.filter((c) => c.id !== commentId && c.parentId !== commentId);
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

    // Remote reaction toggle
    const handleRemoteReaction = ({ cardId, commentId, reactions }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          const updated = prev.map((c) => (c.id === commentId ? { ...c, reactions } : c));
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

    // Remote thread resolved toggle
    const handleRemoteResolved = ({ cardId, commentId, isResolved }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          const updated = prev.map((c) => (c.id === commentId ? { ...c, isResolved } : c));
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

    // Remote typing indicator handlers
    const handleRemoteTyping = ({ cardId, userId, userName, avatar, threadId }) => {
      if (cardId === card._id && userId !== currentUser?._id) {
        setTypingUsers((prev) => {
          const existingIdx = prev.findIndex((u) => u.userId === userId && u.threadId === threadId);
          if (existingIdx > -1) {
            const next = [...prev];
            next[existingIdx] = { userId, userName, avatar, threadId, timestamp: Date.now() };
            return next;
          }
          return [...prev, { userId, userName, avatar, threadId, timestamp: Date.now() }];
        });
      }
    };

    const handleRemoteStoppedTyping = ({ cardId, userId, threadId }) => {
      if (cardId === card._id) {
        setTypingUsers((prev) =>
          prev.filter((u) => !(u.userId === userId && (!threadId || u.threadId === threadId)))
        );
      }
    };

    socket.on('comment_added', handleRemoteCommentAdded);
    socket.on('comment_updated', handleRemoteCommentUpdated);
    socket.on('comment_deleted', handleRemoteCommentDeleted);
    socket.on('comment_reaction', handleRemoteReaction);
    socket.on('comment_resolved', handleRemoteResolved);
    socket.on('user_typing', handleRemoteTyping);
    socket.on('user_stopped_typing', handleRemoteStoppedTyping);

    return () => {
      socket.emit('leave_card', { cardId: card._id });
      socket.off('comment_added', handleRemoteCommentAdded);
      socket.off('comment_updated', handleRemoteCommentUpdated);
      socket.off('comment_deleted', handleRemoteCommentDeleted);
      socket.off('comment_reaction', handleRemoteReaction);
      socket.off('comment_resolved', handleRemoteResolved);
      socket.off('user_typing', handleRemoteTyping);
      socket.off('user_stopped_typing', handleRemoteStoppedTyping);
      setTypingUsers([]);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      Object.values(replyTypingTimeoutRef.current).forEach((t) => clearTimeout(t));
    };
  }, [socket, isOpen, card?._id, currentUser, onUpdateCard]);

  // Clean stale typing indicators every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => prev.filter((u) => now - (u.timestamp || now) < 5000));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helpers
  const getUser = (userId) => {
    return users.find((u) => u._id === userId) || {
      _id: userId,
      name: 'Teammate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    };
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderCommentContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(@[a-zA-Z0-9_\s]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="mention-pill">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Subtask handlers
  const handleToggleSubtask = (subtaskId) => {
    const updated = subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s));
    setSubtasks(updated);
    if (onUpdateCard) onUpdateCard(card._id, { subtasks: updated });
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt = { id: `st_${Date.now()}`, title: newSubtaskTitle.trim(), completed: false };
    const updated = [...subtasks, newSt];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    if (onUpdateCard) onUpdateCard(card._id, { subtasks: updated });
  };

  const handleSaveGeneral = () => {
    if (onUpdateCard) {
      onUpdateCard(card._id, { title, description, priority });
    }
  };

  // Typing Emitter Helpers
  const handleMainCommentInputChange = (e) => {
    const val = e.target.value;
    setNewCommentText(val);

    if (!socket || !card?._id) return;

    if (val.trim()) {
      socket.emit('typing_start', {
        cardId: card._id,
        userId: currentUser?._id,
        userName: currentUser?.name || 'Teammate',
        avatar: currentUser?.avatar,
        threadId: null,
        boardId: card.board,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', {
          cardId: card._id,
          userId: currentUser?._id,
          threadId: null,
          boardId: card.board,
        });
      }, 2500);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('typing_stop', {
        cardId: card._id,
        userId: currentUser?._id,
        threadId: null,
        boardId: card.board,
      });
    }
  };

  const handleReplyInputChange = (threadId, val) => {
    setReplyTextMap((prev) => ({ ...prev, [threadId]: val }));

    if (!socket || !card?._id) return;

    if (val.trim()) {
      socket.emit('typing_start', {
        cardId: card._id,
        userId: currentUser?._id,
        userName: currentUser?.name || 'Teammate',
        avatar: currentUser?.avatar,
        threadId,
        boardId: card.board,
      });

      if (replyTypingTimeoutRef.current[threadId]) {
        clearTimeout(replyTypingTimeoutRef.current[threadId]);
      }
      replyTypingTimeoutRef.current[threadId] = setTimeout(() => {
        socket.emit('typing_stop', {
          cardId: card._id,
          userId: currentUser?._id,
          threadId,
          boardId: card.board,
        });
      }, 2500);
    } else {
      if (replyTypingTimeoutRef.current[threadId]) {
        clearTimeout(replyTypingTimeoutRef.current[threadId]);
      }
      socket.emit('typing_stop', {
        cardId: card._id,
        userId: currentUser?._id,
        threadId,
        boardId: card.board,
      });
    }
  };

  // Add Top-Level Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const payload = {
      userId: currentUser?._id || users[0]?._id || 'usr_001',
      content: newCommentText.trim(),
    };

    setNewCommentText('');

    if (socket && card?._id) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('typing_stop', {
        cardId: card._id,
        userId: currentUser?._id,
        threadId: null,
        boardId: card.board,
      });
    }

    try {
      const res = await fetch(`${API_BASE}/cards/${card._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        const updatedList = [...comments, data.data];
        setComments(updatedList);
        if (onUpdateCard) {
          onUpdateCard(card._id, { comments: updatedList });
        }
        if (socket) {
          socket.emit('post_comment', { cardId: card._id, comment: data.data, boardId: card.board });
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  // Add Thread Reply
  const handleAddReply = async (threadId) => {
    const replyText = replyTextMap[threadId] || '';
    if (!replyText.trim()) return;

    const payload = {
      userId: currentUser?._id || users[0]?._id || 'usr_001',
      content: replyText.trim(),
      parentId: threadId,
    };

    setReplyTextMap((prev) => ({ ...prev, [threadId]: '' }));
    setReplyingToId(null);

    if (socket && card?._id) {
      if (replyTypingTimeoutRef.current[threadId]) {
        clearTimeout(replyTypingTimeoutRef.current[threadId]);
      }
      socket.emit('typing_stop', {
        cardId: card._id,
        userId: currentUser?._id,
        threadId,
        boardId: card.board,
      });
    }

    try {
      const res = await fetch(`${API_BASE}/cards/${card._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        const updatedList = [...comments, data.data];
        setComments(updatedList);
        if (onUpdateCard) {
          onUpdateCard(card._id, { comments: updatedList });
        }
        if (socket) {
          socket.emit('post_comment', { cardId: card._id, comment: data.data, boardId: card.board });
        }
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  // Edit Comment / Reply
  const handleSaveEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/cards/${card._id}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editCommentText.trim() }),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        const updatedList = comments.map((c) => (c.id === commentId ? data.data : c));
        setComments(updatedList);
        setEditingCommentId(null);
        setEditCommentText('');
        if (onUpdateCard) {
          onUpdateCard(card._id, { comments: updatedList });
        }
        if (socket) {
          socket.emit('comment_updated', { cardId: card._id, comment: data.data, boardId: card.board });
        }
      }
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  // Delete Comment / Reply
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${API_BASE}/cards/${card._id}/comments/${commentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.status === 'success') {
        const updatedList = comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
        setComments(updatedList);
        if (onUpdateCard) {
          onUpdateCard(card._id, { comments: updatedList });
        }
        if (socket) {
          socket.emit('comment_deleted', { cardId: card._id, commentId, boardId: card.board });
        }
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // Toggle Reaction
  const handleToggleReaction = async (commentId, emoji) => {
    const currentUserId = currentUser?._id || 'usr_001';
    setActiveReactionMenuId(null);

    // Optimistic local update
    const updatedList = comments.map((c) => {
      if (c.id !== commentId) return c;
      const reactions = { ...(c.reactions || {}) };
      const current = reactions[emoji] || [];
      const idx = current.indexOf(currentUserId);
      if (idx > -1) {
        const nextList = current.filter((u) => u !== currentUserId);
        if (nextList.length === 0) delete reactions[emoji];
        else reactions[emoji] = nextList;
      } else {
        reactions[emoji] = [...current, currentUserId];
      }
      return { ...c, reactions };
    });

    setComments(updatedList);
    if (onUpdateCard) onUpdateCard(card._id, { comments: updatedList });

    try {
      const res = await fetch(`${API_BASE}/cards/${card._id}/comments/${commentId}/reactions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, userId: currentUserId }),
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        if (socket) {
          socket.emit('comment_reaction', {
            cardId: card._id,
            commentId,
            reactions: data.data,
            boardId: card.board,
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  // Toggle Thread Resolution
  const handleToggleResolveThread = async (rootCommentId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic update
    const updatedList = comments.map((c) =>
      c.id === rootCommentId ? { ...c, isResolved: newStatus } : c
    );
    setComments(updatedList);
    if (onUpdateCard) onUpdateCard(card._id, { comments: updatedList });

    try {
      const res = await fetch(`${API_BASE}/cards/${card._id}/comments/${rootCommentId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: newStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        if (socket) {
          socket.emit('comment_resolved', {
            cardId: card._id,
            commentId: rootCommentId,
            isResolved: newStatus,
            boardId: card.board,
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle thread resolution:', err);
    }
  };

  // Toggle Collapse of Thread Replies
  const toggleCollapseThread = (threadId) => {
    setCollapsedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
  };

  // Thread Data Structuring
  const rootComments = comments.filter((c) => !c.parentId);
  const getThreadReplies = (rootId) => comments.filter((c) => c.parentId === rootId);

  const filteredRootComments = rootComments.filter((root) => {
    if (threadFilter === 'open') return !root.isResolved;
    if (threadFilter === 'resolved') return root.isResolved;
    return true;
  });

  const mainTypingUsers = typingUsers.filter((u) => !u.threadId);
  const getThreadTypingUsers = (threadId) => typingUsers.filter((u) => u.threadId === threadId);

  const completedCount = subtasks.filter((s) => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  if (!isOpen || !card) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel animate-modal"
        style={{
          width: '840px',
          maxWidth: '94vw',
          maxHeight: '92vh',
          background: '#FFFFFF',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.1rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                background: '#EEF2FF',
                color: '#4F46E5',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                border: '1px solid #E0E7FF',
              }}
            >
              {card.key}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Card Details & Collaboration Hub
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            background: '#FFFFFF',
          }}
        >
          {/* Card Title */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: '#64748B',
                fontWeight: 800,
                display: 'block',
                marginBottom: '0.4rem',
              }}
            >
              Card Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveGeneral}
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                color: '#0F172A',
                fontSize: '1.1rem',
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          {/* Properties Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              background: '#F8FAFC',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  fontWeight: 800,
                  display: 'block',
                  marginBottom: '0.3rem',
                }}
              >
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  if (onUpdateCard) onUpdateCard(card._id, { priority: e.target.value });
                }}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  fontWeight: 800,
                  display: 'block',
                  marginBottom: '0.3rem',
                }}
              >
                Assignees
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {card.assignees?.map((u, i) => (
                  <div
                    key={u._id || i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                    />
                    <span style={{ color: '#0F172A' }}>{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: '#64748B',
                fontWeight: 800,
                display: 'block',
                marginBottom: '0.4rem',
              }}
            >
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveGeneral}
              placeholder="Add details, technical acceptance criteria..."
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.75rem',
                color: '#0F172A',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.4rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#64748B',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckSquare size={14} /> Subtask Checklist ({completedCount}/{subtasks.length})
              </label>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                {subtaskProgress}%
              </span>
            </div>

            <div
              style={{
                height: '6px',
                background: '#E2E8F0',
                borderRadius: '3px',
                marginBottom: '0.75rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${subtaskProgress}%`,
                  background: '#059669',
                  transition: 'width 0.3s',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {subtasks.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    padding: '0.5rem',
                    borderRadius: '6px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={s.completed}
                    onChange={() => handleToggleSubtask(s.id)}
                    style={{ accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: s.completed ? '#94A3B8' : '#0F172A',
                      textDecoration: s.completed ? 'line-through' : 'none',
                      flex: 1,
                      fontWeight: s.completed ? 400 : 600,
                    }}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask..."
                style={{
                  flex: 1,
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.45rem 0.75rem',
                  color: '#0F172A',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Add Subtask
              </button>
            </form>
          </div>

          {/* ========================================================================= */}
          {/* Card-Level Comment Threads & Real-Time Typing Indicators                 */}
          {/* ========================================================================= */}
          <div
            style={{
              borderTop: '1px solid #E2E8F0',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Header & Thread Filter Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  color: '#475569',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MessageSquare size={16} color="#4F46E5" />
                Comment Threads ({comments.length})
              </label>

              {/* Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  background: '#F1F5F9',
                  borderRadius: '8px',
                  padding: '2px',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  className={`thread-tab ${threadFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setThreadFilter('all')}
                >
                  All ({rootComments.length})
                </button>
                <button
                  type="button"
                  className={`thread-tab ${threadFilter === 'open' ? 'active' : ''}`}
                  onClick={() => setThreadFilter('open')}
                >
                  Open ({rootComments.filter((r) => !r.isResolved).length})
                </button>
                <button
                  type="button"
                  className={`thread-tab ${threadFilter === 'resolved' ? 'active' : ''}`}
                  onClick={() => setThreadFilter('resolved')}
                >
                  Resolved ({rootComments.filter((r) => r.isResolved).length})
                </button>
              </div>
            </div>

            {/* Comment Threads List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {filteredRootComments.length === 0 ? (
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px dashed #CBD5E1',
                    borderRadius: '10px',
                    padding: '1.75rem',
                    textAlign: 'center',
                    color: '#64748B',
                    fontSize: '0.85rem',
                  }}
                >
                  <MessageSquare size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, color: '#475569' }}>
                    {threadFilter === 'resolved'
                      ? 'No resolved comment threads yet.'
                      : threadFilter === 'open'
                      ? 'No open discussions on this card.'
                      : 'No comments yet.'}
                  </p>
                  <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                    Start a conversation with your team below. Supports @mentions, threaded replies, and emoji reactions!
                  </p>
                </div>
              ) : (
                filteredRootComments.map((rootComment) => {
                  const author = getUser(rootComment.user);
                  const replies = getThreadReplies(rootComment.id);
                  const isCollapsed = collapsedThreads.has(rootComment.id);
                  const isEditing = editingCommentId === rootComment.id;
                  const isReplying = replyingToId === rootComment.id;
                  const isResolved = Boolean(rootComment.isResolved);
                  const threadTyping = getThreadTypingUsers(rootComment.id);

                  return (
                    <div
                      key={rootComment.id}
                      style={{
                        position: 'relative',
                        background: isResolved ? '#F8FAFC' : '#FFFFFF',
                        border: isResolved ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
                        borderRadius: '12px',
                        padding: '1rem',
                        boxShadow: 'var(--shadow-xs)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Thread connector line if replies exist and not collapsed */}
                      {replies.length > 0 && !isCollapsed && <div className="thread-branch-line" />}

                      {/* Top-Level Root Comment Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img
                            src={author?.avatar}
                            alt={author?.name}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: '2px solid #FFFFFF',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
                                {author?.name}
                              </span>
                              {isResolved && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    background: '#DCFCE7',
                                    color: '#15803D',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Check size={10} /> Resolved
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {formatRelativeTime(rootComment.createdAt)}
                              {rootComment.updatedAt && rootComment.updatedAt !== rootComment.createdAt && (
                                <span style={{ fontStyle: 'italic', marginLeft: '4px' }}>(edited)</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Top-Level Actions (Resolve, Edit, Delete) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <button
                            type="button"
                            title={isResolved ? 'Reopen Thread' : 'Mark Thread as Resolved'}
                            onClick={() => handleToggleResolveThread(rootComment.id, isResolved)}
                            style={{
                              background: isResolved ? '#F1F5F9' : '#F0FDF4',
                              color: isResolved ? '#64748B' : '#16A34A',
                              border: isResolved ? '1px solid #CBD5E1' : '1px solid #BBF7D0',
                              borderRadius: '6px',
                              padding: '3px 7px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={12} />
                            {isResolved ? 'Reopen' : 'Resolve'}
                          </button>

                          {(currentUser?._id === rootComment.user || !currentUser) && (
                            <>
                              <button
                                type="button"
                                title="Edit comment"
                                onClick={() => {
                                  setEditingCommentId(rootComment.id);
                                  setEditCommentText(rootComment.content);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#64748B',
                                  cursor: 'pointer',
                                  padding: '3px',
                                  borderRadius: '4px',
                                }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                title="Delete thread"
                                onClick={() => handleDeleteComment(rootComment.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#EF4444',
                                  cursor: 'pointer',
                                  padding: '3px',
                                  borderRadius: '4px',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Comment Body or Inline Editor */}
                      {isEditing ? (
                        <div style={{ marginTop: '0.4rem', marginLeft: '34px' }}>
                          <textarea
                            rows={2}
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #4F46E5',
                              fontSize: '0.85rem',
                              background: '#FFFFFF',
                              color: '#0F172A',
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => handleSaveEditComment(rootComment.id)}
                              className="btn-primary"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            marginLeft: '34px',
                            color: '#1E293B',
                            fontSize: '0.85rem',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {renderCommentContent(rootComment.content)}
                        </div>
                      )}

                      {/* Reactions & Reply Action Bar */}
                      <div
                        style={{
                          marginLeft: '34px',
                          marginTop: '0.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* Render existing reactions */}
                        {rootComment.reactions &&
                          Object.entries(rootComment.reactions).map(([emoji, userIds]) => {
                            if (!userIds || userIds.length === 0) return null;
                            const hasReacted = userIds.includes(currentUser?._id || 'usr_001');
                            return (
                              <button
                                key={emoji}
                                type="button"
                                className={`reaction-pill ${hasReacted ? 'reacted' : ''}`}
                                onClick={() => handleToggleReaction(rootComment.id, emoji)}
                                title={`Reacted by: ${userIds
                                  .map((uid) => getUser(uid).name)
                                  .join(', ')}`}
                              >
                                <span>{emoji}</span>
                                <span>{userIds.length}</span>
                              </button>
                            );
                          })}

                        {/* Reaction Picker Button & Popover */}
                        <div style={{ position: 'relative' }}>
                          <button
                            type="button"
                            title="Add reaction"
                            onClick={() =>
                              setActiveReactionMenuId(
                                activeReactionMenuId === rootComment.id ? null : rootComment.id
                              )
                            }
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: '12px',
                              padding: '2px 7px',
                              fontSize: '0.75rem',
                              color: '#64748B',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Smile size={12} />
                            <span>+</span>
                          </button>

                          {activeReactionMenuId === rootComment.id && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: 0,
                                marginBottom: '4px',
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                borderRadius: '18px',
                                padding: '4px 8px',
                                display: 'flex',
                                gap: '6px',
                                boxShadow: 'var(--shadow-md)',
                                zIndex: 20,
                              }}
                            >
                              {QUICK_REACTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleToggleReaction(rootComment.id, emoji)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    transition: 'transform 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reply Button */}
                        <button
                          type="button"
                          onClick={() => setReplyingToId(isReplying ? null : rootComment.id)}
                          style={{
                            background: isReplying ? '#EEF2FF' : 'transparent',
                            color: isReplying ? '#4F46E5' : '#64748B',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          <CornerDownRight size={13} />
                          {isReplying ? 'Cancel Reply' : 'Reply'}
                        </button>

                        {/* Collapse / Expand Replies Button */}
                        {replies.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCollapseThread(rootComment.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#4F46E5',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              marginLeft: 'auto',
                            }}
                          >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                            {isCollapsed
                              ? `Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
                              : `Hide replies (${replies.length})`}
                          </button>
                        )}
                      </div>

                      {/* Nested Thread Replies */}
                      {!isCollapsed && replies.length > 0 && (
                        <div
                          style={{
                            marginLeft: '28px',
                            marginTop: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem',
                            paddingLeft: '12px',
                          }}
                        >
                          {replies.map((reply) => {
                            const replyAuthor = getUser(reply.user);
                            const isReplyEditing = editingCommentId === reply.id;

                            return (
                              <div
                                key={reply.id}
                                style={{
                                  background: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '10px',
                                  padding: '0.65rem 0.85rem',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                }}
                              >
                                {/* Reply Header */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.35rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <img
                                      src={replyAuthor?.avatar}
                                      alt={replyAuthor?.name}
                                      style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        border: '1px solid #E2E8F0',
                                      }}
                                    />
                                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0F172A' }}>
                                      {replyAuthor?.name}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                                      {formatRelativeTime(reply.createdAt)}
                                      {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                                        <span style={{ fontStyle: 'italic', marginLeft: '4px' }}>
                                          (edited)
                                        </span>
                                      )}
                                    </span>
                                  </div>

                                  {(currentUser?._id === reply.user || !currentUser) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <button
                                        type="button"
                                        title="Edit reply"
                                        onClick={() => {
                                          setEditingCommentId(reply.id);
                                          setEditCommentText(reply.content);
                                        }}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: '#64748B',
                                          cursor: 'pointer',
                                          padding: '2px',
                                        }}
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        title="Delete reply"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: '#EF4444',
                                          cursor: 'pointer',
                                          padding: '2px',
                                        }}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Reply Body or Inline Edit */}
                                {isReplyEditing ? (
                                  <div style={{ marginTop: '0.3rem', marginLeft: '26px' }}>
                                    <textarea
                                      rows={2}
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '0.45rem',
                                        borderRadius: '6px',
                                        border: '1px solid #4F46E5',
                                        fontSize: '0.8rem',
                                        background: '#FFFFFF',
                                        color: '#0F172A',
                                      }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditComment(reply.id)}
                                        className="btn-primary"
                                        style={{ padding: '2px 7px', fontSize: '0.7rem' }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCommentId(null)}
                                        className="btn-secondary"
                                        style={{ padding: '2px 7px', fontSize: '0.7rem' }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      marginLeft: '26px',
                                      color: '#334155',
                                      fontSize: '0.8rem',
                                      lineHeight: 1.45,
                                      whiteSpace: 'pre-wrap',
                                    }}
                                  >
                                    {renderCommentContent(reply.content)}
                                  </div>
                                )}

                                {/* Reply Reactions */}
                                <div
                                  style={{
                                    marginLeft: '26px',
                                    marginTop: '0.4rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  {reply.reactions &&
                                    Object.entries(reply.reactions).map(([emoji, userIds]) => {
                                      if (!userIds || userIds.length === 0) return null;
                                      const hasReacted = userIds.includes(currentUser?._id || 'usr_001');
                                      return (
                                        <button
                                          key={emoji}
                                          type="button"
                                          className={`reaction-pill ${hasReacted ? 'reacted' : ''}`}
                                          onClick={() => handleToggleReaction(reply.id, emoji)}
                                          style={{ padding: '1px 5px', fontSize: '0.7rem' }}
                                        >
                                          <span>{emoji}</span>
                                          <span>{userIds.length}</span>
                                        </button>
                                      );
                                    })}

                                  {/* Quick reaction popover for reply */}
                                  <div style={{ position: 'relative' }}>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveReactionMenuId(
                                          activeReactionMenuId === reply.id ? null : reply.id
                                        )
                                      }
                                      style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #CBD5E1',
                                        borderRadius: '10px',
                                        padding: '1px 5px',
                                        fontSize: '0.7rem',
                                        color: '#64748B',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Smile size={11} /> +
                                    </button>

                                    {activeReactionMenuId === reply.id && (
                                      <div
                                        style={{
                                          position: 'absolute',
                                          bottom: '100%',
                                          left: 0,
                                          marginBottom: '3px',
                                          background: '#FFFFFF',
                                          border: '1px solid #CBD5E1',
                                          borderRadius: '16px',
                                          padding: '3px 6px',
                                          display: 'flex',
                                          gap: '4px',
                                          boxShadow: 'var(--shadow-md)',
                                          zIndex: 20,
                                        }}
                                      >
                                        {QUICK_REACTIONS.map((emoji) => (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => handleToggleReaction(reply.id, emoji)}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              fontSize: '0.9rem',
                                              cursor: 'pointer',
                                              padding: '1px',
                                            }}
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Thread-Specific Live Typing Indicator */}
                      {threadTyping.length > 0 && (
                        <div
                          className="typing-bubble animate-fade-in"
                          style={{
                            marginLeft: '34px',
                            marginTop: '0.6rem',
                            display: 'inline-flex',
                          }}
                        >
                          <img
                            src={threadTyping[0].avatar || getUser(threadTyping[0].userId).avatar}
                            alt={threadTyping[0].userName}
                            style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                          />
                          <span>
                            {threadTyping.map((u) => u.userName.split(' ')[0]).join(', ')} is replying...
                          </span>
                          <div className="typing-dots">
                            <span />
                            <span />
                            <span />
                          </div>
                        </div>
                      )}

                      {/* Thread Reply Input Form */}
                      {isReplying && (
                        <div
                          style={{
                            marginLeft: '28px',
                            marginTop: '0.75rem',
                            paddingLeft: '12px',
                          }}
                        >
                          <div
                            style={{
                              background: '#F8FAFC',
                              border: '1px solid #C7D2FE',
                              borderRadius: '8px',
                              padding: '0.65rem',
                              boxShadow: 'var(--shadow-xs)',
                            }}
                          >
                            <textarea
                              rows={2}
                              value={replyTextMap[rootComment.id] || ''}
                              onChange={(e) => handleReplyInputChange(rootComment.id, e.target.value)}
                              onKeyDown={(e) => {
                                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddReply(rootComment.id);
                                }
                              }}
                              placeholder={`Reply to ${author?.name || 'this thread'}... (Ctrl+Enter to send)`}
                              style={{
                                width: '100%',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '6px',
                                padding: '0.45rem 0.65rem',
                                fontSize: '0.8rem',
                                color: '#0F172A',
                                outline: 'none',
                                resize: 'vertical',
                              }}
                              autoFocus
                            />

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '0.4rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                                  💡 Press Cmd/Ctrl+Enter
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setReplyingToId(null)}
                                  className="btn-secondary"
                                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddReply(rootComment.id)}
                                  className="btn-primary"
                                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                                >
                                  <Send size={12} /> Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Main Thread Live Typing Indicator */}
            {mainTypingUsers.length > 0 && (
              <div
                className="typing-bubble animate-fade-in"
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '0.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-2px' }}>
                  {mainTypingUsers.map((u) => (
                    <img
                      key={u.userId}
                      src={u.avatar || getUser(u.userId).avatar}
                      alt={u.userName}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '1.5px solid #FFFFFF',
                        marginRight: '-4px',
                      }}
                    />
                  ))}
                </div>
                <span style={{ marginLeft: mainTypingUsers.length > 1 ? '8px' : '4px' }}>
                  {mainTypingUsers.map((u) => u.userName).join(', ')}{' '}
                  {mainTypingUsers.length === 1 ? 'is' : 'are'} typing a comment...
                </span>
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {/* Post New Top-Level Comment Form */}
            <form
              onSubmit={handleAddComment}
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '0.75rem',
                marginTop: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <img
                  src={
                    currentUser?.avatar ||
                    users[0]?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
                  }
                  alt={currentUser?.name || 'User'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1.5px solid #CBD5E1',
                    marginTop: '2px',
                  }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={handleMainCommentInputChange}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment(e);
                      }
                    }}
                    placeholder="Write a comment or thread... Type @ to mention teammates (Cmd+Enter to send)"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '0.6rem 0.8rem',
                      color: '#0F172A',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />

                  {/* Quick Mentions Bar & Action Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                    }}
                  >
                    {/* Mention Suggestions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#64748B',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <AtSign size={12} /> Mention:
                      </span>
                      {users.slice(0, 4).map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => {
                            setNewCommentText((prev) => `${prev} @${u.name.replace(/\s+/g, '')} `);
                          }}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '1px 6px',
                            fontSize: '0.7rem',
                            color: '#475569',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            style={{ width: '12px', height: '12px', borderRadius: '50%' }}
                          />
                          {u.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="btn-primary"
                      style={{
                        padding: '0.45rem 1rem',
                        fontSize: '0.8rem',
                        opacity: newCommentText.trim() ? 1 : 0.6,
                        cursor: newCommentText.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Send size={14} /> Send Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
