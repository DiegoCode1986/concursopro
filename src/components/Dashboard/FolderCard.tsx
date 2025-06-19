import React from 'react';
import { Folder as FolderIcon, MoreVertical, Edit, Trash2, BookOpen } from 'lucide-react';
import { Folder } from '../../types';

interface FolderCardProps {
  folder: Folder;
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  onOpen: (folderId: string) => void;
  questionCount: number;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onEdit,
  onDelete,
  onOpen,
  questionCount,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
              <FolderIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{folder.name}</h3>
              {folder.description && (
                <p className="text-gray-600 text-sm mt-1">{folder.description}</p>
              )}
            </div>
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
                    onEdit(folder);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDelete(folder.id);
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <BookOpen className="w-4 h-4" />
            <span>{questionCount} questões</span>
          </div>
          
          <button
            onClick={() => onOpen(folder.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;