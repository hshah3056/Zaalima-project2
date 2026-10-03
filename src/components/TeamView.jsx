import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  CheckCircle2, 
  Clock, 
  Kanban, 
  Sparkles, 
  TrendingUp, 
  Search,
  Filter,
  Plus,
  UserCheck,
  Briefcase,
  Layers,
  ChevronRight,
  Activity,
  Send
} from 'lucide-react';

export default function TeamView({ 
  currentWorkspace, 
  users, 
  currentUser, 
  boards, 
  cards, 
  onOpenInviteModal,
  onSelectBoard,
  onOpenLoginModal 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate team workload metrics
  const totalTasks = cards.length;
  const assignedTasks = cards.filter(c => c.assignees && c.assignees.length > 0).length;

  return (
    <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)'
          }}>
            <Users size={28} color="#FFFFFF" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Team Collaboration & Members Hub
              </h1>
              <span style={{ background: '#ECFDF5', color: '#059669', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="status-online-dot"></span> Work with Team
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
              Manage team members, assign sprint tasks, track workload capacity, and collaborate in <strong>{currentWorkspace?.name || 'Workspace'}</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenInviteModal}
          style={{
            background: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.65rem 1.2rem',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
          }}
        >
          <UserPlus size={18} /> Invite Team Member
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Total Team Members</span>
            <Users size={18} color="#4F46E5" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>
            {users.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Active collaborators</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Workspace Boards</span>
            <Kanban size={18} color="#0891B2" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0891B2', marginTop: '0.5rem' }}>
            {boards.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Shared project boards</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Assigned Tasks</span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '0.5rem' }}>
            {assignedTasks} / {totalTasks}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Tasks assigned across team</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Active Logged-in User</span>
            <UserCheck size={18} color="#EC4899" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name || 'Guest'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 600 }}>{currentUser?.role || 'Viewer'}</span>
        </div>
      </div>

      {/* Main Content Layout: Team Roster + Workload Matrix */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', pb: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#4F46E5" /> Team Roster & Workload ({filteredUsers.length})
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Collaborate directly with team members by viewing active tasks and roles.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search team member..."
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

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
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
              <option value="all">All Roles</option>
              <option value="product manager">Product Manager</option>
              <option value="tech lead">Tech Lead</option>
              <option value="senior developer">Senior Developer</option>
              <option value="frontend engineer">Frontend Engineer</option>
              <option value="qa engineer">QA Engineer</option>
            </select>
          </div>
        </div>

        {/* Team Members Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredUsers.map(member => {
            const isCurrent = currentUser?._id === member._id;
            const memberCards = cards.filter(c => c.assignees && c.assignees.some(a => (a._id || a) === member._id));
            const inProgress = memberCards.filter(c => c.status === 'in_progress' || c.status === 'todo').length;
            const done = memberCards.filter(c => c.status === 'done' || c.status === 'completed').length;

            return (
              <div
                key={member._id}
                style={{
                  background: isCurrent ? '#EEF2FF' : '#FFFFFF',
                  border: isCurrent ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 0.15s'
                }}
              >
                {/* User Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      />
                      <span
                        title={member.status || 'online'}
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: member.status === 'offline' ? '#94A3B8' : '#059669',
                          border: '2px solid #FFFFFF'
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {member.name} {isCurrent && <span style={{ fontSize: '0.68rem', background: '#4F46E5', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px' }}>You</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    background: '#F1F5F9',
                    color: '#475569',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'capitalize'
                  }}>
                    {member.role}
                  </span>
                </div>

                {/* Workload Stats Bar */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Assigned</span>
                    <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{memberCards.length}</strong>
                  </div>
                  <div style={{ width: '1px', height: '24px', background: '#CBD5E1' }} />
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Active</span>
                    <strong style={{ fontSize: '1rem', color: '#D97706' }}>{inProgress}</strong>
                  </div>
                  <div style={{ width: '1px', height: '24px', background: '#CBD5E1' }} />
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Done</span>
                    <strong style={{ fontSize: '1rem', color: '#059669' }}>{done}</strong>
                  </div>
                </div>

                {/* Assigned Cards Preview */}
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    Active Tasks Preview
                  </span>
                  {memberCards.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                      No tasks assigned currently.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {memberCards.slice(0, 3).map(c => (
                        <div
                          key={c._id}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#0F172A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                            {c.title}
                          </span>
                          <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#4F46E5', fontWeight: 700 }}>
                            {c.key}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Switch Account Quick Action */}
                {!isCurrent && (
                  <button
                    onClick={() => onOpenLoginModal()}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#4F46E5',
                      padding: '0.45rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <UserCheck size={14} /> Switch to {member.name.split(' ')[0]}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
