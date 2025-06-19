export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  userId: string;
  questionCount?: number;
}

export type QuestionType = 'multiple' | 'boolean';

export interface Question {
  id: string;
  folderId: string;
  userId: string;
  title: string;
  type: QuestionType;
  // Para múltipla escolha
  options?: string[];
  correctAnswer?: string; // 'A', 'B', 'C', 'D', 'E'
  // Para verdadeiro/falso
  correctBoolean?: boolean;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  folderId: string;
  timeInMinutes: number;
  startTime: number;
  remainingTime: number;
  isActive: boolean;
  isPaused: boolean;
}