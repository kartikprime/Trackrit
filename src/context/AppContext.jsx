import React, { createContext, useContext, useState, useCallback } from 'react';
import { getSubjects, getSessions } from '../utils/storage';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [subjects, setSubjects] = useState(() => getSubjects());
  const [sessions, setSessions] = useState(() => getSessions());
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'subject'
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshSubjects = useCallback(() => {
    setSubjects(getSubjects());
  }, []);

  const refreshSessions = useCallback(() => {
    setSessions(getSessions());
  }, []);

  const refresh = useCallback(() => {
    refreshSubjects();
    refreshSessions();
  }, [refreshSubjects, refreshSessions]);

  const navigateToSubject = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setCurrentView('subject');
  };

  const navigateToDashboard = () => {
    setSelectedSubjectId(null);
    setCurrentView('dashboard');
    setSearchQuery('');
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || null;

  return (
    <AppContext.Provider value={{
      subjects,
      sessions,
      currentView,
      selectedSubjectId,
      selectedSubject,
      showSessionModal,
      searchQuery,
      setSearchQuery,
      setShowSessionModal,
      navigateToSubject,
      navigateToDashboard,
      refresh,
      refreshSubjects,
      refreshSessions,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
