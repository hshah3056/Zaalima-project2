import React from 'react';
import { 
  Briefcase, 
  Kanban, 
  Sparkles, 
  Palette, 
  Plus, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  FolderPlus,
  ShieldCheck,
  Cpu,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ 
  currentWorkspace, 
  boards, 
  activeBoardId, 
  onSelectBoard, 
  onOpenCreateBoard,
  onOpenCreateWorkspace,
  onOpenDataModelsModal,
  workspaceMembers,
  currentUser,
  onOpenLoginModal
}) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={16} color="#059669" />;
      case 'Palette': return <Palette size={16} color="#EC4899" />;
      default: return <Kanban size={16} color="#4F46E5" />;
    }
  };

  return (
    <aside className="glass-panel" style={{ 
      width: '280px', 
      borderRadius: 0, 
      borderTop: 0, 
      borderBottom: 0, 
      borderLeft: 0, 
      padding: '1.25rem 1rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem', 
      overflowY: 'auto',
      background: '#FFFFFF',
      borderRight: '1px solid #E2E8F0'
    }}>
      {/* Active Workspace Info */}
      <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: currentWorkspace?.color || '#4F46E5' }} />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {currentWorkspace?.name || 'Workspace'}
            </h2>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.3' }}>
          {currentWorkspace?.description || 'Collaborative Workspace'}
        </p>
      </div>

      {/* Boards Header & List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 800 }}>
            Workspace Boards ({boards.length})
          </span>
          <button
            onClick={onOpenCreateBoard}
            title="Create New Board"
            style={{
              background: '#EEF2FF',
              color: '#4F46E5',
              border: '1px solid #C7D2FE',
              borderRadius: '6px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {boards.map(b => {
            const isActive = b._id === activeBoardId;
            return (
              <button
                key={b._id}
                onClick={() => onSelectBoard(b._id)}
                style={{
                  background: isActive ? '#EEF2FF' : 'transparent',
                  border: isActive ? '1px solid #C7D2FE' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.6rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {getIcon(b.icon)}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 600, color: isActive ? '#4F46E5' : '#334155' }}>
                      {b.name}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                      KEY: {b.key}
                    </span>
                  </div>
                </div>
                {b.isFavorite && <span style={{ fontSize: '0.75rem', color: '#D97706' }}>★</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Workspace Quick Action */}
      <button
        onClick={onOpenCreateWorkspace}
        style={{
          background: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          borderRadius: '8px',
          padding: '0.6rem',
          color: '#334155',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          transition: 'all 0.15s'
        }}
      >
        <FolderPlus size={16} /> + New Workspace
      </button>

      {/* Day 1-2 Scope Widget */}
      <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '0.85rem', borderRadius: '10px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: '#4F46E5', fontSize: '0.8rem', fontWeight: 800 }}>
          <ShieldCheck size={16} /> Day 1–2 Task Scope
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: '#334155' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Workspaces Model Defined
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Boards Model Defined
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Lists Model Defined
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Cards Model Defined
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Users & User Data Panel
          </li>
        </ul>
        <button
          onClick={onOpenDataModelsModal}
          style={{
            marginTop: '0.75rem',
            width: '100%',
            background: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.45rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          View ERD Schemas →
        </button>
      </div>

      {/* Workspace Members list */}
      <div>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> Team Members ({workspaceMembers.length})
          </span>
          <button onClick={onOpenLoginModal} style={{ background: 'transparent', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>
            Switch
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {workspaceMembers.map(m => {
            const isSelf = m.userDetail?._id === currentUser?._id;
            return (
              <div key={m.user} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '0.5rem', fontSize: '0.75rem', background: isSelf ? '#EEF2FF' : 'transparent', padding: '4px 6px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <img src={m.userDetail?.avatar} alt={m.userDetail?.name} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ color: isSelf ? '#4F46E5' : '#0F172A', fontWeight: isSelf ? 700 : 600 }}>
                    {m.userDetail?.name} {isSelf && '(You)'}
                  </span>
                </div>
                <span style={{ fontSize: '0.65rem', color: '#4F46E5', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 600 }}>
                  {m.role}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

