import React, { useState } from 'react';
import { X, UserCheck, LogIn, Shield, CheckCircle2, Mail, Lock } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, users, currentUser, onLogin, onLogout }) {
  const [selectedUserId, setSelectedUserId] = useState(currentUser?._id || users[0]?._id);
  const [emailInput, setEmailInput] = useState('');

  if (!isOpen) return null;

  const handleSelectLogin = (userId) => {
    setSelectedUserId(userId);
    const target = users.find(u => u._id === userId);
    if (target) {
      onLogin(target);
      onClose();
    }
  };

  const handleCustomEmailLogin = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const target = users.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase());
    if (target) {
      onLogin(target);
      onClose();
    } else {
      alert(`User with email "${emailInput}" not found in system.`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(8px)',
      zIndex: 110,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-modal" style={{
        width: '520px',
        maxWidth: '92vw',
        padding: '1.75rem',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#EEF2FF', padding: '0.5rem', borderRadius: '10px' }}>
              <UserCheck size={22} color="#4F46E5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>User Authentication & Login</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Select active workspace session identity</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Currently Active User Session Info */}
        {currentUser && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{currentUser.email} • <span style={{ color: '#4F46E5', textTransform: 'capitalize', fontWeight: 600 }}>{currentUser.role}</span></div>
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FCA5A5',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Quick User Account Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
            Quick Select User Account to Login
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {users.map(u => {
              const isSelected = currentUser?._id === u._id;
              return (
                <div
                  key={u._id}
                  onClick={() => handleSelectLogin(u._id)}
                  style={{
                    background: isSelected ? '#EEF2FF' : '#FFFFFF',
                    border: isSelected ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={u.avatar} alt={u.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#4F46E5' : '#0F172A' }}>
                        {u.name} {isSelected && <span style={{ fontSize: '0.7rem', background: '#4F46E5', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Active</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {u.email} • <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{u.role}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected ? <CheckCircle2 size={18} color="#4F46E5" /> : <LogIn size={16} color="#94A3B8" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>OR SIGN IN BY EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleCustomEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="Enter user email (e.g. alex.rivera@pulsework.io)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.2rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.55rem',
                  paddingBottom: '0.55rem',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.65rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogIn size={16} /> Login to Account
          </button>
        </form>
      </div>
    </div>
  );
}
