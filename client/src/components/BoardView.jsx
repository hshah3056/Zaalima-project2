import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  MoreHorizontal, 
  MessageSquare, 
  CheckSquare, 
  Clock, 
  UserCheck,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  GripVertical,
  X,
  Check,
  Palette,
  Layers,
  CheckCircle2,
  AlertCircle,
  Users,
  Activity,
  Zap,
  Tag,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function BoardView({ 
  board, 
  onCardClick, 
  onAddCardClick, 
  onAddListClick,
  onUpdateList,
  onDeleteList,
  onQuickAddCard,
  onDeleteCard,
  onMoveCard,
  onReorderLists,
  currentUser,
  activeBoardPeers = [],
  activities = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  
  // Inline editing state for list header
  const [editingListId, setEditingListId] = useState(null);
  const [editingListTitle, setEditingListTitle] = useState('');
  const [activeListMenuId, setActiveListMenuId] = useState(null);

  // Quick inline add task per column
  const [quickAddListId, setQuickAddListId] = useState(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState('medium');

  // Real-Time Activity Audit Drawer State
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);

  if (!board) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', background: '#FFFFFF' }}>
        Select or create a board to begin workspace collaboration.
      </div>
    );
  }

  // Board KPI Metrics Calculation
  const allBoardCards = board.lists ? board.lists.flatMap(l => l.cards || []) : [];
  const totalCardsCount = allBoardCards.length;
  const doneCardsCount = allBoardCards.filter(c => c.status === 'done' || c.status === 'completed').length;
  const urgentCardsCount = allBoardCards.filter(c => c.priority === 'urgent' || c.priority === 'high').length;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'badge-urgent';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'column') {
      if (onReorderLists) {
        onReorderLists(source.index, destination.index);
      }
    } else {
      if (onMoveCard) {
        onMoveCard(draggableId, source.droppableId, destination.droppableId, source.index, destination.index);
      }
    }
  };

  const handleSaveListTitle = (listId) => {
    if (editingListTitle.trim() && onUpdateList) {
      onUpdateList(listId, { title: editingListTitle.trim() });
    }
    setEditingListId(null);
  };

  const handleSetWipLimit = (list) => {
    const newLimit = prompt(`Set Work In Progress (WIP) Limit for "${list.title}" (0 = Unlimited):`, list.wipLimit || 0);
    if (newLimit !== null && onUpdateList) {
      onUpdateList(list._id, { wipLimit: parseInt(newLimit, 10) || 0 });
    }
    setActiveListMenuId(null);
  };

  const handleChangeListColor = (listId, colorHex) => {
    if (onUpdateList) {
      onUpdateList(listId, { color: colorHex });
    }
    setActiveListMenuId(null);
  };

  const handleSubmitQuickAdd = (listId) => {
    if (quickTaskTitle.trim() && onQuickAddCard) {
      onQuickAddCard(listId, quickTaskTitle.trim(), quickTaskPriority);
      setQuickTaskTitle('');
      setQuickAddListId(null);
    }
  };

  const colorPresets = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#64748B'];

  return (
    <main style={{ flex: 1, padding: '1.25rem', overflowX: 'auto', display: 'flex', flexDirection: 'column', background: '#FFFFFF', position: 'relative' }}>
      
      {/* Board Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
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
            <span style={{ background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #A7F3D0' }}>
              <span className="status-online-dot" style={{ background: '#10B981', width: '6px', height: '6px', borderRadius: '50%' }}></span>
              {activeBoardPeers.length + 1} Connected {activeBoardPeers.length + 1 === 1 ? 'User' : 'Users'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
            {board.description || 'Real-time interactive Kanban workflow board.'}
          </p>
        </div>

        {/* Board Controls & Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          
          {/* Live Search Bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94A3B8' }} />
            <input 
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                fontSize: '0.78rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                width: '180px',
                outline: 'none',
                background: '#F8FAFC'
              }}
            />
            {searchQuery && (
              <X 
                size={14} 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', cursor: 'pointer', color: '#94A3B8' }}
              />
            )}
          </div>

          {/* Priority Quick Filter Pills */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                style={{
                  background: selectedPriority === p ? '#FFFFFF' : 'transparent',
                  color: selectedPriority === p ? '#4F46E5' : '#64748B',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: selectedPriority === p ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  boxShadow: selectedPriority === p ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* User Task Filter Toggle */}
          {currentUser && (
            <button
              onClick={() => setFilterMyTasks(!filterMyTasks)}
              style={{
                background: filterMyTasks ? '#EEF2FF' : '#FFFFFF',
                color: filterMyTasks ? '#4F46E5' : '#475569',
                border: filterMyTasks ? '1px solid #4F46E5' : '1px solid #CBD5E1',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <UserCheck size={14} color={filterMyTasks ? '#4F46E5' : '#64748B'} /> 
              {filterMyTasks ? `My Tasks` : 'All Members'}
            </button>
          )}

          {/* Real-Time Activity Log Drawer Toggle Button */}
          <button
            onClick={() => setIsActivityDrawerOpen(!isActivityDrawerOpen)}
            style={{
              background: isActivityDrawerOpen ? '#EEF2FF' : '#FFFFFF',
              color: isActivityDrawerOpen ? '#4F46E5' : '#475569',
              border: isActivityDrawerOpen ? '1px solid #4F46E5' : '1px solid #CBD5E1',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Activity size={14} color={isActivityDrawerOpen ? '#4F46E5' : '#64748B'} />
            Activity Log
          </button>

          {/* Add List Column Button */}
          <button
            onClick={onAddListClick}
            className="btn-secondary"
          >
            <Plus size={14} /> Add Column
          </button>

          {/* Primary Create Task Button */}
          <button
            onClick={() => onAddCardClick(board.lists?.[0]?._id)}
            className="btn-primary"
          >
            <Plus size={14} /> Add Card
          </button>
        </div>
      </div>

      {/* Board Executive Metric Ribbon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '1.25rem',
        background: 'linear-gradient(90deg, #F8FAFC 0%, #EEF2FF 100%)',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '0.6rem 1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
          <Layers size={15} color="#4F46E5" /> Total Cards: <strong style={{ color: '#0F172A', fontWeight: 800 }}>{totalCardsCount}</strong>
        </div>
        <div style={{ height: '14px', width: '1px', background: '#CBD5E1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
          <CheckCircle2 size={15} color="#059669" /> Completed: <strong style={{ color: '#059669', fontWeight: 800 }}>{doneCardsCount}</strong>
        </div>
        <div style={{ height: '14px', width: '1px', background: '#CBD5E1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
          <AlertCircle size={15} color={urgentCardsCount > 0 ? '#DC2626' : '#64748B'} /> High / Urgent: <strong style={{ color: urgentCardsCount > 0 ? '#DC2626' : '#0F172A', fontWeight: 800 }}>{urgentCardsCount}</strong>
        </div>
        <div style={{ height: '14px', width: '1px', background: '#CBD5E1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
          <Users size={15} color="#0891B2" /> Active Lead: <strong style={{ color: '#0F172A', fontWeight: 800 }}>{currentUser?.name?.split(' ')[0] || 'Team'}</strong>
        </div>
      </div>

      {/* Main Drag and Drop Canvas Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board-columns" direction="horizontal" type="column">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flex: 1, paddingBottom: '1.5rem' }}
            >
              {board.lists?.map((list, listIndex) => {
                const displayedCards = list.cards?.filter(c => {
                  if (filterMyTasks && currentUser) {
                    const isAssigned = c.assignees && c.assignees.some(a => (a._id || a) === currentUser._id);
                    if (!isAssigned) return false;
                  }
                  if (selectedPriority !== 'all' && c.priority !== selectedPriority) {
                    return false;
                  }
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const matchesTitle = c.title.toLowerCase().includes(q);
                    const matchesKey = c.key?.toLowerCase().includes(q);
                    if (!matchesTitle && !matchesKey) return false;
                  }
                  return true;
                }) || [];

                const isWipExceeded = list.wipLimit > 0 && list.cards?.length > list.wipLimit;
                const wipRatio = list.wipLimit > 0 ? Math.min(100, Math.round(((list.cards?.length || 0) / list.wipLimit) * 100)) : 0;

                return (
                  <Draggable key={list._id} draggableId={list._id} index={listIndex}>
                    {(listProvided, listSnapshot) => (
                      <div
                        ref={listProvided.innerRef}
                        {...listProvided.draggableProps}
                        style={{
                          width: '320px',
                          minWidth: '320px',
                          maxHeight: 'calc(100vh - 180px)',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '1rem',
                          borderRadius: '12px',
                          backgroundColor: listSnapshot.isDragging ? '#F0F9FF' : '#F8FAFC',
                          border: isWipExceeded 
                            ? '1.5px solid #FCA5A5' 
                            : listSnapshot.isDragging ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
                          boxShadow: listSnapshot.isDragging ? '0 12px 30px rgba(0,0,0,0.12)' : 'var(--shadow-sm)',
                          transition: 'border 0.2s, background-color 0.2s',
                          position: 'relative',
                          ...listProvided.draggableProps.style
                        }}
                      >
                        {/* Column Header Accent Bar */}
                        <div style={{ height: '3px', background: list.color || '#3B82F6', borderRadius: '3px 3px 0 0', marginBottom: '0.75rem', width: '100%' }} />

                        {/* Column Header Bar */}
                        <div
                          {...listProvided.dragHandleProps}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', cursor: 'grab' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: list.color || '#3B82F6', flexShrink: 0 }} />
                            
                            {/* Inline Title Editor */}
                            {editingListId === list._id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                                <input
                                  type="text"
                                  value={editingListTitle}
                                  onChange={(e) => setEditingListTitle(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveListTitle(list._id); }}
                                  autoFocus
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    border: '1px solid #4F46E5',
                                    borderRadius: '4px',
                                    width: '100%'
                                  }}
                                />
                                <button onClick={() => handleSaveListTitle(list._id)} style={{ border: 'none', background: '#10B981', color: '#fff', borderRadius: '4px', padding: '2px 4px', cursor: 'pointer' }}>
                                  <Check size={12} />
                                </button>
                              </div>
                            ) : (
                              <h3 
                                onDoubleClick={() => { setEditingListId(list._id); setEditingListTitle(list.title); }}
                                style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title="Double click to edit title"
                              >
                                {list.title}
                              </h3>
                            )}

                            {/* Card Count & WIP Limit Badge */}
                            <span style={{
                              background: isWipExceeded ? '#FEE2E2' : '#E2E8F0',
                              color: isWipExceeded ? '#DC2626' : '#475569',
                              padding: '2px 7px',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              flexShrink: 0
                            }}>
                              {isWipExceeded && <AlertTriangle size={11} color="#DC2626" />}
                              {list.cards?.length || 0}{list.wipLimit > 0 ? `/${list.wipLimit}` : ''}
                            </span>
                          </div>

                          {/* Column Action Controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setQuickAddListId(quickAddListId === list._id ? null : list._id); }}
                              title="Quick Add Card"
                              style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '3px' }}
                            >
                              <Plus size={16} />
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveListMenuId(activeListMenuId === list._id ? null : list._id); }}
                              title="Column Settings"
                              style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '3px' }}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Column WIP Capacity Progress Bar */}
                        {list.wipLimit > 0 && (
                          <div style={{ marginBottom: '0.75rem', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: isWipExceeded ? '#DC2626' : '#64748B', fontWeight: 700, marginBottom: '2px' }}>
                              <span>WIP Capacity</span>
                              <span>{list.cards?.length || 0} / {list.wipLimit} ({wipRatio}%)</span>
                            </div>
                            <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${wipRatio}%`,
                                background: isWipExceeded ? '#EF4444' : wipRatio >= 80 ? '#F59E0B' : '#10B981',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>
                        )}

                        {/* List Column Header Dropdown Menu */}
                        {activeListMenuId === list._id && (
                          <div style={{
                            position: 'absolute',
                            top: '40px',
                            right: '12px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            zIndex: 50,
                            padding: '6px',
                            width: '170px'
                          }}>
                            <button
                              onClick={() => { setEditingListId(list._id); setEditingListTitle(list.title); setActiveListMenuId(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#334155', cursor: 'pointer', borderRadius: '4px' }}
                            >
                              <Edit2 size={13} /> Rename Column
                            </button>
                            <button
                              onClick={() => handleSetWipLimit(list)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#334155', cursor: 'pointer', borderRadius: '4px' }}
                            >
                              <AlertTriangle size={13} /> Set WIP Limit ({list.wipLimit || 'None'})
                            </button>
                            
                            <div style={{ borderTop: '1px solid #F1F5F9', margin: '4px 0', paddingTop: '4px' }}>
                              <div style={{ fontSize: '0.65rem', color: '#94A3B8', padding: '0 8px 4px', fontWeight: 600 }}>Theme Color</div>
                              <div style={{ display: 'flex', gap: '4px', padding: '0 8px 4px' }}>
                                {colorPresets.map(c => (
                                  <div
                                    key={c}
                                    onClick={() => handleChangeListColor(list._id, c)}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      background: c,
                                      cursor: 'pointer',
                                      border: list.color === c ? '2px solid #0F172A' : 'none'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            {onDeleteList && (
                              <button
                                onClick={() => { setActiveListMenuId(null); onDeleteList(list._id); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '6px 8px', border: 'none', background: '#FEF2F2', fontSize: '0.75rem', color: '#DC2626', cursor: 'pointer', borderRadius: '4px', marginTop: '4px' }}
                              >
                                <Trash2 size={13} /> Delete Column
                              </button>
                            )}
                          </div>
                        )}

                        {/* Cards Droppable Canvas Area */}
                        <Droppable droppableId={list._id} type="task">
                          {(cardsProvided, cardsSnapshot) => (
                            <div
                              ref={cardsProvided.innerRef}
                              {...cardsProvided.droppableProps}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                overflowY: 'auto',
                                flex: 1,
                                paddingRight: '2px',
                                minHeight: '60px',
                                backgroundColor: cardsSnapshot.isDraggingOver ? '#EEF2FF' : 'transparent',
                                borderRadius: '8px',
                                padding: '4px',
                                transition: 'background-color 0.15s'
                              }}
                            >
                              {displayedCards.length === 0 ? (
                                <div style={{
                                  padding: '1.5rem 1rem',
                                  textAlign: 'center',
                                  color: '#94A3B8',
                                  fontSize: '0.75rem',
                                  border: '1px dashed #CBD5E1',
                                  borderRadius: '8px',
                                  background: '#FFFFFF'
                                }}>
                                  No matching tasks in this list.
                                </div>
                              ) : (
                                displayedCards.map((card, cardIndex) => {
                                  const completedSubtasks = card.subtasks?.filter(s => s.completed).length || 0;
                                  const totalSubtasks = card.subtasks?.length || 0;
                                  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                                  const isAssignedToUser = currentUser && card.assignees?.some(a => (a._id || a) === currentUser._id);

                                  return (
                                    <Draggable key={card._id} draggableId={card._id} index={cardIndex}>
                                      {(cardProvided, cardSnapshot) => (
                                        <div
                                          ref={cardProvided.innerRef}
                                          {...cardProvided.draggableProps}
                                          {...cardProvided.dragHandleProps}
                                          onClick={() => onCardClick(card._id)}
                                          className="glass-card"
                                          style={{
                                            padding: '0.85rem',
                                            cursor: 'grab',
                                            background: '#FFFFFF',
                                            borderLeft: `4px solid ${list.color || '#3B82F6'}`,
                                            border: isAssignedToUser ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                                            boxShadow: cardSnapshot.isDragging 
                                              ? '0 14px 28px rgba(79, 70, 229, 0.22)' 
                                              : isAssignedToUser ? '0 2px 8px rgba(79, 70, 229, 0.12)' : 'var(--shadow-sm)',
                                            transform: cardSnapshot.isDragging ? 'rotate(1.5deg)' : 'none',
                                            position: 'relative',
                                            ...cardProvided.draggableProps.style
                                          }}
                                        >
                                          {/* Card Top Meta: Key & Priority */}
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#4F46E5', fontWeight: 700 }}>
                                              {card.key}
                                            </span>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                              <span className={getPriorityBadgeClass(card.priority)} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 700 }}>
                                                {card.priority}
                                              </span>

                                              {onDeleteCard && (
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); onDeleteCard(card._id); }}
                                                  title="Delete Card"
                                                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '1px' }}
                                                >
                                                  <Trash2 size={13} />
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          {/* Card Title */}
                                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                            {card.title}
                                          </h4>

                                          {/* Subtask Progress Bar */}
                                          {totalSubtasks > 0 && (
                                            <div style={{ marginBottom: '0.6rem' }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginBottom: '2px', fontWeight: 600 }}>
                                                <span>Subtasks</span>
                                                <span>{completedSubtasks}/{totalSubtasks} ({subtaskPercent}%)</span>
                                              </div>
                                              <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${subtaskPercent}%`, background: subtaskPercent === 100 ? '#10B981' : '#3B82F6', borderRadius: '2px' }} />
                                              </div>
                                            </div>
                                          )}

                                          {/* Card Tags */}
                                          {card.labels && card.labels.length > 0 && (
                                            <div style={{ display: 'flex', gap: '4px', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
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

                                          {/* Card Footer Info & Assignees */}
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', marginTop: '0.4rem', fontSize: '0.7rem', color: '#64748B' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                              {card.comments && card.comments.length > 0 && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                  <MessageSquare size={13} /> {card.comments.length}
                                                </span>
                                              )}
                                              {card.storyPoints > 0 && (
                                                <span style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                                  {card.storyPoints} pts
                                                </span>
                                              )}
                                            </div>

                                            {/* Assignees Avatars */}
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
                                      )}
                                    </Draggable>
                                  );
                                })
                              )}
                              {cardsProvided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* Inline Quick Add Task Box */}
                        {quickAddListId === list._id ? (
                          <div style={{ marginTop: '0.75rem', background: '#FFFFFF', border: '1px solid #C7D2FE', borderRadius: '8px', padding: '0.65rem', boxShadow: 'var(--shadow-sm)' }}>
                            <input
                              type="text"
                              placeholder="What needs to be done?"
                              value={quickTaskTitle}
                              onChange={(e) => setQuickTaskTitle(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitQuickAdd(list._id); }}
                              autoFocus
                              style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid #CBD5E1', borderRadius: '4px', outline: 'none', marginBottom: '0.5rem' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <select
                                value={quickTaskPriority}
                                onChange={(e) => setQuickTaskPriority(e.target.value)}
                                style={{ fontSize: '0.72rem', padding: '2px 4px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                              >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="urgent">Urgent</option>
                              </select>

                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => setQuickAddListId(null)}
                                  style={{ border: 'none', background: '#F1F5F9', color: '#64748B', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSubmitQuickAdd(list._id)}
                                  style={{ border: 'none', background: '#4F46E5', color: '#FFFFFF', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Quick Add Card Trigger Button */
                          <button
                            onClick={() => setQuickAddListId(list._id)}
                            style={{
                              marginTop: '0.75rem',
                              background: '#FFFFFF',
                              border: '1px dashed #CBD5E1',
                              borderRadius: '8px',
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
                            <Plus size={14} /> Quick Add Card
                          </button>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}

              {/* Add List Column Button */}
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
          )}
        </Droppable>
      </DragDropContext>

      {/* Real-Time Activity Audit Log Drawer Side Panel */}
      {isActivityDrawerOpen && (
        <div 
          className="glass-panel animate-modal"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '360px',
            background: '#FFFFFF',
            borderLeft: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#4F46E5" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Board Activity Feed</h3>
            </div>
            <button onClick={() => setIsActivityDrawerOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activities.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: '0.8rem', textAlign: 'center', paddingTop: '2rem' }}>
                No recent activity recorded for this board.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act._id} style={{ display: 'flex', gap: '0.75rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <img 
                    src={act.userDetail?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt="User" 
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', marginTop: '2px' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                      {act.userDetail?.name || 'Collaborator'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                      {act.action === 'created_card' ? 'created card' : act.action === 'moved_card' ? 'moved card' : act.action === 'deleted_card' ? 'deleted card' : 'updated'} 
                      <strong style={{ color: '#4F46E5', marginLeft: '4px' }}>"{act.details?.cardTitle || 'Task'}"</strong>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}
