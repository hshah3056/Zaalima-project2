import React, { useState } from 'react';
import { 
  Kanban, 
  Sparkles, 
  Palette, 
  Plus, 
  Users, 
  FolderPlus,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutGrid
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
  onOpenLoginModal,
  activeView,
  onSelectView
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={16} color="#059669" />;
      case 'Palette': return <Palette size={16} color="#EC4899" />;
      default: return <Kanban size={16} color="#4F46E5" />;
    }
  };

  return (
    <aside style={{ 
      width: isCollapsed ? '64px' : '280px', 
      minWidth: isCollapsed ? '64px' : '280px',
      padding: isCollapsed ? '1rem 0.5rem' : '1.25rem 1rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.25rem', 
      overflowY: 'auto',
      background: '#FFFFFF', 
      borderRight: '1px solid #E2E8F0',
      transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    }}>
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        style={{
          position: 'absolute',
          top: '14px',
          right: isCollapsed ? '18px' : '12px',
          background: '#F1F5F9',
          border: '1px solid #CBD5E1',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#475569',
          zIndex: 10
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Active Workspace Info */}
      {!isCollapsed ? (
        <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: currentWorkspace?.color || '#4F46E5', flexShrink: 0 }} />
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentWorkspace?.name || 'Workspace'}
            </h2>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: '1.3', margin: 0 }}>
            {currentWorkspace?.description || 'Collaborative Workspace'}
          </p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: currentWorkspace?.color || '#4F46E5' }} title={currentWorkspace?.name} />
        </div>
      )}

      {/* Navigation Sections */}
      <div>
        {!isCollapsed && (
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 800, marginBottom: '0.5rem' }}>
            Views
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button
            onClick={() => onSelectView('kanban')}
            title="Board Canvas"
            style={{
              background: activeView === 'kanban' ? '#EEF2FF' : 'transparent',
              border: activeView === 'kanban' ? '1px solid #C7D2FE' : '1px solid transparent',
              borderRadius: '8px',
              padding: isCollapsed ? '0.6rem 0' : '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '0.6rem',
              cursor: 'pointer',
              color: activeView === 'kanban' ? '#4F46E5' : '#334155',
              fontWeight: 700,
              fontSize: '0.82rem'
            }}
          >
            <LayoutGrid size={16} />
            {!isCollapsed && <span>Board Canvas</span>}
          </button>

          <button
            onClick={() => onSelectView('settings')}
            title="Workspace Settings"
            style={{
              background: activeView === 'settings' ? '#EEF2FF' : 'transparent',
              border: activeView === 'settings' ? '1px solid #C7D2FE' : '1px solid transparent',
              borderRadius: '8px',
              padding: isCollapsed ? '0.6rem 0' : '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '0.6rem',
              cursor: 'pointer',
              color: activeView === 'settings' ? '#4F46E5' : '#334155',
              fontWeight: 700,
              fontSize: '0.82rem'
            }}
          >
            <Settings size={16} />
            {!isCollapsed && <span>Workspace Settings</span>}
          </button>
        </div>
      </div>

      {/* Boards Header & List */}
      <div>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 800 }}>
              Boards ({boards.length})
            </span>
            <button
              onClick={onOpenCreateBoard}
              title="Create New Board"
              style={{
                background: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE',
                borderRadius: '6px',
                padding: '0.15rem 0.45rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        ) : (
          <div style={{ height: '1px', background: '#E2E8F0', margin: '0.25rem 0' }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {boards.map(b => {
            const isActive = b._id === activeBoardId && activeView === 'kanban';
            return (
              <button
                key={b._id}
                onClick={() => {
                  onSelectBoard(b._id);
                  onSelectView('kanban');
                }}
                title={`${b.name} (${b.key})`}
                style={{
                  background: isActive ? '#EEF2FF' : 'transparent',
                  border: isActive ? '1px solid #C7D2FE' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: isCollapsed ? '0.6rem 0' : '0.5rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  {getIcon(b.icon)}
                  {!isCollapsed && (
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 600, color: isActive ? '#4F46E5' : '#334155', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {b.name}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {b.key}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Workspace Button */}
      {!isCollapsed && (
        <button
          onClick={onOpenCreateWorkspace}
          style={{
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '8px',
            padding: '0.5rem',
            color: '#334155',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <FolderPlus size={15} /> + New Workspace
        </button>
      )}

      {/* Team Members List */}
      {!isCollapsed && (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} /> Team ({workspaceMembers.length})
            </span>
            <button onClick={onOpenLoginModal} style={{ background: 'transparent', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>
              Switch
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {workspaceMembers.slice(0, 4).map(m => {
              const isSelf = m.user === currentUser?._id || m.user === currentUser?.id;
              return (
                <div key={m.user} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', padding: '3px 4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ color: isSelf ? '#4F46E5' : '#334155', fontWeight: isSelf ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.user} {isSelf && '(You)'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}