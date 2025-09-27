import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, BookOpen, Target, BarChart3, Download } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Question } from '../../types';
import { supabase } from '../../lib/supabase';
import { exportQuestionsToPDF } from '../../utils/pdfExport';
import InteractiveQuestionCard from './InteractiveQuestionCard';
import QuestionForm from './QuestionForm';
import StudyTimer from '../Timer/StudyTimer';
import Modal from '../UI/Modal';
import Button from '../UI/Button';

interface QuestionsListProps {
  folderId: string;
  onBack: () => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ folderId, onBack }) => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'multiple' | 'boolean'>('all');
  const [studyMode, setStudyMode] = useState<'practice' | 'review'>('practice');
  const [loading, setLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const folder = state.folders.find(f => f.id === folderId);
  const questions = state.questions.filter(q => q.folderId === folderId);

  const handleCreateQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            folder_id: questionData.folderId,
            user_id: questionData.userId,
            title: questionData.title,
            type: questionData.type,
            options: questionData.options || null,
            correct_answer: questionData.correctAnswer || null,
            correct_boolean: questionData.correctBoolean ?? null,
            explanation: questionData.explanation || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newQuestion: Question = {
        id: data.id,
        folderId: data.folder_id,
        userId: data.user_id,
        title: data.title,
        type: data.type,
        options: data.options,
        correctAnswer: data.correct_answer,
        correctBoolean: data.correct_boolean,
        explanation: data.explanation,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      dispatch({ type: 'ADD_QUESTION', payload: newQuestion });
      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error('Error creating question:', error);
      alert('Erro ao criar questão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingQuestion || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .update({
          title: questionData.title,
          type: questionData.type,
          options: questionData.options || null,
          correct_answer: questionData.correctAnswer || null,
          correct_boolean: questionData.correctBoolean ?? null,
          explanation: questionData.explanation || null,
        })
        .eq('id', editingQuestion.id)
        .select()
        .single();

      if (error) throw error;

      const updatedQuestion: Question = {
        ...editingQuestion,
        title: data.title,
        type: data.type,
        options: data.options,
        correctAnswer: data.correct_answer,
        correctBoolean: data.correct_boolean,
        explanation: data.explanation,
        updatedAt: data.updated_at,
      };

      dispatch({ type: 'UPDATE_QUESTION', payload: updatedQuestion });
      setEditingQuestion(null);
    } catch (error: any) {
      console.error('Error updating question:', error);
      alert('Erro ao atualizar questão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      dispatch({ type: 'DELETE_QUESTION', payload: questionId });
    } catch (error: any) {
      console.error('Error deleting question:', error);
      alert('Erro ao excluir questão: ' + error.message);
    }
  };

  const handleExportPDF = async () => {
    if (!folder || questions.length === 0) {
      alert('Não há questões para exportar.');
      return;
    }

    setExportingPDF(true);
    try {
      await exportQuestionsToPDF(questions, folder);
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      alert(error.message || 'Erro ao exportar PDF. Tente novamente.');
    } finally {
      setExportingPDF(false);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || question.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeCount = (type: 'multiple' | 'boolean') => {
    return questions.filter(q => q.type === type).length;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="outline" icon={ArrowLeft} size="sm">
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{folder?.name}</h1>
                  <p className="text-sm text-gray-600">{questions.length} questões</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Study Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setStudyMode('practice')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    studyMode === 'practice'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Target className="w-4 h-4 inline-block mr-1" />
                  Praticar
                </button>
                <button
                  onClick={() => setStudyMode('review')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    studyMode === 'review'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline-block mr-1" />
                  Revisar
                </button>
              </div>
              
              <StudyTimer folderId={folderId} />
              
              <Button 
                onClick={handleExportPDF}
                variant="outline" 
                icon={Download} 
                size="sm"
                disabled={exportingPDF || questions.length === 0}
              >
                {exportingPDF ? 'Gerando PDF...' : 'Exportar PDF'}
              </Button>
              
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                icon={Plus} 
                size="sm"
                disabled={loading}
              >
                Nova Questão
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar questões..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'multiple' | 'boolean')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">Todos os tipos ({questions.length})</option>
              <option value="multiple">Múltipla escolha ({getTypeCount('multiple')})</option>
              <option value="boolean">Verdadeiro/Falso ({getTypeCount('boolean')})</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Questões</p>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-3">
                <div className="w-6 h-6 text-green-600 font-bold flex items-center justify-center">V/F</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Verdadeiro/Falso</p>
                <p className="text-2xl font-bold text-gray-900">{getTypeCount('boolean')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-3">
                <div className="w-6 h-6 text-purple-600 font-bold flex items-center justify-center">A-E</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Múltipla Escolha</p>
                <p className="text-2xl font-bold text-gray-900">{getTypeCount('multiple')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Study Mode Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Modo {studyMode === 'practice' ? 'Praticar' : 'Revisar'}:</strong>{' '}
            {studyMode === 'practice' 
              ? 'Responda às questões e teste seus conhecimentos antes de ver o gabarito.'
              : 'Visualize todas as questões com suas respostas para revisão rápida.'
            }
          </p>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' 
                ? 'Nenhuma questão encontrada' 
                : 'Nenhuma questão criada'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Crie sua primeira questão para começar a estudar'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                icon={Plus}
                disabled={loading}
              >
                Criar primeira questão
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredQuestions.map((question) => (
              <InteractiveQuestionCard
                key={question.id}
                question={question}
                onEdit={setEditingQuestion}
                onDelete={handleDeleteQuestion}
                showAnswers={studyMode === 'review'}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Questão"
        size="xl"
      >
        <QuestionForm
          folderId={folderId}
          userId={user.id}
          onSubmit={handleCreateQuestion}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        title="Editar Questão"
        size="xl"
      >
        {editingQuestion && (
          <QuestionForm
            question={editingQuestion}
            folderId={folderId}
            userId={user.id}
            onSubmit={handleEditQuestion}
            onCancel={() => setEditingQuestion(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default QuestionsList;