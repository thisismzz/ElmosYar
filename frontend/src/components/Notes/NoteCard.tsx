import React from 'react';
import { Edit2, Trash2, Pin, Folder } from 'lucide-react';
import './NoteCard.css';

type Note = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  pinned: boolean;
  updatedAt: string;
};

type NoteCardProps = {
  note: Note;
  folderName?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpen: (note: Note, size: 'default' | 'popup') => void;
  titlePreviewLimit?: number;
  contentPreviewLimit?: number;
  showActions?: boolean;
};

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  folderName,
  onEdit,
  onDelete,
  onOpen,
  titlePreviewLimit = 20,
  contentPreviewLimit = 100,
  showActions = true,
}) => {
  const getPreview = (text: string, limit: number) => {
    if (!text) return { displayed: '', isLong: false };
    const isLong = text.length > limit;
    const displayed = isLong ? text.slice(0, limit) : text;
    return { displayed, isLong };
  };

  const titlePreview = getPreview(note.title, titlePreviewLimit);
  const contentPreview = getPreview(note.content, contentPreviewLimit);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(note, 'default');
  };

  return (
    <div className="note-card" onClick={handleClick}>
      <div className="note-card-header">
        <div className="note-card-actions">
          {note.pinned && <Pin size={16} className="note-card-pin" />}
          {showActions && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note.id);
              }}
              className="note-icon-btn"
            >
              <Edit2 size={16} />
            </button>
          )}
          {showActions && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="note-icon-btn"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <h3 className="note-card-title">
          {titlePreview.displayed}{titlePreview.isLong ? '...' : ''}
        </h3>
      </div>

      <p className="note-card-content">
        {contentPreview.displayed}
        {contentPreview.isLong ? '...' : ''}
      </p>

      <footer className="note-card-meta-row">
        {folderName && (
          <span className="note-card-folder">
            <Folder size={14} /> {folderName}
          </span>
        )}
        <span className="note-card-date">{new Date(note.updatedAt).toLocaleDateString()}</span>
      </footer>
    </div>
  );
};

export default NoteCard;
