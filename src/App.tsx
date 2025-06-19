import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import QuestionsList from './components/Questions/QuestionsList';

type AppView = 'dashboard' | 'questions';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleOpenFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setCurrentView('questions');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedFolderId(null);
  };

  if (!state.currentUser) {
    return <Login />;
  }

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard onOpenFolder={handleOpenFolder} />
      )}
      
      {currentView === 'questions' && selectedFolderId && (
        <QuestionsList 
          folderId={selectedFolderId} 
          onBack={handleBackToDashboard}
        />
      )}
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;