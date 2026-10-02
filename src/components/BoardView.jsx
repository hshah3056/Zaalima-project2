import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  MessageSquare, 
  CheckSquare, 
  Paperclip, 
  Clock, 
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
  Filter,
  UserCheck
} from 'lucide-react';

export default function BoardView({ 
  board, 
  onCardClick, 
  onAddCardClick, 
  onAddListClick,
  onMoveCard,
  currentUser 
}) {
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverListId, setDragOverListId] = useState(null);
  const [filterMyTasks, setFilterMyTasks] = useState(false);

  if (!board) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', background: '#F8FAFC' }}>
        Select or create a board to begin workspace collaboration.
      </div>
    );
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'badge-urgent';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  const handleDragStart = (e, cardId) => {
    setDraggedCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e, listId) => {
    e.preventDefault();
    if (dragOverListId !== listId) {
      setDragOverListId(listId);
    }
  };

  const handleDrop = (e, listId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (cardId && listId) {
      onMoveCard(cardId, listId);
    }
    setDraggedCardId(null);
    setDragOverListId(null);
  };

  return (
    <main style={{ flex: 1, padding: '1.5rem', overflowX: 'auto', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Board Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              {board.name}
            </span>
            <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {board.key}
            </span>
            <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 600 }}>
              {board.type} View
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
            {board.description || 'Sprint board for real-time team workflow.'}
          </p>
        </div>

        {/* Board Stats & Quick Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* User Task Filter Toggle Button */}
          {currentUser && (
            <button
              onClick={() => setFilterMyTasks(!filterMyTasks)}
              style={{
                background: filterMyTasks ? '#EEF2FF' : '#FFFFFF',
                color: filterMyTasks ? '#4F46E5' : '#475569',
                border: filterMyTasks ? '1px solid #4F46E5' : '1px solid #CBD5E1',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <UserCheck size={15} color={filterMyTasks ? '#4F46E5' : '#64748B'} /> 
              {filterMyTasks ? `Assigned to ${currentUser.name.split(' ')[0]}` : 'Filter: All Cards'}
            </button>
          )}

          <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', color: '#64748B', boxShadow: 'var(--shadow-sm)' }}>
            Lists: <strong style={{ color: '#0F172A' }}>{board.lists?.length || 0}</strong>
          </div>
          
          <button
            onClick={() => onAddCardClick(board.lists?.[0]?._id)}
            style={{
              background: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
            }}
          >
            <Plus size={14} /> Add Card
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flex: 1, pb: '1.5rem' }}>
        {board.lists?.map((list) => {
          const isOver = dragOverListId === list._id;
          
          // Filter list cards if "Assigned to Me" is active
          const displayedCards = list.cards?.filter(c => {
            if (!filterMyTasks || !currentUser) return true;
            return c.assignees && c.assignees.some(a => (a._id || a) === currentUser._id);
          }) || [];

          return (
            <div
              key={list._id}
              onDragOver={(e) => handleDragOver(e, list._id)}
              onDrop={(e) => handleDrop(e, list._id)}
              className="glass-panel"
              style={{
                width: '310px',
                minWidth: '310px',
                maxHeight: 'calc(100vh - 180px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                backgroundColor: isOver ? '#EEF2FF' : '#FFFFFF',
                borderColor: isOver ? '#4F46E5' : '#E2E8F0',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s'
              }}
            >
              {/* Column Header with Agile WIP Limit Warning */}
              {(() => {
                const isOverWip = list.wipLimit > 0 && displayedCards.length > list.wipLimit;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOverWip ? '#EF4444' : (list.color || '#3B82F6') }} />
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: isOverWip ? '#B91C1C' : '#0F172A', margin: 0 }}>
                        {list.title}
                      </h3>
                      <span style={{
                        background: isOverWip ? '#FEE2E2' : '#F1F5F9',
                        color: isOverWip ? '#DC2626' : '#475569',
                        border: isOverWip ? '1px solid #FCA5A5' : 'none',
                        padding: '2px 7px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {displayedCards.length}{list.wipLimit > 0 ? ` / ${list.wipLimit}` : ''}
                      </span>
                      {isOverWip && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          background: '#EF4444',
                          color: '#FFFFFF',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          OVER WIP
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onAddCardClick(list._id)}
                      title="Add Task to this List"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '2px 4px'
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                );
              })()}

              {/* Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '2px' }}>
                {displayedCards.map((card) => {
                  const completedSubtasks = card.subtasks?.filter(s => s.completed).length || 0;
                  const totalSubtasks = card.subtasks?.length || 0;
                  const isAssignedToUser = currentUser && card.assignees?.some(a => (a._id || a) === currentUser._id);

                  return (
                    <div
                      key={card._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card._id)}
                      onClick={() => onCardClick(card._id)}
                      className="glass-card"
                      style={{
                        padding: '0.85rem',
                        cursor: 'grab',
                        background: '#FFFFFF',
                        borderLeft: `4px solid ${list.color || '#3B82F6'}`,
                        border: isAssignedToUser ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                        boxShadow: isAssignedToUser ? '0 2px 8px rgba(79, 70, 229, 0.12)' : 'var(--shadow-sm)'
                      }}
                    >
                      {/* Labels & Key */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#4F46E5', fontWeight: 700 }}>
                          {card.key}
                        </span>

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span className={getPriorityBadgeClass(card.priority)} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 700 }}>
                            {card.priority}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.6rem', lineHeight: '1.4' }}>
                        {card.title}
                      </h4>

                      {/* Tags */}
                      {card.labels && card.labels.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          {card.labels.map((lbl, idx) => (
                            <span 
                              key={idx} 
                              style={{ 
                                background: `${lbl.color}15`, 
                                color: lbl.color, 
                                border: `1px solid ${lbl.color}30`,
                                fontSize: '0.65rem', 
                                padding: '1px 6px', 
                                borderRadius: '4px',
                                fontWeight: 600
                              }}
                            >
                              {lbl.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Metrics & Assignees */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748B' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {totalSubtasks > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: completedSubtasks === totalSubtasks ? '#059669' : '#64748B', fontWeight: 600 }}>
                              <CheckSquare size={13} /> {completedSubtasks}/{totalSubtasks}
                            </span>
                          )}

                          {card.comments && card.comments.length > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MessageSquare size={13} /> {card.comments.length}
                            </span>
                          )}
                        </div>

                        {/* Assignees */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {card.assignees?.map((u, i) => (
                            <img
                              key={u._id || i}
                              src={u.avatar}
                              alt={u.name}
                              title={u.name}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                marginLeft: i > 0 ? '-6px' : 0,
                                border: '2px solid #FFFFFF'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Card Button at Bottom of Column */}
              <button
                onClick={() => onAddCardClick(list._id)}
                style={{
                  marginTop: '0.75rem',
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '6px',
                  padding: '0.45rem',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.15s'
                }}
              >
                <Plus size={14} /> Add Card
              </button>
            </div>
          );
        })}

        {/* Add List Button Column */}
        <button
          onClick={onAddListClick}
          style={{
            minWidth: '240px',
            background: '#FFFFFF',
            border: '1px dashed #CBD5E1',
            borderRadius: '12px',
            padding: '1rem',
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            height: 'fit-content',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Plus size={16} /> Add List Column
        </button>
      </div>
    </main>
  );
}

