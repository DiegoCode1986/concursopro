import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Folder, Question, StudySession } from '../types';

interface AppState {
  currentUser: User | null;
  folders: Folder[];
  questions: Question[];
  studySession: StudySession | null;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'UPDATE_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: Question }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'SET_STUDY_SESSION'; payload: StudySession | null }
  | { type: 'UPDATE_STUDY_SESSION'; payload: Partial<StudySession> };

const initialState: AppState = {
  currentUser: null,
  folders: [],
  questions: [],
  studySession: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    case 'ADD_FOLDER':
      return { ...state, folders: [...state.folders, action.payload] };
    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map(folder =>
          folder.id === action.payload.id ? action.payload : folder
        ),
      };
    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(folder => folder.id !== action.payload),
        questions: state.questions.filter(question => question.folderId !== action.payload),
      };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'ADD_QUESTION':
      return { ...state, questions: [...state.questions, action.payload] };
    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(question =>
          question.id === action.payload.id ? action.payload : question
        ),
      };
    case 'DELETE_QUESTION':
      return {
        ...state,
        questions: state.questions.filter(question => question.id !== action.payload),
      };
    case 'SET_STUDY_SESSION':
      return { ...state, studySession: action.payload };
    case 'UPDATE_STUDY_SESSION':
      return {
        ...state,
        studySession: state.studySession ? { ...state.studySession, ...action.payload } : null,
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      dispatch({ type: 'SET_USER', payload: user });
      
      // Load user's folders and questions
      const userFolders = JSON.parse(localStorage.getItem(`folders_${user.id}`) || '[]');
      const userQuestions = JSON.parse(localStorage.getItem(`questions_${user.id}`) || '[]');
      
      dispatch({ type: 'SET_FOLDERS', payload: userFolders });
      dispatch({ type: 'SET_QUESTIONS', payload: userQuestions });
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
      localStorage.setItem(`folders_${state.currentUser.id}`, JSON.stringify(state.folders));
      localStorage.setItem(`questions_${state.currentUser.id}`, JSON.stringify(state.questions));
    }
  }, [state.currentUser, state.folders, state.questions]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};