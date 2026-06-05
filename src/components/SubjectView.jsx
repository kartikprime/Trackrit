import React, { useState } from 'react';
import { ChevronLeft, Plus, ChevronDown, ChevronUp, Trash2, Clock } from 'lucide-react';
import {
  addTopic, deleteTopic, addSubtopic, deleteSubtopic,
  getRevisionCount, getLastRevised, getDaysSinceRevision,
  getWarningStatus, getSubtopicSessions, formatDate, calcDuration
} from '../utils/storage';
import { useApp } from '../context/AppContext';

const warningColors = {
  never: { color: '#78716C', bg: '#F5F5F4', label: 'Never' },
  critical: { color: '#DC2626', bg: '#FEF2F2', label: '30+ days' },
  warning: { color: '#D97706', bg: '#FFFBEB', label: '15+ days' },
  ok: { color: '#0D9488', bg: '#F0FDFA', label: 'Recent' },
};

function SubtopicRow({ subtopic, subjectId, topicId }) {
  const { refresh } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const count = getRevisionCount(subtopic.id);
  const status = getWarningStatus(subtopic.id);
  const days = getDaysSinceRevision(subtopic.id);
  const cfg = warningColors[status];
  const sessions = getSubtopicSessions(subtopic.id).sort(
    (a, b) => new Date(b.date + 'T' + b.endTime) - new Date(a.date + 'T' + a.endTime)
  );

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      deleteSubtopic(subjectId, topicId, subtopic.id);
      refresh();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div style={{ marginBottom: '6px' }}>
      {/* Subtopic Row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
          background: expanded ? '#F0FDFA' : '#FAFAF8',
          border: `1px solid ${expanded ? '#0D948822' : '#EDE9E0'}`,
        }}
      >
        {/* Status dot */}
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: cfg.color, flexShrink: 0,
        }} />

        <span style={{ flex: 1, fontSize: '0.875rem', color: '#1C1917', fontWeight: 500 }}>
          {subtopic.name}
        </span>

        {/* Revision count */}
        <span style={{
          fontSize: '0.7rem', color: cfg.color, fontWeight: 700,
          background: cfg.bg, padding: '2px 8px', borderRadius: '999px',
          whiteSpace: 'nowrap',
        }}>
          {count}x
        </span>

        {/* Days ago */}
        <span style={{ fontSize: '0.7rem', color: '#A8A29E', whiteSpace: 'nowrap', minWidth: '55px', textAlign: 'right' }}>
          {status === 'never' ? 'Never' : `${days}d ago`}
        </span>

        {/* Delete */}
        <button
          onClick={handleDelete}
          style={{
            background: confirmDelete ? '#FEE2E2' : 'transparent',
            border: 'none', cursor: 'pointer', padding: '2px 4px',
            borderRadius: '4px', color: confirmDelete ? '#DC2626' : '#D6D3D1',
            fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px',
          }}
        >
          <Trash2 size={11} />
          {confirmDelete && <span>Del?</span>}
        </button>

        {expanded ? <ChevronUp size={14} color="#A8A29E" /> : <ChevronDown size={14} color="#A8A29E" />}
      </div>

      {/* Expanded Session History */}
      {expanded && (
        <div style={{
          marginLeft: '20px', marginTop: '4px',
          borderLeft: '2px solid #EDE9E0', paddingLeft: '12px',
        }}>
          {sessions.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: '#A8A29E', padding: '6px 0' }}>
              No sessions logged yet.
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 0', borderBottom: '1px solid #F5F5F4',
              }}>
                <Clock size={12} color="#A8A29E" flexShrink={0} />
                <span style={{ fontSize: '0.78rem', color: '#57534E', fontWeight: 500 }}>
                  {formatDate(session.date)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#A8A29E' }}>
                  {session.startTime} – {session.endTime}
                </span>
                <span style={{
                  fontSize: '0.7rem', color: '#0D9488', fontWeight: 600,
                  background: '#F0FDFA', padding: '1px 7px', borderRadius: '999px',
                  marginLeft: 'auto', whiteSpace: 'nowrap',
                }}>
                  {calcDuration(session.startTime, session.endTime)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TopicSection({ topic, subjectId }) {
  const { refresh } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [showAddSubtopic, setShowAddSubtopic] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleAddSubtopic = () => {
    if (!newSubtopicName.trim()) return;
    addSubtopic(subjectId, topic.id, newSubtopicName.trim());
    setNewSubtopicName('');
    setShowAddSubtopic(false);
    refresh();
  };

  const handleDeleteTopic = () => {
    if (confirmDelete) {
      deleteTopic(subjectId, topic.id);
      refresh();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="card" style={{ padding: '14px 16px', marginBottom: '12px' }}>
      {/* Topic Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: collapsed ? 0 : '10px', cursor: 'pointer' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1C1917', flex: 1 }}>
          📖 {topic.name}
        </span>
        <span style={{ fontSize: '0.72rem', color: '#A8A29E' }}>
          {topic.subtopics.length} subtopics
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleDeleteTopic(); }}
          style={{
            background: confirmDelete ? '#FEE2E2' : 'transparent',
            border: 'none', cursor: 'pointer', padding: '3px 6px',
            borderRadius: '5px', color: confirmDelete ? '#DC2626' : '#D6D3D1',
            fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px',
          }}
        >
          <Trash2 size={12} />
          {confirmDelete && <span>Confirm?</span>}
        </button>
        {collapsed ? <ChevronDown size={15} color="#A8A29E" /> : <ChevronUp size={15} color="#A8A29E" />}
      </div>

      {!collapsed && (
        <>
          {/* Subtopics */}
          {topic.subtopics.map(st => (
            <SubtopicRow key={st.id} subtopic={st} subjectId={subjectId} topicId={topic.id} />
          ))}

          {/* Add Subtopic */}
          {showAddSubtopic ? (
            <div style={{ display: 'flex', gap: '7px', marginTop: '8px' }}>
              <input
                autoFocus
                type="text"
                placeholder="Subtopic name..."
                value={newSubtopicName}
                onChange={e => setNewSubtopicName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSubtopic(); if (e.key === 'Escape') setShowAddSubtopic(false); }}
                style={{
                  flex: 1, padding: '7px 10px',
                  border: '1.5px solid #0D9488', borderRadius: '7px',
                  fontSize: '0.8rem', color: '#1C1917', background: '#F0FDFA',
                  outline: 'none', fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button
                onClick={handleAddSubtopic}
                style={{
                  background: '#0D9488', color: 'white', border: 'none',
                  borderRadius: '7px', padding: '7px 12px', fontWeight: 600,
                  cursor: 'pointer', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif",
                }}
              >Add</button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSubtopic(true)}
              style={{
                marginTop: '8px', background: 'transparent',
                border: '1.5px dashed #EDE9E0', borderRadius: '7px',
                padding: '7px 12px', width: '100%', color: '#A8A29E',
                fontSize: '0.8rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Plus size={13} /> Add Subtopic
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function SubjectView() {
  const { selectedSubject, navigateToDashboard, refresh, setShowSessionModal } = useApp();
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  if (!selectedSubject) return null;

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    addTopic(selectedSubject.id, newTopicName.trim());
    setNewTopicName('');
    setShowAddTopic(false);
    refresh();
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '20px 16px 100px' }}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={navigateToDashboard}
          style={{
            background: '#FFFFFF', border: '1.5px solid #EDE9E0', borderRadius: '8px',
            padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.8rem', color: '#78716C', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.3rem', fontWeight: 700, color: '#1C1917',
          }}>
            {selectedSubject.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#78716C' }}>
            {selectedSubject.topics.length} topic{selectedSubject.topics.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={() => setShowSessionModal(true)}
          style={{
            background: '#0D9488', color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 14px',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ✏️ Log Session
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { color: '#0D9488', label: 'Recent (<15d)' },
          { color: '#D97706', label: 'Warning (15d+)' },
          { color: '#DC2626', label: 'Critical (30d+)' },
          { color: '#78716C', label: 'Never' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: '0.7rem', color: '#78716C' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Topics */}
      {selectedSubject.topics.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#A8A29E', fontSize: '0.875rem' }}>
          No topics yet. Add your first topic!
        </div>
      )}

      {selectedSubject.topics.map(topic => (
        <TopicSection key={topic.id} topic={topic} subjectId={selectedSubject.id} />
      ))}

      {/* Add Topic */}
      {showAddTopic ? (
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            autoFocus
            type="text"
            placeholder="Topic / Chapter name..."
            value={newTopicName}
            onChange={e => setNewTopicName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddTopic(); if (e.key === 'Escape') setShowAddTopic(false); }}
            style={{
              flex: 1, padding: '9px 12px',
              border: '1.5px solid #0D9488', borderRadius: '8px',
              fontSize: '0.875rem', color: '#1C1917', background: '#F0FDFA',
              outline: 'none', fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button
            onClick={handleAddTopic}
            style={{
              background: '#0D9488', color: 'white', border: 'none',
              borderRadius: '8px', padding: '9px 16px', fontWeight: 600,
              cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif",
            }}
          >Add</button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddTopic(true)}
          style={{
            width: '100%', padding: '12px', background: '#FFFFFF',
            border: '2px dashed #D6D3D1', borderRadius: '10px',
            fontSize: '0.875rem', fontWeight: 600, color: '#A8A29E',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            fontFamily: "'DM Sans', sans-serif", marginTop: '4px',
          }}
        >
          <Plus size={15} /> Add Topic
        </button>
      )}

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
        <button
          onClick={() => setShowSessionModal(true)}
          style={{
            background: '#0D9488', color: 'white', border: 'none',
            borderRadius: '999px', padding: '14px 28px',
            fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
          }}
        >
          ✏️ Start Study Session
        </button>
      </div>
    </div>
  );
}
