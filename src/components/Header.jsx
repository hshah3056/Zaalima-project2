import React from 'react';
import { 
  Zap, 
  Layers, 
  Database, 
  Plus, 
  Search, 
  UserCheck, 
  Sparkles,
  RefreshCw,
  Code2,
  User,
  ChevronDown
} from 'lucide-react';

export default function Header({ 
  currentWorkspace, 
  workspaces, 
  onSelectWorkspace, 
  onOpenDataModelsModal, 
  onOpenCreateTask,
  onOpenCreateBoard,
  onResetData,
  activeView,
  setActiveView,
  users,
  currentUser,
  onOpenLoginModal
}) {
  return (
    <header className="glass-panel" style={{ 
      borderRadius: 0, 
      borderTop: 0, 
      borderLeft: 0, 
      borderRight: 0, 
      padding: '0.75rem 1.5rem', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      zIndex: 30,
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand & Workspace Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
          }}>
            <Zap size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              PULSE<span style={{ color: '#4F46E5' }}>WORK</span>
            </h1>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="status-online-dot"></span> Day 1-2 MERN Active
            </span>
          </div>
        </div>

        <div style={{ height: '24px', width: '1px', background: '#E2E8F0' }} />

        {/* Workspace Dropdown Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Workspace:</span>
          <select 
            value={currentWorkspace?._id || ''} 
            onChange={(e) => onSelectWorkspace(e.target.value)}
            style={{
              background: '#F8FAFC',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {workspaces.map(ws => (
              <option key={ws._id} value={ws._id}>
                {ws.name} ({ws.boards?.length || 0} boards)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle View Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        <button
          onClick={() => setActiveView('kanban')}
          style={{
            background: activeView === 'kanban' ? '#4F46E5' : 'transparent',
            color: activeView === 'kanban' ? '#FFFFFF' : '#475569',
            border: 'none',
            padding: '0.4rem 0.9rem',
            borderRadius: '7px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s'
          }}
        >
          <Layers size={15} /> Board Canvas
        </button>

        <button
          onClick={() => setActiveView('user_panel')}
          style={{
            background: activeView === 'user_panel' ? '#4F46E5' : 'transparent',
            color: activeView === 'user_panel' ? '#FFFFFF' : '#475569',
            border: 'none',
            padding: '0.4rem 0.9rem',
            borderRadius: '7px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s'
          }}
        >
          <User size={15} color={activeView === 'user_panel' ? '#FFFFFF' : '#4F46E5'} /> User Panel ({currentUser?.name?.split(' ')[0] || 'User'})
        </button>

        <button
          onClick={onOpenDataModelsModal}
          style={{
            background: activeView === 'models' ? '#4F46E5' : 'transparent',
            color: activeView === 'models' ? '#FFFFFF' : '#475569',
            border: 'none',
            padding: '0.4rem 0.9rem',
            borderRadius: '7px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s'
          }}
        >
          <Database size={15} color={activeView === 'models' ? '#FFFFFF' : '#0891B2'} /> Day 1–2 ERD Models
        </button>
      </div>

      {/* Right Side User Login & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* Active Logged In User Pill */}
        <div 
          onClick={onOpenLoginModal}
          title="Click to Switch User / Login"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            background: '#F8FAFC', 
            border: '1px solid #CBD5E1', 
            padding: '0.35rem 0.75rem', 
            borderRadius: '20px', 
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          {currentUser ? (
            <>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', lineHeight: '1.1' }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#4F46E5', fontWeight: 600, textTransform: 'capitalize' }}>
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown size={14} color="#64748B" />
            </>
          ) : (
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={16} /> Login User
            </span>
          )}
        </div>

        <button 
          onClick={onResetData}
          title="Reset Seed Data"
          style={{
            background: '#F1F5F9',
            border: '1px solid #CBD5E1',
            color: '#64748B',
            padding: '0.45rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} />
        </button>

        <button
          onClick={onOpenCreateTask}
          style={{
            background: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
          }}
        >
          <Plus size={16} /> Create Card
        </button>
      </div>
    </header>
  );
}

