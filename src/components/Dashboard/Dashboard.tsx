import React, { useState } from 'react';
import { Plus, LogOut, Search, Folder as FolderIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Folder } from '../../types';
import FolderCard from './FolderCard';
import Modal from '../UI/Modal';
import Button from '../UI/Button';

const Dashboard: React.FC<{ onOpenFolder: (folderId: string) => void }> = ({ onOpenFolder }) => {
  const { state, dispatch } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      createdAt: new Date().toISOString(),
      userId: state.currentUser!.id,
    };

    dispatch({ type: 'ADD_FOLDER', payload: newFolder });
    setFormData({ name: '', description: '' });
    setIsCreateModalOpen(false);
  };

  const handleEditFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !formData.name.trim()) return;

    const updatedFolder: Folder = {
      ...editingFolder,
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    dispatch({ type: 'UPDATE_FOLDER', payload: updatedFolder });
    setFormData({ name: '', description: '' });
    setEditingFolder(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Tem certeza que deseja excluir esta pasta? Todas as questões serão perdidas.')) {
      dispatch({ type: 'DELETE_FOLDER', payload: folderId });
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (folder: Folder) => {
    setFormData({ name: folder.name, description: folder.description || '' });
    setEditingFolder(folder);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingFolder(null);
    setFormData({ name: '', description: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    dispatch({ type: 'SET_USER', payload: null });
  };

  const filteredFolders = state.folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQuestionCount = (folderId: string) => {
    return state.questions.filter(q => q.folderId === folderId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <FolderIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ConCurso Pro</h1>
                <p className="text-sm text-gray-600">Olá, {state.currentUser?.username}!</p>
              </div>
            </div>
            
            <Button onClick={handleLogout} variant="outline" icon={LogOut} size="sm">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar matérias..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          
          <Button onClick={openCreateModal} icon={Plus}>
            Nova Matéria
          </Button>
        </div>

        {/* Folders Grid */}
        {filteredFolders.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma matéria encontrada' : 'Nenhuma matéria criada'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Tente buscar por outro termo' 
                : 'Crie sua primeira matéria para começar a organizar suas questões'}
            </p>
            {!searchTerm && (
              <Button onClick={openCreateModal} icon={Plus}>
                Criar primeira matéria
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onEdit={openEditModal}
                onDelete={handleDeleteFolder}
                onOpen={onOpenFolder}
                questionCount={getQuestionCount(folder.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        title="Nova Matéria"
        size="md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da matéria *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Direito Constitucional"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={3}
              placeholder="Breve descrição sobre esta matéria..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={closeModals} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingFolder}
        onClose={closeModals}
        title="Editar Matéria"
        size="md"
      >
        <form onSubmit={handleEditFolder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da matéria *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Direito Constitucional"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={3}
              placeholder="Breve descrição sobre esta matéria..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={closeModals} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;