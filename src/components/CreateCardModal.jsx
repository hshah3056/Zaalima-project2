import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function CreateCardModal({ isOpen, onClose, defaultListId, lists, onCreateCard }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [listId, setListId] = useState(defaultListId || lists[0]?._id || '');
  const [storyPoints, setStoryPoints] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !listId) return;
    onCreateCard({
      title: title.trim(),
      description: description.trim(),
      priority,
      listId,
      storyPoints: Number(storyPoints)
    });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-modal" style={{ 
        width: '500px', 
        maxWidth: '90vw', 
        padding: '1.5rem', 
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.25rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Create New Task Card</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Target List Column</label>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {lists.map(l => (
                <option key={l._id} value={l._id}>{l.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement WebSocket presence heartbeat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Description</label>
            <textarea
              rows={3}
              placeholder="Detailed description or requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Story Points</label>
              <input
                type="number"
                min={1}
                max={13}
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ marginTop: '0.5rem', background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Plus size={16} /> Create Task Card
          </button>
        </form>
      </div>
    </div>
  );
}

