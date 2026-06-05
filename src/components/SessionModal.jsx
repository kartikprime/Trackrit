import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { addSession, calcDuration, getSubjects } from '../utils/storage';
import { useApp } from '../context/AppContext';

export default function SessionModal() {
  const { setShowSessionModal, refresh } = useApp();
  const subjects = getSubjects();

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedTopic = selectedSubject?.topics.find(t => t.id === selectedTopicId);

  const handleSubjectChange = (e) => {
    setSelectedSubjectId(e.target.value);
    setSelectedTopicId('');
    setSelectedSubtopicIds([]);
  };

  const handleTopicChange = (e) => {
    setSelectedTopicId(e.target.value);
    setSelectedSubtopicIds([]);
  };

  const toggleSubtopic = (id) => {
    setSelectedSubtopicIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!date) return setError('Please select a date.');
    if (!startTime) return setError('Please enter start time.');
    if (!endTime) return setError('Please enter end time.');
    if (!selectedSubjectId) return setError('Please select a subject.');
    if (!selectedTopicId) return setError('Please select a topic.');
    if (selectedSubtopicIds.length === 0) return setError('Select at least one subtopic.');

    addSession({
      date,
      startTime,
      endTime,
      subjectId: selectedSubjectId,
      topicId: selectedTopicId,
      subtopicIds: selectedSubtopicIds,
    });

    setSaved(true);
    refresh();
    setTimeout(() => {
      setShowSessionModal(false);
    }, 800);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #EDE9E0', borderRadius: '8px',
    fontSize: '0.875rem', color: '#1C1917',
    background: '#FAFAF8', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  };

  const labelStyle = {
    display: 'block', fontSize: '0.75rem',
    fontWeight: 600, color: '#78716C',
    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  const duration = startTime && endTime ? calcDuration(startTime, endTime) : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowSessionModal(false); }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto',
        padding: '24px 20px 32px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#1C1917' }}>
              Log Study Session
            </div>
            {duration && (
              <div style={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 600, marginTop: '2px' }}>
                ⏱ {duration}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowSessionModal(false)}
            style={{ background: '#F5F5F4', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
          >
            <X size={18} color="#78716C" />
          </button>
        </div>

        {/* Date */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>

        {/* Times */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Start Time</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>End Time</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Subject */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Subject</label>
          <select value={selectedSubjectId} onChange={handleSubjectChange} style={inputStyle}>
            <option value="">Select subject...</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Topic */}
        {selectedSubject && (
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Topic</label>
            <select value={selectedTopicId} onChange={handleTopicChange} style={inputStyle}>
              <option value="">Select topic...</option>
              {selectedSubject.topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Subtopics */}
        {selectedTopic && selectedTopic.subtopics.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Subtopics Covered (multi-select)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedTopic.subtopics.map(st => {
                const checked = selectedSubtopicIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtopic(st.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                      background: checked ? '#F0FDFA' : '#FAFAF8',
                      border: `1.5px solid ${checked ? '#0D9488' : '#EDE9E0'}`,
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '4px',
                      background: checked ? '#0D9488' : '#FFFFFF',
                      border: `2px solid ${checked ? '#0D9488' : '#D6D3D1'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {checked && <Check size={11} color="white" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#1C1917', fontWeight: checked ? 600 : 400 }}>
                      {st.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: '#DC2626', fontSize: '0.8rem', marginBottom: '12px', background: '#FEF2F2', padding: '8px 12px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '13px',
            background: saved ? '#10B981' : '#0D9488',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {saved ? <><Check size={18} /> Saved!</> : 'Save Session'}
        </button>
      </div>
    </div>
  );
}
