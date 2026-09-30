import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function CreateBoardModal({ isOpen, onClose, currentWorkspaceId, onCreateBoard }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [type, setType] = useState('kanban');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateBoard({
      workspaceId: currentWorkspaceId,
      name: name.trim(),
      key: key.trim().toUpperCase() || name.trim().slice(0, 4).toUpperCase(),
      type,
      description: description.trim()
    });
    setName('');
    setKey('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }}>
      <div className="glass-panel animate-modal" style={{ 
        width: '480px', 
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Create Workspace Board</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Board Name *</label>
            <input
              type="text" required placeholder="e.g. Mobile App Sprint"
              value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Board Key Prefix</label>
            <input
              type="text" placeholder="e.g. MOB" maxLength={5}
              value={key} onChange={(e) => setKey(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', outline: 'none', textTransform: 'uppercase' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Workflow Type</label>
            <select
              value={type} onChange={(e) => setType(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="kanban">Kanban Board (Lists & Columns)</option>
              <option value="scrum">Scrum Sprint Board</option>
              <option value="table">Grid / Table Matrix</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ marginTop: '0.5rem', background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Plus size={16} /> Create Board
          </button>
        </form>
      </div>
    </div>
  );
}

