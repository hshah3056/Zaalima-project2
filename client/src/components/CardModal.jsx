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
  Check,
  Calendar,
  Tag,
  Layers,
  Copy,
  CheckCheck,
  AlertCircle,
  FileText,
  AlignLeft,
  Sparkles,
  Hash,
  UserPlus
} from 'lucide-react';

const API_BASE = "http://localhost:5001/api";
const QUICK_REACTIONS = ['👍', '❤️', '🚀', '🎉', '👀', '💡'];

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#EF4444', bg: '#FEF2F2', icon: '🔴' },
  high: { label: 'High', color: '#F97316', bg: '#FFF7ED', icon: '🟠' },
  medium: { label: 'Medium', color: '#EAB308', bg: '#FEFCE8', icon: '🟡' },
  low: { label: 'Low', color: '#10B981', bg: '#ECFDF5', icon: '🟢' },
};

export default function CardModal({ 
  isOpen, 
  onClose, 
  card, 
  users = [], 
  onUpdateCard, 
  onDeleteCard,
  boardLists = [],
  boardName = 'Sprint Board',
  currentUser, 
  socket 
}) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState(card?.priority || 'medium');
  const [status, setStatus] = useState(card?.status || 'in_progress');
  const [currentListId, setCurrentListId] = useState(card?.list || '');
  const [dueDate, setDueDate] = useState(card?.dueDate ? card.dueDate.split('T')[0] : '');
  const [storyPoints, setStoryPoints] = useState(card?.storyPoints || 0);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState(card?.subtasks || []);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

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
    setStatus(card.status || 'in_progress');
    setCurrentListId(card.list || '');
    setDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
    setStoryPoints(card.storyPoints || 0);
    setSubtasks(card.subtasks || []);
    setComments(card.comments || []);
    setReplyingToId(null);
    setEditingCommentId(null);
    setActiveReactionMenuId(null);
  }, [card]);

  // Card-Level Room Scoping & Real-Time Listeners
  useEffect(() => {
    if (!socket || !isOpen || !card?._id) return;

    socket.emit('join_card', {
      cardId: card._id,
      userId: currentUser?._id,
      userName: currentUser?.name || 'Teammate',
    });

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

    const handleRemoteCommentUpdated = ({ cardId, comment }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          const updated = prev.map((c) => (c.id === comment.id ? comment : c));
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

    const handleRemoteCommentDeleted = ({ cardId, commentId }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          const updated = prev.filter((c) => c.id !== commentId && c.parentId !== commentId);
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

    const handleRemoteReaction = ({ cardId, commentId, reactions }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          const updated = prev.map((c) => (c.id === commentId ? { ...c, reactions } : c));
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

    const handleRemoteResolved = ({ cardId, commentId, isResolved }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          const updated = prev.map((c) => (c.id === commentId ? { ...c, isResolved } : c));
          if (onUpdateCard) onUpdateCard(card._id, { comments: updated });
          return updated;
        });
      }
    };

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
    if (!userId) return null;
    const resolvedId = typeof userId === 'object' ? userId._id : userId;
    return users.find((u) => u._id === resolvedId) || (typeof userId === 'object' ? userId : {
      _id: resolvedId,
      name: 'Teammate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    });
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

  const handleCopyKey = () => {
    if (card?.key) {
      navigator.clipboard.writeText(card.key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // Subtask handlers
  const handleToggleSubtask = (subtaskId) => {
    const updated = subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s));
    setSubtasks(updated);
    if (onUpdateCard) onUpdateCard(card._id, { subtasks: updated });
  };

  const handleDeleteSubtask = (subtaskId) => {
    const updated = subtasks.filter((s) => s.id !== subtaskId);
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

  // Save General Attributes
  const handleSaveField = (fields) => {
    if (onUpdateCard && card?._id) {
      onUpdateCard(card._id, fields);
    }
  };

  // Toggle Assignee
  const handleToggleAssignee = (userId) => {
    const currentAssigneeIds = (card?.assignees || []).map(a => typeof a === 'object' ? a._id : a);
    let nextAssigneeIds;
    if (currentAssigneeIds.includes(userId)) {
      nextAssigneeIds = currentAssigneeIds.filter(id => id !== userId);
    } else {
      nextAssigneeIds = [...currentAssigneeIds, userId];
    }
    handleSaveField({ assignees: nextAssigneeIds });
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

  // Resolve current list name
  const currentList = boardLists.find(l => l._id === (currentListId || card?.list));
  const reporterUser = getUser(card?.reporter);
  const assigneeUsers = (card?.assignees || []).map(a => getUser(a)).filter(Boolean);

  if (!isOpen || !card) return null;

  // Reusable Comment Node Renderer
  const renderCommentItem = (item, isReply = false, rootId = null) => {
    const author = getUser(item.user);
    const isEditing = editingCommentId === item.id;
    const isResolved = Boolean(item.isResolved);
    const replies = !isReply ? getThreadReplies(item.id) : [];
    const isCollapsed = !isReply && collapsedThreads.has(item.id);
    const isReplying = !isReply && replyingToId === item.id;
    const threadTyping = !isReply ? getThreadTypingUsers(item.id) : [];

    return (
      <div
        key={item.id}
        style={{
          position: 'relative',
          background: isReply ? '#F8FAFC' : isResolved ? '#F8FAFC' : '#FFFFFF',
          border: isResolved ? '1px solid #E2E8F0' : '1px solid #E2E8F0',
          borderRadius: isReply ? '10px' : '12px',
          padding: isReply ? '0.75rem 0.95rem' : '1rem 1.15rem',
          boxShadow: isReply ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Thread branch line if root with uncollapsed replies */}
        {!isReply && replies.length > 0 && !isCollapsed && <div className="thread-branch-line" />}

        {/* Comment Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <img
              src={author?.avatar}
              alt={author?.name}
              style={{
                width: isReply ? '24px' : '30px',
                height: isReply ? '24px' : '30px',
                borderRadius: '50%',
                border: '1.5px solid #FFFFFF',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: isReply ? '0.8rem' : '0.85rem', color: '#0F172A' }}>
                  {author?.name}
                </span>
                {!isReply && isResolved && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontWeight: 700,
                      padding: '1px 7px',
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
                {formatRelativeTime(item.createdAt)}
                {item.updatedAt && item.updatedAt !== item.createdAt && (
                  <span style={{ fontStyle: 'italic', marginLeft: '4px' }}>(edited)</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {!isReply && (
              <button
                type="button"
                title={isResolved ? 'Reopen Thread' : 'Mark Thread as Resolved'}
                onClick={() => handleToggleResolveThread(item.id, isResolved)}
                style={{
                  background: isResolved ? '#F1F5F9' : '#F0FDF4',
                  color: isResolved ? '#64748B' : '#16A34A',
                  border: isResolved ? '1px solid #CBD5E1' : '1px solid #BBF7D0',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={12} />
                {isResolved ? 'Reopen' : 'Resolve'}
              </button>
            )}

            {(currentUser?._id === item.user || !currentUser) && (
              <>
                <button
                  type="button"
                  title="Edit comment"
                  onClick={() => {
                    setEditingCommentId(item.id);
                    setEditCommentText(item.content);
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
                  title={isReply ? 'Delete reply' : 'Delete thread'}
                  onClick={() => handleDeleteComment(item.id)}
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

        {/* Comment Body / Inline Editor */}
        {isEditing ? (
          <div style={{ marginTop: '0.4rem', marginLeft: isReply ? '28px' : '36px' }}>
            <textarea
              rows={2}
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #6366F1',
                fontSize: '0.82rem',
                background: '#FFFFFF',
                color: '#0F172A',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleSaveEditComment(item.id)}
                className="btn-primary"
                style={{ padding: '3px 9px', fontSize: '0.75rem' }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingCommentId(null)}
                className="btn-secondary"
                style={{ padding: '3px 9px', fontSize: '0.75rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginLeft: isReply ? '28px' : '36px',
              color: '#1E293B',
              fontSize: '0.84rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {renderCommentContent(item.content)}
          </div>
        )}

        {/* Reactions & Action Bar */}
        <div
          style={{
            marginLeft: isReply ? '28px' : '36px',
            marginTop: '0.55rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Reaction badges */}
          {item.reactions &&
            Object.entries(item.reactions).map(([emoji, userIds]) => {
              if (!userIds || userIds.length === 0) return null;
              const hasReacted = userIds.includes(currentUser?._id || 'usr_001');
              return (
                <button
                  key={emoji}
                  type="button"
                  className={`reaction-pill ${hasReacted ? 'reacted' : ''}`}
                  onClick={() => handleToggleReaction(item.id, emoji)}
                  title={`Reacted by: ${userIds.map((u) => getUser(u)?.name).join(', ')}`}
                >
                  <span>{emoji}</span>
                  <span>{userIds.length}</span>
                </button>
              );
            })}

          {/* Add Reaction Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveReactionMenuId(activeReactionMenuId === item.id ? null : item.id)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '2px 7px',
                fontSize: '0.72rem',
                color: '#64748B',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
              title="Add reaction"
            >
              <Smile size={12} />
              <span>+</span>
            </button>

            {activeReactionMenuId === item.id && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '4px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '20px',
                  padding: '4px 8px',
                  display: 'flex',
                  gap: '6px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                  zIndex: 30,
                }}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleToggleReaction(item.id, emoji)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      padding: '2px',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply Button (Only on root comments) */}
          {!isReply && (
            <button
              type="button"
              onClick={() => setReplyingToId(isReplying ? null : item.id)}
              style={{
                background: isReplying ? '#EEF2FF' : 'transparent',
                color: isReplying ? '#4F46E5' : '#64748B',
                border: 'none',
                fontSize: '0.74rem',
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
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}

          {/* Collapse/Expand Replies Toggle */}
          {!isReply && replies.length > 0 && (
            <button
              type="button"
              onClick={() => toggleCollapseThread(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4F46E5',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                marginLeft: 'auto',
              }}
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
              {isCollapsed
                ? `Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
                : `Hide replies (${replies.length})`}
            </button>
          )}
        </div>

        {/* Nested Thread Replies Container */}
        {!isReply && !isCollapsed && replies.length > 0 && (
          <div
            style={{
              marginLeft: '26px',
              marginTop: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              paddingLeft: '10px',
            }}
          >
            {replies.map((reply) => renderCommentItem(reply, true, item.id))}
          </div>
        )}

        {/* Thread-Level Typing Indicator */}
        {!isReply && threadTyping.length > 0 && (
          <div
            style={{
              marginLeft: '36px',
              marginTop: '0.5rem',
              fontSize: '0.72rem',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>
              {threadTyping.map((u) => u.userName).join(', ')} is typing a reply
            </span>
            <div className="typing-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {/* Inline Reply Composer Form */}
        {!isReply && isReplying && (
          <div
            style={{
              marginLeft: '26px',
              marginTop: '0.75rem',
              paddingLeft: '10px',
              borderLeft: '2px solid #E0E7FF',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <img
                src={currentUser?.avatar || users[0]?.avatar}
                alt="You"
                style={{ width: '24px', height: '24px', borderRadius: '50%', marginTop: '4px' }}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  rows={2}
                  value={replyTextMap[item.id] || ''}
                  onChange={(e) => handleReplyInputChange(item.id, e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleAddReply(item.id);
                    }
                  }}
                  placeholder={`Reply to ${author?.name || 'thread'}... (Cmd+Enter to send)`}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    color: '#0F172A',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setReplyingToId(null)}
                    className="btn-secondary"
                    style={{ padding: '3px 9px', fontSize: '0.74rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddReply(item.id)}
                    disabled={!(replyTextMap[item.id] || '').trim()}
                    className="btn-primary"
                    style={{
                      padding: '3px 10px',
                      fontSize: '0.74rem',
                      opacity: (replyTextMap[item.id] || '').trim() ? 1 : 0.6,
                    }}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="card-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card-modal-dialog">
        {/* Top Header Bar */}
        <div className="card-modal-header">
          {/* Left Breadcrumb & Key */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.78rem', fontWeight: 600 }}>
              <Layers size={14} style={{ color: '#6366F1' }} />
              <span>{boardName}</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#0F172A', fontWeight: 700 }}>{currentList?.title || 'Board'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
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
              <button
                type="button"
                onClick={handleCopyKey}
                title="Copy issue key"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedKey ? '#10B981' : '#94A3B8',
                  cursor: 'pointer',
                  padding: '3px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {copiedKey ? <CheckCheck size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '12px',
                background: PRIORITY_CONFIG[priority]?.bg || '#FEFCE8',
                color: PRIORITY_CONFIG[priority]?.color || '#EAB308',
                border: `1px solid ${PRIORITY_CONFIG[priority]?.color}33`,
                textTransform: 'capitalize',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{PRIORITY_CONFIG[priority]?.icon}</span>
              <span>{priority} Priority</span>
            </span>

            <button
              onClick={onClose}
              title="Close (Esc)"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2-Column Body Layout */}
        <div className="card-modal-body">
          {/* ========================================================================= */}
          {/* Left Column: Title, Description, Subtasks, Activity/Comments              */}
          {/* ========================================================================= */}
          <div className="card-modal-main">
            {/* Issue Title Input (Multiline Auto-wrap) */}
            <div>
              <textarea
                rows={Math.max(1, Math.min(3, Math.ceil((title || '').length / 45)))}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleSaveField({ title })}
                placeholder="Issue title..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  color: '#0F172A',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  outline: 'none',
                  lineHeight: '1.35',
                  transition: 'all 0.15s ease',
                  marginLeft: '-6px',
                  resize: 'none',
                  fontFamily: 'inherit',
                  display: 'block',
                }}
                onFocus={(e) => (e.currentTarget.style.border = '1px solid #6366F1')}
                onBlurCapture={(e) => (e.currentTarget.style.border = '1px solid transparent')}
              />
            </div>

            {/* Description Section */}
            <div>
              <div className="card-section-title">
                <AlignLeft size={15} style={{ color: '#6366F1' }} />
                <span>Description</span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSaveField({ description })}
                placeholder="Add a detailed description, acceptance criteria, or technical architecture notes..."
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  color: '#0F172A',
                  fontSize: '0.86rem',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: '1.55',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366F1';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#F8FAFC';
                }}
              />
            </div>

            {/* Subtasks Checklist Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div className="card-section-title" style={{ marginBottom: 0 }}>
                  <CheckSquare size={15} style={{ color: '#10B981' }} />
                  <span>Subtasks</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'none' }}>
                    ({completedCount} of {subtasks.length} completed)
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                  {subtaskProgress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', marginBottom: '0.85rem', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${subtaskProgress}%`,
                    background: subtaskProgress === 100 ? '#10B981' : '#6366F1',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* Subtask list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
                {subtasks.map((s) => (
                  <div key={s.id} className="subtask-row">
                    <input
                      type="checkbox"
                      checked={s.completed}
                      onChange={() => handleToggleSubtask(s.id)}
                      style={{ accentColor: '#10B981', cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                    <span
                      style={{
                        fontSize: '0.84rem',
                        color: s.completed ? '#94A3B8' : '#0F172A',
                        textDecoration: s.completed ? 'line-through' : 'none',
                        flex: 1,
                        fontWeight: s.completed ? 400 : 600,
                      }}
                    >
                      {s.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(s.id)}
                      title="Delete subtask"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#CBD5E1',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new subtask..."
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    color: '#0F172A',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="btn-primary"
                  style={{
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.8rem',
                    opacity: newSubtaskTitle.trim() ? 1 : 0.6,
                    cursor: newSubtaskTitle.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  + Add
                </button>
              </form>
            </div>

            {/* Activity & Comment Threads Section */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div className="card-section-title" style={{ marginBottom: 0 }}>
                  <MessageSquare size={15} style={{ color: '#6366F1' }} />
                  <span>Activity & Discussions</span>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '2px', borderRadius: '8px', gap: '2px' }}>
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

              {/* Main Comment Composer */}
              <form onSubmit={handleAddComment} style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <img
                      src={currentUser?.avatar || users[0]?.avatar}
                      alt="Your avatar"
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1.5px solid #FFFFFF',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    />
                    <div style={{ flex: 1 }}>
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
                        placeholder="Write a comment or thread... Type @ to mention teammates (Cmd+Enter to post)"
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#0F172A',
                          fontSize: '0.86rem',
                          outline: 'none',
                          resize: 'vertical',
                          lineHeight: '1.5',
                        }}
                      />

                      {/* Mentions & Post Action Row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid #F1F5F9',
                          paddingTop: '0.6rem',
                          marginTop: '0.4rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        {/* Quick Mentions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
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
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                padding: '2px 7px',
                                fontSize: '0.72rem',
                                color: '#475569',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <img src={u.avatar} alt={u.name} style={{ width: '13px', height: '13px', borderRadius: '50%' }} />
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
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Send size={13} /> Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Typing Indicator Display */}
                {mainTypingUsers.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#4F46E5',
                      fontWeight: 600,
                      marginTop: '0.5rem',
                      paddingLeft: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {mainTypingUsers.map((u) => (
                        <img
                          key={u.userId}
                          src={u.avatar}
                          alt={u.userName}
                          style={{ width: '18px', height: '18px', borderRadius: '50%' }}
                        />
                      ))}
                    </div>
                    <span>{mainTypingUsers.map((u) => u.userName).join(', ')} is typing...</span>
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </form>

              {/* Comment Threads List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredRootComments.length === 0 ? (
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '12px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      color: '#64748B',
                      fontSize: '0.85rem',
                    }}
                  >
                    <MessageSquare size={26} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600, color: '#475569' }}>
                      {threadFilter === 'resolved'
                        ? 'No resolved threads yet.'
                        : threadFilter === 'open'
                        ? 'No open discussions on this card.'
                        : 'No comments yet.'}
                    </p>
                    <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                      Start a discussion with your team above. Supports @mentions, threaded replies, and emoji reactions!
                    </p>
                  </div>
                ) : (
                  filteredRootComments.map((rootComment) => renderCommentItem(rootComment))
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Right Column: Properties & Metadata Sidebar                               */}
          {/* ========================================================================= */}
          <div className="card-modal-sidebar">
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Properties & Details
            </div>

            {/* Status / List Selector */}
            <div className="sidebar-prop-row">
              <label className="sidebar-prop-label">Status & Column</label>
              <select
                className="sidebar-select"
                value={currentListId || card.list}
                onChange={(e) => {
                  const newList = e.target.value;
                  setCurrentListId(newList);
                  const foundL = boardLists.find(l => l._id === newList);
                  const newStatus = foundL ? (foundL.title.toLowerCase().includes('done') ? 'completed' : 'in_progress') : 'in_progress';
                  setStatus(newStatus);
                  handleSaveField({ list: newList, status: newStatus });
                }}
              >
                {boardLists.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="sidebar-prop-row">
              <label className="sidebar-prop-label">Priority</label>
              <select
                className="sidebar-select"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  handleSaveField({ priority: e.target.value });
                }}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            {/* Assignees Selector & Avatars */}
            <div className="sidebar-prop-row">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="sidebar-prop-label">Assignees</label>
                <button
                  type="button"
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6366F1',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <UserPlus size={12} /> {showAssigneeDropdown ? 'Done' : '+ Assign'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {assigneeUsers.length === 0 ? (
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic' }}>Unassigned</span>
                ) : (
                  assigneeUsers.map((u) => (
                    <div
                      key={u._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        padding: '4px 8px',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={u.avatar} alt={u.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>{u.name}</span>
                      </div>
                      {showAssigneeDropdown && (
                        <button
                          type="button"
                          onClick={() => handleToggleAssignee(u._id)}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Assignee selection dropdown when toggled */}
              {showAssigneeDropdown && (
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px',
                    marginTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                >
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', padding: '2px 4px' }}>
                    Toggle teammates:
                  </span>
                  {users.map((u) => {
                    const isAssigned = (card?.assignees || []).some(a => (a._id || a) === u._id);
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleToggleAssignee(u._id)}
                        style={{
                          background: isAssigned ? '#EEF2FF' : 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img src={u.avatar} alt={u.name} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                          <span style={{ fontWeight: isAssigned ? 700 : 500, color: isAssigned ? '#4F46E5' : '#1E293B' }}>
                            {u.name}
                          </span>
                        </div>
                        {isAssigned && <Check size={12} style={{ color: '#4F46E5' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reporter */}
            <div className="sidebar-prop-row">
              <label className="sidebar-prop-label">Reporter</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  padding: '4px 8px',
                  borderRadius: '8px',
                }}
              >
                <img
                  src={reporterUser?.avatar || users[1]?.avatar}
                  alt={reporterUser?.name || 'Reporter'}
                  style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                  {reporterUser?.name || 'Sarah Chen'}
                </span>
              </div>
            </div>

            {/* Story Points */}
            <div className="sidebar-prop-row">
              <label className="sidebar-prop-label">Story Points</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={storyPoints}
                  onChange={(e) => {
                    const pts = parseInt(e.target.value, 10) || 0;
                    setStoryPoints(pts);
                    handleSaveField({ storyPoints: pts });
                  }}
                  style={{
                    width: '70px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Points (Fibonacci)</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="sidebar-prop-row">
              <label className="sidebar-prop-label">Target Due Date</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '4px 8px',
                }}
              >
                <Calendar size={14} style={{ color: '#6366F1' }} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    handleSaveField({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null });
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#0F172A',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    outline: 'none',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            {/* Labels / Tags */}
            <div className="sidebar-prop-row">
              <label className="sidebar-prop-label">Labels</label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {card.labels && card.labels.length > 0 ? (
                  card.labels.map((lbl, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: `${lbl.color || '#6366F1'}18`,
                        color: lbl.color || '#4F46E5',
                        border: `1px solid ${lbl.color || '#6366F1'}40`,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <Tag size={10} />
                      {lbl.name}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>No labels</span>
                )}
              </div>
            </div>

            {/* Metadata Timestamps */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.72rem',
                color: '#94A3B8',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Created:</span>
                <span style={{ fontWeight: 600, color: '#64748B' }}>
                  {card.createdAt ? formatRelativeTime(card.createdAt) : 'Recently'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Updated:</span>
                <span style={{ fontWeight: 600, color: '#64748B' }}>
                  {card.updatedAt ? formatRelativeTime(card.updatedAt) : 'Just now'}
                </span>
              </div>
            </div>

            {/* Danger Zone: Delete Card */}
            {onDeleteCard && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${card.key}: "${card.title}"?`)) {
                    onDeleteCard(card._id);
                    onClose();
                  }
                }}
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  color: '#EF4444',
                  borderRadius: '8px',
                  padding: '0.55rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  marginTop: '0.5rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FEF2F2')}
              >
                <Trash2 size={13} /> Delete Issue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
