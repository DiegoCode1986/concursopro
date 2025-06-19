import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Folder, Question, StudySession } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface AppState {
  folders: Folder[];
  questions: Question[];
  studySession: StudySession | null;
}

type AppAction = 
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'UPDATE_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: Question }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'SET_STUDY_SESSION'; payload: StudySession | null }
  | { type: 'UPDATE_STUDY_SESSION'; payload: Partial<StudySession> }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  folders: [],
  questions: [],
  studySession: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
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
    case 'RESET_STATE':
      return initialState;
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
  const { user } = useAuth();

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load folders from Supabase
      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (foldersError) throw foldersError;

      // Load questions from Supabase
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      // Transform data to match our types
      const transformedFolders: Folder[] = folders?.map(folder => ({
        id: folder.id,
        name: folder.name,
        description: folder.description,
        createdAt: folder.created_at,
        userId: folder.user_id,
      })) || [];

      const transformedQuestions: Question[] = questions?.map(question => ({
        id: question.id,
        folderId: question.folder_id,
        userId: question.user_id,
        title: question.title,
        type: question.type,
        options: question.options,
        correctAnswer: question.correct_answer,
        correctBoolean: question.correct_boolean,
        explanation: question.explanation,
        createdAt: question.created_at,
        updatedAt: question.updated_at,
      })) || [];

      dispatch({ type: 'SET_FOLDERS', payload: transformedFolders });
      dispatch({ type: 'SET_QUESTIONS', payload: transformedQuestions });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Save data to Supabase when state changes
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      try {
        // This will be handled by individual CRUD operations
        // rather than bulk saves to avoid conflicts
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [state.folders, state.questions, user]);

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