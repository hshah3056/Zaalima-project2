import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Layers, 
  Users, 
  Briefcase, 
  Kanban, 
  FileText, 
  CheckCircle2, 
  Code, 
  Copy, 
  Share2,
  GitBranch
} from 'lucide-react';

export default function DataModelsModal({ isOpen, onClose, schemaData }) {
  const [selectedModel, setSelectedModel] = useState('Workspace');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const modelsList = [
    { key: 'Workspace', name: 'Workspace Model', icon: <Briefcase size={16} color="#4F46E5" />, desc: 'Organizational container & permissions' },
    { key: 'Board', name: 'Board Model', icon: <Kanban size={16} color="#7C3AED" />, desc: 'Workflow board layout (Kanban/Scrum)' },
    { key: 'List', name: 'List Model', icon: <Layers size={16} color="#2563EB" />, desc: 'Column states & WIP limits' },
    { key: 'Card', name: 'Card Model', icon: <FileText size={16} color="#DB2777" />, desc: 'Individual work items & subtasks' },
    { key: 'User', name: 'User Model', icon: <Users size={16} color="#059669" />, desc: 'User profiles, presence & roles' },
    { key: 'Activity', name: 'Activity Log Model', icon: <GitBranch size={16} color="#D97706" />, desc: 'Real-time audit trail logs' }
  ];

  const handleCopySchema = () => {
    const jsonStr = JSON.stringify(schemaData?.models?.[selectedModel] || {}, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-modal" style={{
        width: '950px',
        maxWidth: '95vw',
        height: '85vh',
        background: '#FFFFFF',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', padding: '0.5rem', borderRadius: '10px' }}>
              <Database size={22} color="#0284C7" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Day 1–2 Deliverable: MERN Data Models Specification
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Workspaces, Boards, Lists, Cards, Users & Activity Log Mongoose Schemas and Relational Architecture
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Models Selector Sidebar */}
          <div style={{ borderRight: '1px solid #E2E8F0', padding: '1rem', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, marginBottom: '0.4rem' }}>
              Select Entity Schema
            </div>

            {modelsList.map(m => {
              const isSelected = selectedModel === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedModel(m.key)}
                  style={{
                    background: isSelected ? '#EEF2FF' : '#FFFFFF',
                    border: isSelected ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isSelected ? '#4F46E5' : '#0F172A', fontWeight: 700, fontSize: '0.85rem' }}>
                    {m.icon} {m.key}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                    {m.desc}
                  </span>
                </button>
              );
            })}

            {/* Live API Info */}
            <div style={{ marginTop: 'auto', background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.7rem', color: '#64748B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700, marginBottom: '4px' }}>
                <CheckCircle2 size={13} /> REST API Endpoint:
              </div>
              <code style={{ background: '#0F172A', padding: '3px 6px', borderRadius: '4px', color: '#38BDF8', display: 'block', wordBreak: 'break-all' }}>
                GET /api/data-models
              </code>
            </div>
          </div>

          {/* Model Details & JSON Schema Code Panel */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={18} color="#4F46E5" /> Schema Definition for: {selectedModel}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  Mongoose Collection: db.{selectedModel.toLowerCase()}s
                </span>
              </div>

              <button
                onClick={handleCopySchema}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: copied ? '#059669' : '#0F172A',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy Schema JSON'}
              </button>
            </div>

            {/* Relational Diagram Map for Day 1-2 */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 800, marginBottom: '0.5rem' }}>
                Relational Architecture Map (Day 1-2)
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Workspace (1)
                </span>
                <span style={{ color: '#94A3B8' }}>➔</span>
                <span style={{ background: '#F3E8FF', color: '#7C3AED', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Board (N)
                </span>
                <span style={{ color: '#94A3B8' }}>➔</span>
                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  List (N)
                </span>
                <span style={{ color: '#94A3B8' }}>➔</span>
                <span style={{ background: '#FCE7F3', color: '#DB2777', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Card (N)
                </span>
                <span style={{ color: '#94A3B8' }}>⚡</span>
                <span style={{ background: '#D1FAE5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  User (Assignees / Owners)
                </span>
              </div>
            </div>

            {/* Code View */}
            <pre className="code-block" style={{ flex: 1, margin: 0 }}>
              {JSON.stringify(schemaData?.models?.[selectedModel] || { message: 'Loading Schema...' }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

