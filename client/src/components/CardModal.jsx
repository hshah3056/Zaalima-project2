import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckSquare, 
  MessageSquare, 
  User, 
  Clock, 
  Tag, 
  Send, 
  Plus, 
  Trash2, 
  AlertCircle
} from 'lucide-react';

export default function CardModal({ isOpen, onClose, card, users, onUpdateCard, currentUser, socket }) {
  if (!isOpen || !card) return null;

  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority || 'medium');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState(card.subtasks || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState(card.comments || []);

  // Real-time typing state
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  // Synchronize internal state whenever active card changes
  useEffect(() => {
    setTitle(card.title || '');
    setDescription(card.description || '');
    setPriority(card.priority || 'medium');
    setSubtasks(card.subtasks || []);
    setComments(card.comments || []);
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

    // Remote comment arrival
    const handleRemoteComment = ({ cardId, comment }) => {
      if (cardId === card._id) {
        setComments((prev) => {
          if (prev.some((c) => c.id === comment.id)) return prev;
          return [...prev, comment];
        });
      }
    };

    // Remote typing indicator handlers
    const handleRemoteTyping = ({ cardId, userId, userName }) => {
      if (cardId === card._id && userId !== currentUser?._id) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === userId)) return prev;
          return [...prev, { userId, userName }];
        });
      }
    };

    const handleRemoteStoppedTyping = ({ cardId, userId }) => {
      if (cardId === card._id) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
      }
    };

    socket.on('comment_added', handleRemoteComment);
    socket.on('user_typing', handleRemoteTyping);
    socket.on('user_stopped_typing', handleRemoteStoppedTyping);

    return () => {
      socket.emit('leave_card', { cardId: card._id });
      socket.off('comment_added', handleRemoteComment);
      socket.off('user_typing', handleRemoteTyping);
      socket.off('user_stopped_typing', handleRemoteStoppedTyping);
      setTypingUsers([]);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, isOpen, card?._id, currentUser]);

  const handleToggleSubtask = (subtaskId) => {
    const updated = subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
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

  const handleCommentInputChange = (e) => {
    const val = e.target.value;
    setNewCommentText(val);

    if (!socket || !card?._id) return;

    if (val.trim()) {
      socket.emit('typing_start', {
        cardId: card._id,
        userId: currentUser?._id,
        userName: currentUser?.name || 'Teammate',
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', {
          cardId: card._id,
          userId: currentUser?._id,
        });
      }, 2000);
    } else {
      socket.emit('typing_stop', {
        cardId: card._id,
        userId: currentUser?._id,
      });
    }
  };

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
      socket.emit('typing_stop', { cardId: card._id, userId: currentUser?._id });
    }

    try {
      const res = await fetch(`http://localhost:5001/api/cards/${card._id}/comments`, {
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
          socket.emit('post_comment', { cardId: card._id, comment: data.data });
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleSaveGeneral = () => {
    if (onUpdateCard) {
      onUpdateCard(card._id, { title, description, priority });
    }
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-modal" style={{
        width: '800px',
        maxWidth: '92vw',
        maxHeight: '90vh',
        background: '#FFFFFF',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', background: '#EEF2FF', color: '#4F46E5', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
              {card.key}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Card Details</span>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#FFFFFF' }}>
          {/* Card Title */}
          <div>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
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
                outline: 'none'
              }}
            />
          </div>

          {/* Properties Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
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
                  outline: 'none'
                }}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                Assignees
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {card.assignees?.map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <img src={u.avatar} alt={u.name} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                    <span style={{ color: '#0F172A' }}>{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
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
                resize: 'vertical'
              }}
            />
          </div>

          {/* Subtasks */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckSquare size={14} /> Subtask Checklist ({completedCount}/{subtasks.length})
              </label>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                {subtaskProgress}%
              </span>
            </div>

            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', marginBottom: '0.75rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${subtaskProgress}%`, background: '#059669', transition: 'width 0.3s' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {subtasks.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem', borderRadius: '6px' }}>
                  <input
                    type="checkbox"
                    checked={s.completed}
                    onChange={() => handleToggleSubtask(s.id)}
                    style={{ accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: s.completed ? '#94A3B8' : '#0F172A', textDecoration: s.completed ? 'line-through' : 'none', flex: 1, fontWeight: s.completed ? 400 : 600 }}>
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
                  outline: 'none'
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
                  cursor: 'pointer'
                }}
              >
                + Add Subtask
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
              <MessageSquare size={14} /> Comments & Activity Stream ({comments.length})
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
              {comments.map(c => {
                const author = users.find(u => u._id === c.user) || users[0];
                return (
                  <div key={c.id} style={{ background: '#F8FAFC', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img src={author?.avatar} alt={author?.name} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{author?.name}</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ color: '#334155' }}>{c.content}</p>
                  </div>
                );
              })}
            </div>

            {/* Real-time Typing Badge */}
            {typingUsers.length > 0 && (
              <div style={{
                fontSize: '0.75rem',
                color: '#4F46E5',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#4F46E5',
                  boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)'
                }} />
                {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newCommentText}
                onChange={handleCommentInputChange}
                placeholder="Write a comment..."
                style={{
                  flex: 1,
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.45rem 0.75rem',
                  color: '#0F172A',
                  fontSize: '0.8rem',
                  outline: 'none'
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Send size={14} /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 
