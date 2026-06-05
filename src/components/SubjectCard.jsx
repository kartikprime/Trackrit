import React, { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { deleteSubject, getSubjectProgress } from '../utils/storage';
import { useApp } from '../context/AppContext';

export default function SubjectCard({ subject }) {
  const { navigateToSubject, refresh } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { total, covered } = getSubjectProgress(subject);
  const percent = total > 0 ? Math.round((covered / total) * 100) : 0;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      deleteSubject(subject.id);
      refresh();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className="card"
      style={{ padding: '14px 16px', cursor: 'pointer', marginBottom: '10px' }}
      onClick={() => navigateToSubject(subject.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1C1917' }}>
            {subject.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#78716C', marginLeft: '8px' }}>
            {subject.topics.length} topic{subject.topics.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleDelete}
            style={{
              background: confirmDelete ? '#FEE2E2' : 'transparent',
              border: 'none', cursor: 'pointer', padding: '4px',
              borderRadius: '6px', color: confirmDelete ? '#DC2626' : '#D6D3D1',
              fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px'
            }}
          >
            <Trash2 size={13} />
            {confirmDelete && <span>Confirm?</span>}
          </button>
          <ChevronRight size={16} color="#A8A29E" />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="progress-bar" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: '#78716C', whiteSpace: 'nowrap', minWidth: '60px', textAlign: 'right' }}>
          {covered}/{total} subtopics
        </span>
      </div>
    </div>
  );
}
