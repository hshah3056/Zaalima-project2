import React, { useState } from 'react';
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
  Users,
  ChevronDown,
  LogOut,
  UserPlus
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
  onOpenLoginModal,
  onLogoutUser,
  onOpenInviteModal
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
        <div 
          onClick={() => setActiveView('kanban')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
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
              <span className="status-online-dot"></span> Team Workspace Active
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
          onClick={() => setActiveView('team')}
          style={{
            background: activeView === 'team' ? '#4F46E5' : 'transparent',
            color: activeView === 'team' ? '#FFFFFF' : '#475569',
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
          <Users size={15} color={activeView === 'team' ? '#FFFFFF' : '#059669'} /> Work with Team
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
          <User size={15} color={activeView === 'user_panel' ? '#FFFFFF' : '#4F46E5'} /> My Tasks ({currentUser?.name?.split(' ')[0] || 'User'})
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
          <Database size={15} color={activeView === 'models' ? '#FFFFFF' : '#0891B2'} /> ERD Models
        </button>
      </div>

      {/* Right Side User Login & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', position: 'relative' }}>
        
        {/* Active Logged In User Pill with Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => {
              if (!currentUser) {
                onOpenLoginModal();
              } else {
                setIsProfileMenuOpen(!isProfileMenuOpen);
              }
            }}
            title={currentUser ? "User Profile & Session Controls" : "Click to Login"}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              background: '#F8FAFC', 
              border: currentUser ? '1px solid #C7D2FE' : '1px solid #CBD5E1', 
              padding: '0.35rem 0.75rem', 
              borderRadius: '20px', 
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {currentUser ? (
              <>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: '#059669', border: '1px solid #FFF' }} />
                </div>
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
                <UserCheck size={16} /> Sign In / Switch User
              </span>
            )}
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && currentUser && (
            <div 
              className="glass-panel animate-modal"
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                width: '240px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-xl)',
                padding: '0.75rem',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{currentUser.email}</div>
                <span style={{ fontSize: '0.68rem', color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-block', marginTop: '4px' }}>
                  Status: Online
                </span>
              </div>

              <button
                onClick={() => {
                  setActiveView('team');
                  setIsProfileMenuOpen(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'left'
                }}
              >
                <Users size={15} color="#4F46E5" /> Work with Team Hub
              </button>

              <button
                onClick={() => {
                  onOpenInviteModal();
                  setIsProfileMenuOpen(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'left'
                }}
              >
                <UserPlus size={15} color="#059669" /> Invite Team Member
              </button>

              <button
                onClick={() => {
                  onOpenLoginModal();
                  setIsProfileMenuOpen(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'left'
                }}
              >
                <UserCheck size={15} color="#0891B2" /> Switch Account / User
              </button>

              <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onLogoutUser();
                }}
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#DC2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={15} /> Sign Out / Logout
              </button>
            </div>
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


