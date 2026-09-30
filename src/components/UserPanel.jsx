import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Folder, 
  Kanban, 
  Layers, 
  Tag, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Sliders, 
  Filter, 
  Search,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function UserPanel({ 
  currentUser, 
  users, 
  workspaces, 
  boards, 
  cards, 
  lists, 
  onCardClick, 
  onSelectBoard,
  onOpenLoginModal,
  onUpdateCardStatus 
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userDashboardData, setUserDashboardData] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    // Fetch live user dashboard data from backend
    fetch(`http://localhost:5001/api/users/${currentUser._id}/dashboard`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setUserDashboardData(res.data);
        }
      })
      .catch(() => {
        // Local state calculation fallback
      });
  }, [currentUser, cards]);

  if (!currentUser) {
    return (
      <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <UserCheck size={48} color="#94A3B8" />
        <h2 style={{ marginTop: '1rem', color: '#0F172A', fontWeight: 800 }}>No User Currently Logged In</h2>
        <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Please log in to view your personalized task panel and workspace data.</p>
        <button
          onClick={onOpenLoginModal}
          style={{
            background: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Open Login Screen
        </button>
      </div>
    );
  }

  // Filter assigned cards
  const allUserAssignedCards = cards.filter(c => c.assignees && c.assignees.some(a => (a._id || a) === currentUser._id));
  
  const filteredCards = allUserAssignedCards.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    if (searchQuery.trim() && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.key.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Calculate user metrics
  const totalAssigned = allUserAssignedCards.length;
  const inProgressCount = allUserAssignedCards.filter(c => c.status === 'in_progress' || c.status === 'todo').length;
  const completedCount = allUserAssignedCards.filter(c => c.status === 'done' || c.status === 'completed').length;
  const totalStoryPoints = allUserAssignedCards.reduce((acc, c) => acc + (Number(c.storyPoints) || 0), 0);
  
  // Workspaces user belongs to
  const userWorkspaces = workspaces.filter(w => w.members && w.members.some(m => (m.user || m) === currentUser._id));

  return (
    <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* User Header Profile Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #EEF2FF', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)' }} 
            />
            <span 
              title={currentUser.status}
              style={{ 
                position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', 
                borderRadius: '50%', background: '#059669', border: '2px solid #FFFFFF' 
              }} 
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {currentUser.name}
              </h1>
              <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                {currentUser.role}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
              {currentUser.email} • Workspace Active Panel Session
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.5rem 1rem', borderRadius: '10px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Active Workspaces</span>
            <strong style={{ fontSize: '1.1rem', color: '#0F172A' }}>{userWorkspaces.length}</strong>
          </div>

          <button
            onClick={onOpenLoginModal}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <UserCheck size={16} color="#4F46E5" /> Switch User
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Assigned Tasks</span>
            <Kanban size={18} color="#4F46E5" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>
            {totalAssigned}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Tasks assigned to {currentUser.name.split(' ')[0]}</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>In Progress / Active</span>
            <Clock size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', marginTop: '0.5rem' }}>
            {inProgressCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Currently requiring action</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Completed Tasks</span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '0.5rem' }}>
            {completedCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Successfully delivered</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Story Points</span>
            <TrendingUp size={18} color="#0891B2" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0891B2', marginTop: '0.5rem' }}>
            {totalStoryPoints} pts
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Sprint capacity allocated</span>
        </div>
      </div>

      {/* Main Panel Content: Filtered Assigned Tasks Matrix */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Panel Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', pb: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#4F46E5" /> User Data Panel — My Assigned Tasks ({filteredCards.length})
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Personalized tasks assigned to <strong>{currentUser.name}</strong> across all workspace boards.
            </p>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search my tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: '2rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.4rem',
                  paddingBottom: '0.4rem',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: '#F8FAFC',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">Code Review</option>
              <option value="done">Done</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                background: '#F8FAFC',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🔵 Medium</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>
        </div>

        {/* Task Cards Matrix Table / Grid */}
        {filteredCards.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <Kanban size={36} color="#CBD5E1" style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontWeight: 700, color: '#334155' }}>No assigned tasks match your current filter settings.</div>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try clearing filters or assigning new cards to {currentUser.name}.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredCards.map(card => {
              const targetBoard = boards.find(b => b._id === card.board);
              const targetList = lists.find(l => l._id === card.list);

              return (
                <div
                  key={card._id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: `4px solid ${targetList?.color || '#4F46E5'}`,
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'all 0.15s',
                    cursor: 'pointer'
                  }}
                  onClick={() => onCardClick(card._id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {card.key}
                      </span>
                      <span className={`badge-${card.priority}`} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {card.priority}
                      </span>
                      {targetBoard && (
                        <span style={{ fontSize: '0.7rem', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          Board: {targetBoard.name}
                        </span>
                      )}
                      {targetList && (
                        <span style={{ fontSize: '0.7rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          Column: {targetList.title}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                      {card.title}
                    </h3>

                    {card.description && (
                      <p style={{ fontSize: '0.8rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                        {card.description}
                      </p>
                    )}
                  </div>

                  {/* Right Side Info & Quick Board Navigation */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Story Points</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{card.storyPoints || 1} pts</strong>
                    </div>

                    <button
                      onClick={() => {
                        if (targetBoard) onSelectBoard(targetBoard._id);
                      }}
                      title="Navigate to Board View"
                      style={{
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        border: 'none',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Open Board <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Workspaces & Team Members Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* User Workspaces Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={18} color="#4F46E5" /> Workspaces Joined ({userWorkspaces.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {userWorkspaces.map(ws => (
              <div key={ws._id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: ws.color || '#4F46E5' }} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{ws.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{ws.boards?.length || 0} boards • {ws.description}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', background: '#EEF2FF', color: '#4F46E5', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Member
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Team Collaborators */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={18} color="#059669" /> Team Collaborators ({users.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {users.map(u => (
              <div key={u._id} style={{ background: u._id === currentUser._id ? '#EEF2FF' : '#F8FAFC', border: u._id === currentUser._id ? '1px solid #C7D2FE' : '1px solid #E2E8F0', padding: '0.65rem 0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img src={u.avatar} alt={u.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {u.name} {u._id === currentUser._id && <span style={{ fontSize: '0.65rem', color: '#4F46E5' }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{u.email}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#334155', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 7px', borderRadius: '6px', textTransform: 'capitalize', fontWeight: 600 }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </main>
  );
}
