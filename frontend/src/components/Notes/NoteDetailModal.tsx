import React from 'react';
import { X, Edit2, Trash2, Pin, Folder } from 'lucide-react';
import moment from 'moment-jalaali';
import './NoteDetailModal.css';

type Note = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  pinned: boolean;
  updatedAt: string;
};

type NoteDetailModalProps = {
  note: Note;
  folderName?: string;
  modalSize: 'default' | 'popup';
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
};

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  folderName,
  modalSize,
  onClose,
  onEdit,
  onDelete,
  showActions = true,
}) => {
 
const formatToPersianDateTime = (dateString: string): string => {
  try {
    const m = moment(dateString);
    return m.format('jYYYY/jMM/jDD - HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const persianDateTime = formatToPersianDateTime(note.updatedAt);
<span className="note-modal-date">{persianDateTime}</span>

  const handleEdit = () => {
    {onEdit && onEdit(note.id)};
    onClose();
  };

  const handleDelete = () => {
    {onDelete && onDelete(note.id)};
    onClose();
  };

  return (
    <div className="note-modal-overlay" onClick={onClose}>
      <div
        className={`note-modal ${modalSize === 'popup' ? 'note-modal-popup' : 'note-modal-small'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="note-modal-header">
          <h3>{note.title}</h3>
          <div className="note-modal-actions">
            {note.pinned && <Pin size={16} className="note-modal-pin" />}
            {showActions && (
              <>
                <button onClick={handleEdit} className="note-modal-icon-btn">
                  <Edit2 size={16} />
                </button>
                <button onClick={handleDelete} className="note-modal-icon-btn">
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button onClick={onClose} className="note-modal-icon-btn">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="note-modal-content">{note.content}</div>

        <footer className="note-modal-meta-row">
          {folderName && (
            <span className="note-modal-folder">
              <Folder size={14} /> {folderName}
            </span>
          )}
          <span className="note-modal-date">{persianDateTime}</span>
        </footer>
      </div>
    </div>
  );
};

export default NoteDetailModal;
