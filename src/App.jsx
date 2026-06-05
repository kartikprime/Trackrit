import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import SubjectView from './components/SubjectView';
import SessionModal from './components/SessionModal';

function AppContent() {
  const { currentView, showSessionModal } = useApp();

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F2' }}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'subject' && <SubjectView />}
      {showSessionModal && <SessionModal />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
