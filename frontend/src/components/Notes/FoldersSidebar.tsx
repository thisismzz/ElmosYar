import React, { useState } from 'react';
import { Plus, X, Folder, Trash2 } from 'lucide-react';
import './FoldersSidebar.css';

type Folder = {
  id: string;
  name: string;
};

type FoldersSidebarProps = {
  folders: Folder[];
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderAdd: (name: string) => void;
  onFolderDelete: (id: string) => void;
};

const FoldersSidebar: React.FC<FoldersSidebarProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderAdd,
  onFolderDelete,
}) => {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const MAX_FOLDER_NAME_LENGTH = 15;

  const getFolderDisplayName = (name: string) => {
    return name.length >= MAX_FOLDER_NAME_LENGTH
      ? name.slice(0, MAX_FOLDER_NAME_LENGTH) + '...'
      : name;
  };

  const handleAddFolder = () => {
    const trimmedName = newFolderName.trim();
    if (trimmedName && trimmedName.length <= MAX_FOLDER_NAME_LENGTH) {
      onFolderAdd(trimmedName);
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleCancel = () => {
    setShowNewFolder(false);
    setNewFolderName('');
  };

  return (
    <div className="note-folders-sidebar">
      <div className="note-folders-box">
        <div className="note-folders-header">
          <button
            onClick={() => {
              if (showNewFolder) {
                handleCancel();
              } else {
                setShowNewFolder(true);
              }
            }}
            className="note-folders-add-btn"
          >
            {showNewFolder ? <X size={16} /> : <Plus size={16} />}
          </button>
          <h3>پوشه‌ها</h3>
        </div>

        {showNewFolder && (
          <div className="note-folders-new-row">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="نام پوشه"
              className="note-folders-input"
              maxLength={MAX_FOLDER_NAME_LENGTH}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddFolder();
                if (e.key === 'Escape') handleCancel();
              }}
              autoFocus
            />
            <button onClick={handleAddFolder} className="note-folders-submit-btn">
              اضافه <Plus size={14} />
            </button>
          </div>
        )}

        <button
          onClick={() => onFolderSelect(null)}
          className={`note-folders-all-btn ${selectedFolder === null ? 'note-folders-active' : ''}`}
        >
          همه یادداشت‌ها
        </button>

        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`note-folder-item ${selectedFolder === folder.id ? 'note-folders-active' : ''}`}
          >
            <button onClick={() => onFolderDelete(folder.id)} className="note-folder-delete-btn">
              <Trash2 size={16} />
            </button>
            <button onClick={() => onFolderSelect(folder.id)} className="note-folder-link">
              <Folder size={16} />
              {getFolderDisplayName(folder.name)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoldersSidebar;
