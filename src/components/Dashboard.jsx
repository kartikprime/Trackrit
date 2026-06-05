import React, { useState } from 'react';
import { Plus, Search, Download, Upload, BookOpen } from 'lucide-react';
import { addSubject, exportData, importData } from '../utils/storage';
import { useApp } from '../context/AppContext';
import NeedsAttention from './NeedsAttention';
import SubjectCard from './SubjectCard';

export default function Dashboard() {
  const { subjects, refresh, setShowSessionModal, searchQuery, setSearchQuery } = useApp();
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [importError, setImportError] = useState('');

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    addSubject(newSubjectName.trim());
    setNewSubjectName('');
    setShowAddSubject(false);
    refresh();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importData(ev.target.result);
      if (ok) { refresh(); setImportError(''); }
      else setImportError('Invalid backup file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topics.some(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtopics.some(st => st.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '20px 16px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.75rem', fontWeight: 700, color: '#1C1917', lineHeight: 1.2,
        }}>
          TrackRit
        </div>
        <div style={{ fontSize: '0.8rem', color: '#78716C', marginTop: '2px' }}>
          Your revision companion
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={15} color="#A8A29E" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search subjects, topics, subtopics..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            border: '1.5px solid #EDE9E0', borderRadius: '10px',
            fontSize: '0.875rem', color: '#1C1917', background: '#FFFFFF',
            outline: 'none', fontFamily: "'DM Sans', sans-serif",
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Needs Attention */}
      {!searchQuery && <NeedsAttention />}

      {/* Subjects Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1C1917', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={15} color="#0D9488" />
          Subjects
          <span style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 400 }}>
            ({subjects.length})
          </span>
        </div>
        <button
          onClick={() => setShowAddSubject(!showAddSubject)}
          style={{
            background: '#0D9488', color: 'white', border: 'none',
            borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Plus size={14} /> Add Subject
        </button>
      </div>

      {/* Add Subject Input */}
      {showAddSubject && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            autoFocus
            type="text"
            placeholder="Subject name..."
            value={newSubjectName}
            onChange={e => setNewSubjectName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddSubject(); if (e.key === 'Escape') setShowAddSubject(false); }}
            style={{
              flex: 1, padding: '9px 12px',
              border: '1.5px solid #0D9488', borderRadius: '8px',
              fontSize: '0.875rem', color: '#1C1917', background: '#F0FDFA',
              outline: 'none', fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button
            onClick={handleAddSubject}
            style={{
              background: '#0D9488', color: 'white', border: 'none',
              borderRadius: '8px', padding: '9px 16px', fontWeight: 600,
              cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* Subject List */}
      {filteredSubjects.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          color: '#A8A29E', fontSize: '0.875rem',
        }}>
          {searchQuery ? 'No results found.' : 'No subjects yet. Add your first subject!'}
        </div>
      ) : (
        filteredSubjects.map(subject => (
          <SubjectCard key={subject.id} subject={subject} />
        ))
      )}

      {/* Export/Import */}
      {subjects.length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
          <button
            onClick={exportData}
            style={{
              flex: 1, padding: '10px', background: '#FFFFFF',
              border: '1.5px solid #EDE9E0', borderRadius: '10px',
              fontSize: '0.8rem', fontWeight: 600, color: '#78716C',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Download size={14} /> Export Backup
          </button>
          <label style={{
            flex: 1, padding: '10px', background: '#FFFFFF',
            border: '1.5px solid #EDE9E0', borderRadius: '10px',
            fontSize: '0.8rem', fontWeight: 600, color: '#78716C',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <Upload size={14} /> Import Backup
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      )}
      {importError && (
        <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>{importError}</div>
      )}

      {/* Start Session FAB */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 100,
      }}>
        <button
          onClick={() => setShowSessionModal(true)}
          style={{
            background: '#0D9488', color: 'white', border: 'none',
            borderRadius: '999px', padding: '14px 28px',
            fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          ✏️ Start Study Session
        </button>
      </div>
    </div>
  );
}
