import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, CheckCircle, XCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Question } from '../../types';
import Button from '../UI/Button';

interface InteractiveQuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  showAnswers?: boolean;
}

const InteractiveQuestionCard: React.FC<InteractiveQuestionCardProps> = ({
  question,
  onEdit,
  onDelete,
  showAnswers = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResult, setShowResult] = useState(showAnswers);

  const handleAnswer = (answer: string | boolean) => {
    if (hasAnswered && !showResult) return;
    setUserAnswer(answer);
    setHasAnswered(true);
  };

  const checkAnswer = () => {
    if (!hasAnswered) return;
    setShowResult(true);
  };

  const resetQuestion = () => {
    setUserAnswer(null);
    setHasAnswered(false);
    setShowResult(false);
  };

  const isCorrect = () => {
    if (question.type === 'multiple') {
      return userAnswer === question.correctAnswer;
    } else {
      return userAnswer === question.correctBoolean;
    }
  };

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
            
            {hasAnswered && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                showResult 
                  ? (isCorrect() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {showResult 
                  ? (isCorrect() ? '✓ Correto' : '✗ Incorreto')
                  : 'Respondida'
                }
              </span>
            )}
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

        {/* Multiple Choice Options */}
        {question.type === 'multiple' && question.options && (
          <div className="space-y-2 mb-4">
            {question.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = userAnswer === optionLetter;
              const isCorrectOption = question.correctAnswer === optionLetter;
              
              let optionClasses = 'p-3 rounded-lg border cursor-pointer transition-all duration-200 ';
              
              if (!hasAnswered) {
                optionClasses += 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300';
              } else if (showResult) {
                if (isCorrectOption) {
                  optionClasses += 'border-green-500 bg-green-50';
                } else if (isSelected && !isCorrectOption) {
                  optionClasses += 'border-red-500 bg-red-50';
                } else {
                  optionClasses += 'border-gray-200 bg-gray-50';
                }
              } else {
                if (isSelected) {
                  optionClasses += 'border-blue-500 bg-blue-50';
                } else {
                  optionClasses += 'border-gray-200 bg-gray-50';
                }
              }

              return (
                <div
                  key={index}
                  onClick={() => handleAnswer(optionLetter)}
                  className={optionClasses}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {optionLetter}
                      </span>
                      <span className="text-gray-900">{option}</span>
                    </div>
                    
                    {showResult && isCorrectOption && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Boolean Options */}
        {question.type === 'boolean' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { value: true, label: 'CERTO', color: 'green' },
              { value: false, label: 'ERRADO', color: 'red' }
            ].map(({ value, label, color }) => {
              const isSelected = userAnswer === value;
              const isCorrect = question.correctBoolean === value;
              
              let buttonClasses = `p-4 rounded-lg border cursor-pointer transition-all duration-200 text-center font-medium `;
              
              if (!hasAnswered) {
                buttonClasses += `border-${color}-200 bg-${color}-50 hover:bg-${color}-100 hover:border-${color}-400 text-${color}-700`;
              } else if (showResult) {
                if (isCorrect) {
                  buttonClasses += `border-${color}-500 bg-${color}-100 text-${color}-800`;
                } else if (isSelected && !isCorrect) {
                  buttonClasses += `border-red-500 bg-red-100 text-red-800`;
                } else {
                  buttonClasses += `border-gray-200 bg-gray-50 text-gray-600`;
                }
              } else {
                if (isSelected) {
                  buttonClasses += `border-blue-500 bg-blue-100 text-blue-800`;
                } else {
                  buttonClasses += `border-${color}-200 bg-${color}-50 text-${color}-700`;
                }
              }

              return (
                <div
                  key={String(value)}
                  onClick={() => handleAnswer(value)}
                  className={buttonClasses}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{label}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Result and Explanation */}
        {showResult && (
          <div className={`border rounded-lg p-4 mb-4 ${
            isCorrect() 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect() ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${
                isCorrect() ? 'text-green-900' : 'text-red-900'
              }`}>
                {isCorrect() ? 'Resposta Correta!' : 'Resposta Incorreta'}
              </span>
            </div>
            
            <p className={`text-sm mb-2 ${
              isCorrect() ? 'text-green-800' : 'text-red-800'
            }`}>
              <strong>Resposta correta:</strong> {getCorrectAnswerDisplay()}
            </p>
            
            {question.explanation && (
              <p className={`text-sm ${
                isCorrect() ? 'text-green-800' : 'text-red-800'
              }`}>
                <strong>Explicação:</strong> {question.explanation}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Criada em {new Date(question.createdAt).toLocaleDateString('pt-BR')}
          </span>
          
          <div className="flex items-center gap-2">
            {hasAnswered && !showResult && (
              <Button
                onClick={checkAnswer}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver Resultado
              </Button>
            )}
            
            {(hasAnswered || showResult) && (
              <Button
                onClick={resetQuestion}
                variant="outline"
                size="sm"
                icon={RotateCcw}
              >
                Tentar Novamente
              </Button>
            )}
            
            {!hasAnswered && !showResult && (
              <button
                onClick={() => setShowResult(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver Gabarito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveQuestionCard;