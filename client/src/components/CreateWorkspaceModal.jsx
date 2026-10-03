import React, { useState } from 'react';
import { X, Plus, Briefcase } from 'lucide-react';

export default function CreateWorkspaceModal({ isOpen, onClose, onCreateWorkspace }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateWorkspace({
      name: name.trim(),
      description: description.trim()
    });
    setName('');
    setDescription('');
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={18} color="#4F46E5" /> Create Workspace Entity
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Workspace Name *</label>
            <input
              type="text" required placeholder="e.g. Fintech Innovation Lab"
              value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>Workspace Objective / Description</label>
            <textarea
              rows={3} placeholder="Team mission, project scope..."
              value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            style={{ marginTop: '0.5rem', background: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Plus size={16} /> Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
}

