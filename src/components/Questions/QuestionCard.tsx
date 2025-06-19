import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  showAnswers?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onDelete,
  showAnswers = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAnswer, setShowAnswer] = useState(showAnswers);

  const getCorrectAnswerDisplay = () => {
    if (question.type === 'multiple') {
      return `Letra ${question.correctAnswer}`;
    } else {
      return question.correctBoolean ? 'CERTO' : 'ERRADO';
    }
  };

  const getAnswerIcon = () => {
    if (question.type === 'boolean') {
      return question.correctBoolean ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.type === 'multiple' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {question.type === 'multiple' ? 'Múltipla Escolha' : 'Verdadeiro/Falso'}
            </span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(question);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDelete(question.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-medium text-gray-900 mb-4 leading-relaxed">
          {question.title}
        </h3>

        {question.type === 'multiple' && question.options && (
          <div className="space-y-2 mb-4">
            {question.options.map((option, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                showAnswer && question.correctAnswer === String.fromCharCode(65 + index)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <span className="font-medium text-gray-700">
                  {String.fromCharCode(65 + index)})
                </span>
                <span className="ml-2 text-gray-900">{option}</span>
                {showAnswer && question.correctAnswer === String.fromCharCode(65 + index) && (
                  <CheckCircle className="w-4 h-4 text-green-600 inline-block ml-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {showAnswer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              {getAnswerIcon()}
              <span className="font-medium text-blue-900">
                Resposta: {getCorrectAnswerDisplay()}
              </span>
            </div>
            {question.explanation && (
              <p className="text-blue-800 text-sm">
                <strong>Explicação:</strong> {question.explanation}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Criada em {new Date(question.createdAt).toLocaleDateString('pt-BR')}
          </span>
          
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {showAnswer ? (
              <>
                <EyeOff className="w-4 h-4" />
                Ocultar resposta
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Ver resposta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;