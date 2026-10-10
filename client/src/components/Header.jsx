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
  UserPlus,
  Bell,
  CheckCheck,
  Trash2,
  Inbox
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
  onOpenInviteModal,
  activeBoardPeers = [],
  onOpenSearchModal,
  notifications = [],
  unreadCount = 0,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onDeleteNotification,
  onNotificationClick
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.isRead;
    return true;
  });

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
              <span className="status-online-dot"></span> Socket.io Live {activeBoardPeers?.length > 0 ? `(${activeBoardPeers.length + 1} online)` : '(Online)'}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
        
        {/* Task Search Engine Trigger Button */}
        <button
          onClick={onOpenSearchModal}
          title="Search Tasks (Cmd+K or Ctrl+K)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.82rem',
            color: '#64748B',
            fontWeight: 600,
            transition: 'all 0.15s'
          }}
        >
          <Search size={15} color="#4F46E5" />
          <span>Search tasks...</span>
          <kbd style={{
            background: '#E2E8F0',
            color: '#475569',
            borderRadius: '4px',
            padding: '1px 5px',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            fontWeight: 700
          }}>⌘K</kbd>
        </button>

        {/* In-App Notification Center Drawer Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
            title="In-App Notification Center"
            style={{
              position: 'relative',
              background: isNotificationMenuOpen ? '#EEF2FF' : '#F8FAFC',
              border: isNotificationMenuOpen ? '1px solid #818CF8' : '1px solid #CBD5E1',
              color: unreadCount > 0 ? '#4F46E5' : '#64748B',
              padding: '0.45rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                borderRadius: '10px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Popover */}
          {isNotificationMenuOpen && (
            <div
              className="glass-panel animate-modal"
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                width: '380px',
                maxWidth: '92vw',
                maxHeight: '480px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Header Bar */}
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={16} color="#4F46E5" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.7rem', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#4F46E5',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9', background: '#FFFFFF', padding: '4px 8px' }}>
                <button
                  onClick={() => setNotifFilter('all')}
                  style={{
                    flex: 1,
                    padding: '4px',
                    border: 'none',
                    background: notifFilter === 'all' ? '#F1F5F9' : 'transparent',
                    color: notifFilter === 'all' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  style={{
                    flex: 1,
                    padding: '4px',
                    border: 'none',
                    background: notifFilter === 'unread' ? '#F1F5F9' : 'transparent',
                    color: notifFilter === 'unread' ? '#0F172A' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* List Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {filteredNotifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8' }}>
                    <Inbox size={32} style={{ marginBottom: '0.5rem', color: '#CBD5E1' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>No notifications</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>You're all caught up!</div>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead && onMarkNotificationRead) onMarkNotificationRead(n._id);
                        if (onNotificationClick) onNotificationClick(n);
                        setIsNotificationMenuOpen(false);
                      }}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        background: n.isRead ? '#FFFFFF' : '#F4F7FF',
                        border: n.isRead ? '1px solid #F1F5F9' : '1px solid #C7D2FE',
                        marginBottom: '0.4rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        transition: 'all 0.12s'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                          {!n.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4F46E5' }} />}
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>{n.title}</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#475569', margin: 0, lineHeight: 1.35 }}>{n.message}</p>
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '4px', display: 'inline-block' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteNotification) onDeleteNotification(n._id);
                        }}
                        title="Delete notification"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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



