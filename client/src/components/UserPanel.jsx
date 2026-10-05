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
  UserCheck,
  Zap,
  Activity,
  Award,
  BarChart3
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
    fetch(`http://localhost:5001/api/users/${currentUser._id}/dashboard`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setUserDashboardData(res.data);
        }
      })
      .catch(() => {});
  }, [currentUser, cards]);

  if (!currentUser) {
    return (
      <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
        <UserCheck size={48} color="#94A3B8" />
        <h2 style={{ marginTop: '1rem', color: '#0F172A', fontWeight: 800 }}>No User Currently Logged In</h2>
        <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Please log in to view your personalized dashboard.</p>
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
          Open Login Portal
        </button>
      </div>
    );
  }

  // Filter assigned cards for active user
  const allUserAssignedCards = cards.filter(c => c.assignees && c.assignees.some(a => (a._id || a) === currentUser._id));
  
  const filteredCards = allUserAssignedCards.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    if (searchQuery.trim() && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.key.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // User metrics calculation
  const totalAssigned = allUserAssignedCards.length;
  const inProgressCount = allUserAssignedCards.filter(c => c.status === 'in_progress' || c.status === 'todo').length;
  const completedCount = allUserAssignedCards.filter(c => c.status === 'done' || c.status === 'completed').length;
  const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;
  const totalStoryPoints = allUserAssignedCards.reduce((acc, c) => acc + (Number(c.storyPoints) || 0), 0);
  
  // Workspaces user belongs to
  const userWorkspaces = workspaces.filter(w => w.members && w.members.some(m => (m.user || m) === currentUser._id));

  return (
    <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Executive Welcome Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 50%, #F0F9FF 100%)',
        border: '1px solid #C7D2FE',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Decorative Glow Background */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'rgba(79, 70, 229, 0.08)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #FFFFFF',
                boxShadow: '0 6px 16px rgba(79, 70, 229, 0.2)'
              }} 
            />
            <span className="status-online-dot" style={{ position: 'absolute', bottom: '2px', right: '2px', border: '2px solid #FFFFFF' }} title="Online Status" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Welcome back, {currentUser.name}! 👋
              </h1>
              <span style={{
                background: '#4F46E5',
                color: '#FFFFFF',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {currentUser.role}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', fontWeight: 500 }}>
              {currentUser.email} • Active Workspace Session ({userWorkspaces.length} Connected Workspaces)
            </p>
          </div>
        </div>

        {/* Quick Action Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.5rem 1rem', borderRadius: '10px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Task Velocity</span>
            <strong style={{ fontSize: '1.15rem', color: '#059669', fontWeight: 800 }}>{completionRate}% Done</strong>
          </div>

          <button
            onClick={onOpenLoginModal}
            style={{
              background: '#FFFFFF',
              border: '1px solid #C7D2FE',
              color: '#4F46E5',
              padding: '0.65rem 1.1rem',
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

      {/* Executive KPI Stats Cards (4 Column Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #4F46E5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Assigned Tasks</span>
            <Kanban size={20} color="#4F46E5" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>
            {totalAssigned}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Active workload assigned to you</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #D97706' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Active Sprint Items</span>
            <Clock size={20} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#D97706', marginTop: '0.5rem' }}>
            {inProgressCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Tasks currently in progress</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Completed Tasks</span>
            <CheckCircle2 size={20} color="#059669" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#059669', marginTop: '0.5rem' }}>
            {completedCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>{completionRate}% Total completion rate</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #0891B2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Total Story Points</span>
            <TrendingUp size={20} color="#0891B2" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0891B2', marginTop: '0.5rem' }}>
            {totalStoryPoints} pts
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Sprint story points allocated</span>
        </div>

      </div>

      {/* Progress Breakdown Bar */}
      {totalAssigned > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={16} color="#4F46E5" /> Task Completion Velocity Progress
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
              {completedCount} / {totalAssigned} Delivered ({completionRate}%)
            </span>
          </div>
          
          <div style={{ height: '10px', background: '#F1F5F9', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${completionRate}%`, background: 'linear-gradient(90deg, #4F46E5 0%, #10B981 100%)', borderRadius: '5px', transition: 'width 0.4s ease' }} title={`Completed: ${completionRate}%`} />
          </div>
        </div>
      )}

      {/* Filterable Task Matrix Section */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Matrix Header & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', pb: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#4F46E5" /> Assigned Tasks Matrix ({filteredCards.length})
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Tasks assigned directly to <strong>{currentUser.name}</strong> across all active board columns.
            </p>
          </div>

          {/* Filter Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            
            {/* Live Search Input */}
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
                  paddingTop: '0.45rem',
                  paddingBottom: '0.45rem',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#0F172A',
                  outline: 'none',
                  width: '180px'
                }}
              />
            </div>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                background: '#F8FAFC',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
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
            <div style={{ fontWeight: 700, color: '#334155' }}>No assigned tasks match your search or filter criteria.</div>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try adjusting filters or assigning new cards to {currentUser.name}.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredCards.map(card => {
              const targetBoard = boards.find(b => b._id === card.board);
              const targetList = lists.find(l => l._id === card.list);

              return (
                <div
                  key={card._id}
                  className="glass-card"
                  style={{
                    padding: '1rem 1.25rem',
                    borderLeft: `4px solid ${targetList?.color || '#4F46E5'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
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

                  {/* Right Side Navigation Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Story Points</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{card.storyPoints || 1} pts</strong>
                    </div>

                    <button
                      onClick={() => {
                        if (targetBoard) onSelectBoard(targetBoard._id);
                      }}
                      title="Navigate to Board Canvas"
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

      {/* Workspaces & Team Collaborators Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Workspaces Card */}
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

        {/* Team Collaborators Card */}
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
