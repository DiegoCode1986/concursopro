import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../../types';
import Button from '../UI/Button';

interface QuestionFormProps {
  question?: Question;
  folderId: string;
  userId: string;
  onSubmit: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  folderId,
  userId,
  onSubmit,
  onCancel,
}) => {
  const [questionType, setQuestionType] = useState<QuestionType>('multiple');
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [correctBoolean, setCorrectBoolean] = useState(true);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    if (question) {
      setQuestionType(question.type);
      setTitle(question.title);
      setOptions(question.options || ['', '', '', '', '']);
      setCorrectAnswer(question.correctAnswer || 'A');
      setCorrectBoolean(question.correctBoolean ?? true);
      setExplanation(question.explanation || '');
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    if (questionType === 'multiple') {
      const filledOptions = options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        alert('Adicione pelo menos 2 alternativas para questões de múltipla escolha.');
        return;
      }
    }

    const questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> = {
      folderId,
      userId,
      title: title.trim(),
      type: questionType,
      explanation: explanation.trim() || undefined,
    };

    if (questionType === 'multiple') {
      const filledOptions = options.filter(opt => opt.trim());
      questionData.options = filledOptions;
      questionData.correctAnswer = correctAnswer;
    } else {
      questionData.correctBoolean = correctBoolean;
    }

    onSubmit(questionData);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      
      // Adjust correct answer if necessary
      const letterIndex = correctAnswer.charCodeAt(0) - 65;
      if (letterIndex >= newOptions.length) {
        setCorrectAnswer('A');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de questão
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              value="multiple"
              checked={questionType === 'multiple'}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
              questionType === 'multiple' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
            }`}>
              {questionType === 'multiple' && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">Múltipla Escolha</div>
              <div className="text-sm text-gray-600">Alternativas A, B, C, D, E</div>
            </div>
          </label>
          
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              value="boolean"
              checked={questionType === 'boolean'}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
              questionType === 'boolean' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
            }`}>
              {questionType === 'boolean' && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">Verdadeiro ou Falso</div>
              <div className="text-sm text-gray-600">Questão de CERTO/ERRADO</div>
            </div>
          </label>
        </div>
      </div>

      {/* Question Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enunciado da questão *
        </label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          rows={4}
          placeholder="Digite o enunciado da questão..."
          required
        />
      </div>

      {/* Multiple Choice Options */}
      {questionType === 'multiple' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Alternativas
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-medium text-gray-700">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    onClick={() => removeOption(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  >
                    Remover
                  </Button>
                )}
              </div>
            ))}
            
            {options.length < 5 && (
              <Button
                type="button"
                onClick={addOption}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Adicionar alternativa
              </Button>
            )}
          </div>

          {/* Correct Answer Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resposta correta
            </label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {options.map((_, index) => (
                options[index].trim() && (
                  <option key={index} value={String.fromCharCode(65 + index)}>
                    Alternativa {String.fromCharCode(65 + index)}
                  </option>
                )
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Boolean Answer */}
      {questionType === 'boolean' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Resposta correta
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                value="true"
                checked={correctBoolean === true}
                onChange={() => setCorrectBoolean(true)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                correctBoolean === true ? 'border-green-600 bg-green-600' : 'border-gray-300'
              }`}>
                {correctBoolean === true && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className="font-medium text-green-700">CERTO</span>
            </label>
            
            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                value="false"
                checked={correctBoolean === false}
                onChange={() => setCorrectBoolean(false)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                correctBoolean === false ? 'border-red-600 bg-red-600' : 'border-gray-300'
              }`}>
                {correctBoolean === false && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className="font-medium text-red-700">ERRADO</span>
            </label>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explicação (opcional)
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          rows={3}
          placeholder="Explique por que esta é a resposta correta..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {question ? 'Salvar alterações' : 'Criar questão'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;