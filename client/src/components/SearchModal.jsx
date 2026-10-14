import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Layers, 
  CheckCircle2, 
  Clock, 
  User, 
  Tag, 
  ArrowRight, 
  AlertCircle, 
  SlidersHorizontal, 
  Calendar, 
  Sparkles,
  Command
} from 'lucide-react';

const API_BASE = "http://localhost:5001/api";

export default function SearchModal({ 
  isOpen, 
  onClose, 
  onSelectCard, 
  workspaces = [], 
  boards = [], 
  users = [],
  cards = []
}) {
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDueDate, setSelectedDueDate] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');

  const [searchResults, setSearchResults] = useState([]);
  const [facets, setFacets] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Global ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch from backend or fallback to cards in memory
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.append('q', query.trim());
    if (selectedWorkspace) params.append('workspaceId', selectedWorkspace);
    if (selectedBoard) params.append('boardId', selectedBoard);
    if (selectedPriority !== 'all') params.append('priority', selectedPriority);
    if (selectedStatus !== 'all') params.append('status', selectedStatus);
    if (selectedDueDate) params.append('dueDate', selectedDueDate);
    if (sortBy) params.append('sortBy', sortBy);

    fetch(`${API_BASE}/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Search endpoint non-ok');
        return res.json();
      })
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setSearchResults(res.data.cards || []);
          setFacets(res.data.facets || null);
        } else {
          fallbackLocalFilter();
        }
      })
      .catch(() => {
        fallbackLocalFilter();
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, query, selectedWorkspace, selectedBoard, selectedPriority, selectedStatus, selectedDueDate, sortBy]);

  const fallbackLocalFilter = () => {
    const q = query.trim().toLowerCase();
    let filtered = Array.isArray(cards) ? [...cards] : [];

    if (q) {
      filtered = filtered.filter((c) => {
        const matchesTitle = c.title?.toLowerCase().includes(q);
        const matchesKey = c.key?.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        return matchesTitle || matchesKey || matchesDesc;
      });
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter((c) => c.priority === selectedPriority);
    }

    setSearchResults(filtered);
    setFacets(null);
  };

  if (!isOpen) return null;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'badge-urgent';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "urgent": return "#DC2626";
      case "high": return "#EA580C";
      case "medium": return "#4F46E5";
      default: return "#64748B";
    }
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedWorkspace('');
    setSelectedBoard('');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedDueDate('');
    setSortBy('updatedAt');
  };

  const handleCardClick = (card) => {
    if (onSelectCard) {
      onSelectCard(card._id, card.board || card.boardId);
    }
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '5rem 1.5rem 2rem'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-modal"
        style={{
          width: '780px',
          maxWidth: '94vw',
          maxHeight: '85vh',
          background: '#FFFFFF',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden'
        }}
      >
        {/* Search Header Bar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#FFFFFF'
        }}>
          <Search size={20} color="#4F46E5" />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Search tasks by title, key (e.g. PULSE-101), or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '0.98rem',
              fontWeight: 500,
              color: '#0F172A',
              outline: 'none'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: '#94A3B8'
              }}
            >
              <X size={18} />
            </button>
          )}

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            title="Toggle advanced filters"
            style={{
              background: showAdvancedFilters ? '#EEF2FF' : '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: showAdvancedFilters ? '#4F46E5' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
          </button>

          <kbd
            style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              background: '#F8FAFC',
              color: '#64748B',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Collapsible Multi-Attribute Filter Bar */}
        {showAdvancedFilters && (
          <div style={{
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            background: '#F8FAFC'
          }}>
            {workspaces.length > 0 && (
              <select 
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#FFFFFF' }}
              >
                <option value="">All Workspaces</option>
                {workspaces.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            )}

            {boards.length > 0 && (
              <select 
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#FFFFFF' }}
              >
                <option value="">All Boards</option>
                {boards.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            )}

            <select 
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#FFFFFF' }}
            >
              <option value="all">Priority: All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#FFFFFF' }}
            >
              <option value="all">Status: All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>

            <button 
              onClick={clearFilters}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Results List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          maxHeight: '420px',
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B', fontSize: '0.85rem' }}>
              Searching workspace tasks...
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94A3B8' }}>
              <AlertCircle size={32} style={{ marginBottom: '0.5rem', color: '#CBD5E1', display: 'inline-block' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                {query.trim() ? `No tasks found matching "${query}"` : 'Type to search tasks'}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Try searching with different keywords or task keys like PULSE-...
              </div>
            </div>
          ) : (
            searchResults.map((card) => (
              <div
                key={card._id}
                onClick={() => handleCardClick(card)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: '1px solid #F1F5F9',
                  background: '#FFFFFF',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#F1F5F9';
                }}
              >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontFamily: 'var(--font-mono)', 
                      color: '#4F46E5', 
                      fontWeight: 700,
                      background: '#EEF2FF',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {card.key || 'TASK'}
                    </span>
                    {card.boardName && (
                      <span style={{ background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                        {card.boardName}
                      </span>
                    )}
                    {card.listTitle && (
                      <span style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 500 }}>
                        {card.listTitle}
                      </span>
                    )}
                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 700, 
                        color: getPriorityColor(card.priority),
                        textTransform: 'capitalize' 
                      }}
                    >
                      {card.priority}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.title}
                  </h4>

                  {card.description && (
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4F46E5', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0, marginLeft: '0.75rem' }}>
                  <span>Open</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.55rem 1rem',
          background: '#F8FAFC',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: '#64748B',
        }}>
          <span>
            {query.trim() ? `${searchResults.length} result(s) found` : 'Global Task Search'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Click item to open</span>
            <span>Close: <kbd style={{ fontFamily: 'var(--font-mono)', padding: '1px 4px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '3px' }}>ESC</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}
