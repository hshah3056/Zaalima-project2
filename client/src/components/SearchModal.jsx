import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';

const API_BASE = "http://localhost:5001/api";

export default function SearchModal({ 
  isOpen, 
  onClose, 
  onSelectCard, 
  workspaces = [], 
  boards = [], 
  users = [] 
}) {
  if (!isOpen) return null;

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    fetchSearchResults();
  }, [query, selectedWorkspace, selectedBoard, selectedPriority, selectedStatus, selectedDueDate, sortBy]);

  const fetchSearchResults = () => {
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
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setSearchResults(res.data.cards || []);
          setFacets(res.data.facets || null);
        }
      })
      .catch((err) => console.warn('Search engine fetch failed:', err))
      .finally(() => setIsLoading(false));
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'badge-urgent';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      default: return 'badge-low';
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '4rem 1.5rem 2rem'
    }}>
      <div 
        className="glass-panel animate-modal"
        style={{
          width: '840px',
          maxWidth: '94vw',
          maxHeight: '85vh',
          background: '#FFFFFF',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden'
        }}
      >
        {/* Search Header Bar */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: '#F8FAFC'
        }}>
          <Search size={20} color="#4F46E5" />
          <input 
            type="text"
            placeholder="Search tasks, descriptions, subtasks, keys (e.g. PULSE-101)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#0F172A',
              outline: 'none'
            }}
          />
          {query && (
            <X 
              size={18} 
              onClick={() => setQuery('')}
              style={{ cursor: 'pointer', color: '#94A3B8' }}
            />
          )}
          <button 
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#64748B',
              cursor: 'pointer'
            }}
          >
            ESC
          </button>
        </div>

        {/* Multi-Attribute Filter Bar */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          background: '#FFFFFF'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SlidersHorizontal size={13} color="#4F46E5" /> Filters:
          </span>

          {/* Workspace Select */}
          <select 
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#F8FAFC' }}
          >
            <option value="">All Workspaces</option>
            {workspaces.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>

          {/* Board Select */}
          <select 
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#F8FAFC' }}
          >
            <option value="">All Boards</option>
            {boards.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>

          {/* Priority Pill */}
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#F8FAFC' }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Pill */}
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#F8FAFC' }}
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Completed</option>
          </select>

          {/* Due Date Range */}
          <select 
            value={selectedDueDate}
            onChange={(e) => setSelectedDueDate(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '3px 8px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', background: '#F8FAFC' }}
          >
            <option value="">Any Due Date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="this_week">Due This Week</option>
          </select>

          {/* Clear Filters Button */}
          {(query || selectedWorkspace || selectedBoard || selectedPriority !== 'all' || selectedStatus !== 'all' || selectedDueDate) && (
            <button
              onClick={clearFilters}
              style={{ border: 'none', background: '#FEF2F2', color: '#DC2626', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Facets & Results Summary Bar */}
        {facets && (
          <div style={{ padding: '0.5rem 1.25rem', background: '#EEF2FF', borderBottom: '1px solid #E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#4338CA', fontWeight: 600 }}>
            <span>Found <strong>{searchResults.length}</strong> tasks matching search criteria</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span>High/Urgent: <strong>{(facets.byPriority?.urgent || 0) + (facets.byPriority?.high || 0)}</strong></span>
              <span>Completed: <strong>{facets.byStatus?.done || 0}</strong></span>
            </div>
          </div>
        )}

        {/* Search Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#FAFAFD' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B', fontSize: '0.85rem' }}>
              Searching workspace tasks...
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
              <AlertCircle size={36} style={{ marginBottom: '0.5rem', color: '#CBD5E1' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No tasks found</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try searching with different keywords or resetting filters.</div>
            </div>
          ) : (
            searchResults.map((card) => (
              <div
                key={card._id}
                onClick={() => {
                  onSelectCard(card._id, card.board);
                  onClose();
                }}
                className="glass-card"
                style={{
                  padding: '1rem',
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#4F46E5', fontWeight: 800 }}>
                      {card.key}
                    </span>
                    <span style={{ background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                      {card.boardName || 'Board'}
                    </span>
                    <span style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                      {card.listTitle || 'Column'}
                    </span>
                    <span className={getPriorityBadgeClass(card.priority)} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 700 }}>
                      {card.priority}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                    {card.title}
                  </h4>

                  {card.description && (
                    <p style={{ fontSize: '0.78rem', color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {card.description}
                    </p>
                  )}

                  {/* Tag Pills */}
                  {card.labels && card.labels.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
                      {card.labels.map((lbl, idx) => (
                        <span key={idx} style={{ background: `${lbl.color}15`, color: lbl.color, border: `1px solid ${lbl.color}30`, fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {lbl.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Arrow Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4F46E5', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span>Open</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
