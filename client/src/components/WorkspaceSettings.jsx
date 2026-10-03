import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  Shield, 
  Trash2, 
  Save, 
  Lock, 
  Globe, 
  Kanban,
  CheckCircle2
} from 'lucide-react';

export default function WorkspaceSettings({ 
  workspace, 
  boards, 
  users, 
  currentUser, 
  onUpdateWorkspace,
  onOpenCreateBoard
}) {
  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [visibility, setVisibility] = useState(workspace?.settings?.visibility || 'team');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateWorkspace({
      ...workspace,
      name: name.trim(),
      description: description.trim(),
      settings: {
        ...workspace?.settings,
        visibility
      }
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <Building size={22} color="#4F46E5" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Workspace Settings
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Manage identity, member permissions, access tiers, and connected project boards.
          </p>
        </div>

        {/* Saved Toast Notification */}
        {savedNotice && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> Workspace settings saved successfully.
          </div>
        )}

        {/* General Details Form */}
        <form onSubmit={handleSave} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            General Workspace Profile
          </h3>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', color: '#0F172A', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Objective / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.85rem', color: '#0F172A', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Default Privacy & Access Tier
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div
                onClick={() => setVisibility('team')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: visibility === 'team' ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                  background: visibility === 'team' ? '#EEF2FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Globe size={18} color={visibility === 'team' ? '#4F46E5' : '#64748B'} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Team / Open</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Accessible by all invited members</div>
                </div>
              </div>

              <div
                onClick={() => setVisibility('private')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: visibility === 'private' ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                  background: visibility === 'private' ? '#EEF2FF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Lock size={18} color={visibility === 'private' ? '#4F46E5' : '#64748B'} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Restricted</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Explicit board invite only</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button
              type="submit"
              style={{
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>

        {/* Member Access Section */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Team Members & RBAC Roles
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Assigned roles determine board creation, task transitions, and administration permissions.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, color: '#475569' }}>
              {workspace?.members?.length || 0} Members
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {workspace?.members?.map((m) => {
              const userObj = users?.find(u => u._id === m.user || u.id === m.user);
              return (
                <div
                  key={m.user}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={userObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={userObj?.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                        {userObj?.name || 'Workspace User'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {userObj?.email || 'member@workspace.io'}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: m.role === 'owner' ? '#FEF3C7' : '#EEF2FF',
                    color: m.role === 'owner' ? '#B45309' : '#4F46E5',
                    border: m.role === 'owner' ? '1px solid #FDE68A' : '1px solid #C7D2FE'
                  }}>
                    {m.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Boards in Workspace */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Active Project Boards
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Boards associated with this workspace and their task key namespaces.
              </p>
            </div>
            <button
              onClick={onOpenCreateBoard}
              style={{
                background: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Add Board
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {boards?.map((b) => (
              <div
                key={b._id}
                style={{
                  padding: '0.85rem',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{b.name}</span>
                  <span style={{ fontSize: '0.7rem', background: '#EEF2FF', color: '#4F46E5', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>
                    {b.key}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'capitalize' }}>
                  {b.type} Template • {b.lists?.length || 0} Columns
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#991B1B' }}>Danger Zone</div>
            <div style={{ fontSize: '0.75rem', color: '#B91C1C' }}>
              Permanently delete or archive this workspace and its associated boards.
            </div>
          </div>
          <button
            onClick={() => alert('Only organization owners can delete workspaces.')}
            style={{
              background: '#FFFFFF',
              color: '#DC2626',
              border: '1px solid #F87171',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Trash2 size={14} /> Delete Workspace
          </button>
        </div>

      </div>
    </main>
  );
}