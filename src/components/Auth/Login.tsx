import React, { useState } from 'react';
import { User, BookOpen, Lock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { dispatch } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (isLogin) {
      // Login existing user
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = existingUsers.find((u: User) => u.username === username);
      
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        alert('Usuário não encontrado. Clique em "Criar Conta" para se registrar.');
      }
    } else {
      // Create new user
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = existingUsers.some((u: User) => u.username === username);
      
      if (userExists) {
        alert('Usuário já existe. Faça login ou escolha outro nome.');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        username,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      dispatch({ type: 'SET_USER', payload: newUser });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ConCurso Pro</h1>
          <p className="text-gray-600">Seu app de estudos para concursos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nome de usuário
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Digite seu nome de usuário"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isLogin ? 'Não tem conta? Criar nova conta' : 'Já tem conta? Fazer login'}
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Demo:</strong> Use qualquer nome de usuário para criar uma conta ou fazer login.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;