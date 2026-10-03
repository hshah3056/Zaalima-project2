import React, { useState } from 'react';
import { 
  Zap, 
  UserCheck, 
  LogIn, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  ShieldCheck, 
  ArrowRight, 
  UserPlus, 
  CheckCircle2,
  Sparkles,
  Users,
  KeyRound
} from 'lucide-react';

export default function LoginForm({ users, onLogin, onRegisterAndLogin }) {
  const [accountIdInput, setAccountIdInput] = useState('alex123');
  const [passwordInput, setPasswordInput] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState('Senior Developer');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!accountIdInput.trim()) {
      setErrorMsg('Please enter your Account ID or Email.');
      return;
    }

    if (!passwordInput) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: accountIdInput.trim(),
        email: accountIdInput.trim(),
        password: passwordInput
      })
    })
      .then(res => res.json())
      .then(res => {
        setIsLoading(false);
        if (res.status === 'success' && res.data) {
          onLogin(res.data);
        } else {
          // Fallback check against local users
          const term = accountIdInput.trim().toLowerCase();
          const target = users.find(u => 
            (u._id && u._id.toLowerCase() === term) ||
            (u.accountId && u.accountId.toLowerCase() === term) ||
            (u.email && u.email.toLowerCase() === term)
          );
          if (target) {
            onLogin(target);
          } else {
            setErrorMsg(res.message || 'Invalid Account ID or Password.');
          }
        }
      })
      .catch(() => {
        setIsLoading(false);
        const term = accountIdInput.trim().toLowerCase();
        const target = users.find(u => 
          (u.accountId && u.accountId.toLowerCase() === term) ||
          (u.email && u.email.toLowerCase() === term) ||
          (u._id && u._id.toLowerCase() === term)
        );
        if (target) {
          onLogin(target);
        } else {
          setErrorMsg('Unable to connect to login server. Please verify credentials.');
        }
      });
  };

  const handleQuickFill = (u) => {
    setAccountIdInput(u.accountId || u.email);
    setPasswordInput(u.password || 'password123');
    setErrorMsg('');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) return;

    onRegisterAndLogin({
      name: nameInput.trim(),
      email: emailInput.trim().toLowerCase(),
      accountId: nameInput.toLowerCase().replace(/[^a-z0-9]+/g, '') + '123',
      password: passwordInput || 'password123',
      role: roleInput,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F1F5F9 100%)',
      padding: '1.5rem',
      fontFamily: 'var(--font-sans)'
    }}>
      <div className="glass-panel animate-modal" style={{
        width: '480px',
        maxWidth: '100%',
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '2.25rem',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
          }}>
            <Zap size={26} color="#FFFFFF" />
          </div>

          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              PULSE<span style={{ color: '#4F46E5' }}>WORK</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
              Account Login & User Dashboard Portal
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {!isRegisterMode ? (
          <>
            {/* Account ID & Password Login Form */}
            <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
                  Account ID or Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <UserCheck size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Enter Account ID (e.g. alex123) or email"
                    value={accountIdInput}
                    onChange={(e) => setAccountIdInput(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '2.4rem',
                      paddingRight: '0.85rem',
                      paddingTop: '0.65rem',
                      paddingBottom: '0.65rem',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password (e.g. password123)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '2.4rem',
                      paddingRight: '2.5rem',
                      paddingTop: '0.65rem',
                      paddingBottom: '0.65rem',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  marginTop: '0.2rem'
                }}
              >
                <LogIn size={18} /> {isLoading ? 'Authenticating...' : 'Sign In & Open User Dashboard'}
              </button>
            </form>

            {/* Quick Demo Accounts Selection */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>DEMO ACCOUNTS (CLICK TO AUTO-FILL)</span>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleQuickFill(u)}
                    style={{
                      background: accountIdInput === (u.accountId || u.email) ? '#EEF2FF' : '#F8FAFC',
                      border: accountIdInput === (u.accountId || u.email) ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <img src={u.avatar} alt={u.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#4F46E5', fontFamily: 'monospace' }}>
                        ID: {u.accountId || u.email.split('@')[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRegisterMode(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4F46E5',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              + Register New Account ID & Password
            </button>
          </>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', pb: '0.5rem' }}>
              Create Account ID & Password
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Lee"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="jordan.lee@pulsework.io"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Choose password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Role
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="Senior Developer">Senior Developer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="QA Engineer">QA Engineer</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
              <button
                type="submit"
                style={{
                  flex: 2,
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <UserPlus size={16} /> Register & Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

