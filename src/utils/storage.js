// localStorage keys
const KEYS = {
  SUBJECTS: 'trackrit_subjects',
  SESSIONS: 'trackrit_sessions',
};

// Generate unique ID
export const genId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ── Subjects (with topics and subtopics nested) ──

export const getSubjects = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SUBJECTS)) || [];
  } catch {
    return [];
  }
};

export const saveSubjects = (subjects) => {
  localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
};

export const addSubject = (name) => {
  const subjects = getSubjects();
  const newSubject = { id: genId(), name, topics: [] };
  subjects.push(newSubject);
  saveSubjects(subjects);
  return newSubject;
};

export const deleteSubject = (subjectId) => {
  const subjects = getSubjects().filter(s => s.id !== subjectId);
  saveSubjects(subjects);
};

export const addTopic = (subjectId, name) => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const newTopic = { id: genId(), name, subtopics: [] };
  subject.topics.push(newTopic);
  saveSubjects(subjects);
  return newTopic;
};

export const deleteTopic = (subjectId, topicId) => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return;
  subject.topics = subject.topics.filter(t => t.id !== topicId);
  saveSubjects(subjects);
};

export const addSubtopic = (subjectId, topicId, name) => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const topic = subject.topics.find(t => t.id === topicId);
  if (!topic) return;
  const newSubtopic = { id: genId(), name };
  topic.subtopics.push(newSubtopic);
  saveSubjects(subjects);
  return newSubtopic;
};

export const deleteSubtopic = (subjectId, topicId, subtopicId) => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const topic = subject.topics.find(t => t.id === topicId);
  if (!topic) return;
  topic.subtopics = topic.subtopics.filter(st => st.id !== subtopicId);
  saveSubjects(subjects);
};

// ── Sessions ──

export const getSessions = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SESSIONS)) || [];
  } catch {
    return [];
  }
};

export const saveSessions = (sessions) => {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
};

export const addSession = (session) => {
  const sessions = getSessions();
  const newSession = { id: genId(), ...session, createdAt: Date.now() };
  sessions.push(newSession);
  saveSessions(sessions);
  return newSession;
};

export const deleteSession = (sessionId) => {
  const sessions = getSessions().filter(s => s.id !== sessionId);
  saveSessions(sessions);
};

// ── Helpers ──

// Get all sessions for a specific subtopic
export const getSubtopicSessions = (subtopicId) => {
  return getSessions().filter(s => s.subtopicIds && s.subtopicIds.includes(subtopicId));
};

// Get last revised date for a subtopic
export const getLastRevised = (subtopicId) => {
  const sessions = getSubtopicSessions(subtopicId);
  if (sessions.length === 0) return null;
  const sorted = sessions.sort((a, b) => new Date(b.date + 'T' + b.endTime) - new Date(a.date + 'T' + a.endTime));
  return sorted[0];
};

// Get revision count for a subtopic
export const getRevisionCount = (subtopicId) => {
  return getSubtopicSessions(subtopicId).length;
};

// Get days since last revision
export const getDaysSinceRevision = (subtopicId) => {
  const last = getLastRevised(subtopicId);
  if (!last) return null;
  const lastDate = new Date(last.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
};

// Get warning status for a subtopic
export const getWarningStatus = (subtopicId) => {
  const days = getDaysSinceRevision(subtopicId);
  if (days === null) return 'never'; // never revised
  if (days >= 30) return 'critical';
  if (days >= 15) return 'warning';
  return 'ok';
};

// Get all overdue/warning subtopics across all subjects
export const getAttentionList = () => {
  const subjects = getSubjects();
  const list = [];
  subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        const status = getWarningStatus(subtopic.id);
        if (status !== 'ok') {
          const days = getDaysSinceRevision(subtopic.id);
          list.push({
            subtopicId: subtopic.id,
            subtopicName: subtopic.name,
            topicName: topic.name,
            subjectName: subject.name,
            subjectId: subject.id,
            status,
            days,
          });
        }
      });
    });
  });
  // Sort: never first, then by days desc
  return list.sort((a, b) => {
    if (a.status === 'never' && b.status !== 'never') return -1;
    if (b.status === 'never' && a.status !== 'never') return 1;
    return (b.days || 0) - (a.days || 0);
  });
};

// Calculate duration string from start/end times
export const calcDuration = (startTime, endTime) => {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let totalMins = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMins < 0) totalMins += 24 * 60;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

// Format date nicely
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Export data as JSON
export const exportData = () => {
  const data = {
    subjects: getSubjects(),
    sessions: getSessions(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trackrit_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Import data from JSON
export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.subjects) saveSubjects(data.subjects);
    if (data.sessions) saveSessions(data.sessions);
    return true;
  } catch {
    return false;
  }
};

// Get progress stats for a subject
export const getSubjectProgress = (subject) => {
  let total = 0;
  let covered = 0;
  subject.topics.forEach(topic => {
    topic.subtopics.forEach(subtopic => {
      total++;
      const count = getRevisionCount(subtopic.id);
      if (count > 0) covered++;
    });
  });
  return { total, covered };
};
