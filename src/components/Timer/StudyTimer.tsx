import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, Square, RotateCcw, Settings, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface StudyTimerProps {
  folderId: string;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ folderId }) => {
  const { state, dispatch } = useApp();
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQaBC+K0fPTfjEGHm7A7+OZURE4j9n1unImCBl3xO2UQAsTX7Ps47JXFA1NpOLv');
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Play alarm sound
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Tempo de estudo finalizado!', {
        body: 'Seu tempo de estudo chegou ao fim. Que tal fazer uma pausa?',
        icon: '/vite.svg'
      });
    }
    
    alert('⏰ Tempo finalizado! Seu período de estudo chegou ao fim.');
  };

  const startTimer = () => {
    if (timeLeft === 0) {
      const minutes = customMinutes;
      const seconds = minutes * 60;
      setTimeLeft(seconds);
      setInitialTime(seconds);
    }
    setIsRunning(true);
    setIsPaused(false);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);
    setInitialTime(0);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    const seconds = customMinutes * 60;
    setTimeLeft(seconds);
    setInitialTime(seconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (initialTime === 0) return 0;
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  const getTimerColor = () => {
    if (timeLeft <= 60 && isRunning) return 'text-red-600'; // Last minute
    if (timeLeft <= 300 && isRunning) return 'text-orange-600'; // Last 5 minutes
    return 'text-gray-800';
  };

  const getProgressColor = () => {
    if (timeLeft <= 60 && isRunning) return 'bg-red-500'; // Last minute
    if (timeLeft <= 300 && isRunning) return 'bg-orange-500'; // Last 5 minutes
    return 'bg-blue-500';
  };

  return (
    <>
      {/* Timer Toggle Button */}
      <Button
        onClick={() => setIsTimerVisible(!isTimerVisible)}
        variant="outline"
        icon={Timer}
        size="sm"
        className={`${isRunning ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      >
        Timer
        {isRunning && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
            {formatTime(timeLeft)}
          </span>
        )}
      </Button>

      {/* Timer Panel */}
      {isTimerVisible && (
        <div className="fixed top-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-80 z-40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Timer de Estudo
            </h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsSettingsOpen(true)}
                variant="outline"
                size="sm"
                icon={Settings}
              />
              <Button
                onClick={() => setIsTimerVisible(false)}
                variant="outline"
                size="sm"
                icon={X}
              />
            </div>
          </div>

          {/* Progress Bar */}
          {initialTime > 0 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className={`text-4xl font-mono font-bold ${getTimerColor()}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {!isRunning && !isPaused && timeLeft === 0 && `Configurado para ${customMinutes} min`}
              {isPaused && 'Pausado'}
              {isRunning && 'Em andamento'}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-2">
            {!isRunning && !isPaused ? (
              <Button onClick={startTimer} icon={Play} size="sm" className="col-span-2">
                Iniciar
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button onClick={pauseTimer} variant="secondary" icon={Pause} size="sm">
                    Pausar
                  </Button>
                ) : (
                  <Button onClick={startTimer} icon={Play} size="sm">
                    Continuar
                  </Button>
                )}
                <Button onClick={stopTimer} variant="danger" icon={Square} size="sm">
                  Parar
                </Button>
              </>
            )}
            
            {(timeLeft > 0 || isPaused) && (
              <Button
                onClick={resetTimer}
                variant="outline"
                icon={RotateCcw}
                size="sm"
                className="col-span-2 mt-2"
              >
                Reiniciar
              </Button>
            )}
          </div>

          {/* Quick Time Buttons */}
          {!isRunning && !isPaused && timeLeft === 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Tempos rápidos:</p>
              <div className="grid grid-cols-3 gap-2">
                {[15, 25, 45].map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => {
                      setCustomMinutes(minutes);
                      const seconds = minutes * 60;
                      setTimeLeft(seconds);
                      setInitialTime(seconds);
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {minutes}min
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Configurações do Timer"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo padrão (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como funciona:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Configure o tempo desejado</li>
              <li>• Use os controles para pausar/continuar</li>
              <li>• Receba notificação quando acabar</li>
              <li>• Som de alarme ao finalizar</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setIsSettingsOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StudyTimer;