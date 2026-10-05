import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { mockUsers } from '../mockData';

export default function CreateBoardModal({ isOpen, onClose, currentWorkspaceId, onCreateBoard }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [type, setType] = useState('KANBAN');
  const [leadId, setLeadId] = useState(mockUsers[0]?._id || mockUsers[0]?.id || 'usr_001');
  const [accessTier, setAccessTier] = useState('OPEN');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Architectural Spec Validation Regex: ^[A-Z][A-Z0-9]{1,9}$
  const KEY_REGEX = /^[A-Z][A-Z0-9]{1,9}$/;

  const handleKeyChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setKey(val);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const formattedKey = key.trim().toUpperCase();

    // 1. Name constraint (3-80 chars)
    if (trimmedName.length < 3 || trimmedName.length > 80) {
      setError('Board name must be between 3 and 80 characters.');
      return;
    }

    // 2. Key regex validation
    if (!KEY_REGEX.test(formattedKey)) {
      setError('Project key must start with an uppercase letter and be 2-10 alphanumeric characters (e.g. CORE, MOB).');
      return;
    }

    onCreateBoard({
      workspaceId: currentWorkspaceId,
      name: trimmedName,
      key: formattedKey,
      type, // 'KANBAN' | 'SCRUM'
      leadId,
      accessTier, // 'OPEN' | 'PRIVATE' | 'RESTRICTED'
      description: description.trim()
    });

    setName('');
    setKey('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
    }}>
      <div className="glass-panel animate-modal" style={{ 
        width: '520px', 
        maxWidth: '92vw', 
        padding: '1.75rem', 
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.25rem' 
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create Project Board</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Configure project workflow, access tier, and key prefix</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Board Name */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              Project Board Name * <span style={{ color: '#94A3B8', fontWeight: 400 }}>(3–80 chars)</span>
            </label>
            <input
              type="text" required placeholder="e.g. Mobile Payment Integration"
              value={name} onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.55rem', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Board Key */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              Project Key * <span style={{ color: '#94A3B8', fontWeight: 400 }}>(2–10 uppercase chars, e.g. MOB)</span>
            </label>
            <input
              type="text" required placeholder="e.g. MOB" maxLength={10}
              value={key} onChange={handleKeyChange}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.55rem', fontSize: '0.85rem', outline: 'none', letterSpacing: '1px', fontWeight: 700 }}
            />
          </div>

          {/* Workflow Template & Access Tier */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                Workflow Template
              </label>
              <select
                value={type} onChange={(e) => setType(e.target.value)}
                style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.55rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="KANBAN">Kanban Template</option>
                <option value="SCRUM">Scrum Sprint Template</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                Access Tier
              </label>
              <select
                value={accessTier} onChange={(e) => setAccessTier(e.target.value)}
                style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.55rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="OPEN">Open (All Members)</option>
                <option value="PRIVATE">Private (Invite Only)</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
            </div>
          </div>

          {/* Project Lead */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              Project Lead
            </label>
            <select
              value={leadId} onChange={(e) => setLeadId(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.55rem', fontSize: '0.85rem' }}
            >
              {mockUsers.map((user) => (
                <option key={user._id || user.id} value={user._id || user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              Description
            </label>
            <textarea
              rows={2} placeholder="Project scope and deliverables..."
              value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.55rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '0.5rem', background: '#4F46E5', color: '#FFFFFF',
              border: 'none', padding: '0.75rem', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Plus size={16} /> Create Project Board
          </button>
        </form>
      </div>
    </div>
  );
}