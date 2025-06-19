import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import AuthForm from './components/Auth/AuthForm';
import LoadingScreen from './components/Auth/LoadingScreen';
import Dashboard from './components/Dashboard/Dashboard';
import QuestionsList from './components/Questions/QuestionsList';

type AppView = 'dashboard' | 'questions';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <AppProvider>
      {currentView === 'dashboard' && (
        <Dashboard onOpenFolder={handleOpenFolder} />
      )}
      
      {currentView === 'questions' && selectedFolderId && (
        <QuestionsList 
          folderId={selectedFolderId} 
          onBack={handleBackToDashboard}
        />
      )}
    </AppProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;