import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';

type AuthMode = 'login' | 'signup' | 'forgot-password';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Conta criada com sucesso! Verifique seu email para confirmar.');
        }
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setMessage('');
    setShowPassword(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ConCurso Pro</h1>
          <p className="text-gray-600">
            {mode === 'login' && 'Entre na sua conta'}
            {mode === 'signup' && 'Crie sua conta'}
            {mode === 'forgot-password' && 'Recuperar senha'}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field for signup */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Digite seu email"
                required
              />
            </div>
          </div>

          {/* Password field */}
          {mode !== 'forgot-password' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Digite sua senha"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-600 mt-1">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </div>
            ) : (
              <>
                {mode === 'login' && 'Entrar'}
                {mode === 'signup' && 'Criar conta'}
                {mode === 'forgot-password' && 'Enviar email'}
              </>
            )}
          </Button>
        </form>

        {/* Mode switching */}
        <div className="mt-6 space-y-3">
          {mode === 'login' && (
            <>
              <div className="text-center">
                <button
                  onClick={() => switchMode('forgot-password')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="text-center">
                <span className="text-gray-600 text-sm">Não tem conta? </span>
                <button
                  onClick={() => switchMode('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
                >
                  Criar nova conta
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div className="text-center">
              <span className="text-gray-600 text-sm">Já tem conta? </span>
              <button
                onClick={() => switchMode('login')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
              >
                Fazer login
              </button>
            </div>
          )}

          {mode === 'forgot-password' && (
            <div className="text-center">
              <button
                onClick={() => switchMode('login')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </button>
            </div>
          )}
        </div>

        {/* Demo info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Novo aqui?</strong> Crie sua conta gratuitamente e comece a organizar suas questões de concurso de forma inteligente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;