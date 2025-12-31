import React, { useState } from 'react';
import { Book } from 'lucide-react';
import NoteCard from '../Notes/NoteCard';
import NoteDetailModal from '../Notes/NoteDetailModal';
import PreviewSection from './PreviewSection';
import './PreviewSection.css';

type Note = {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  pinned: boolean;
  updatedAt: string;
};

type Folder = {
  id: string;
  name: string;
};

const STORAGE_KEY = 'elmosyar_notes_v1';

const NotesPreview: React.FC = () => {
  const [view, setView] = useState<'recent' | 'pinned'>('recent');
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.notes || [];
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    }
    return [];
  });
  const [folders] = useState<Folder[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.folders || [];
      }
    } catch (err) {
      console.error('Error loading folders:', err);
    }
    return [];
  });
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [modalSize, setModalSize] = useState<'default' | 'popup'>('default');

  const sortedNotes = notes
    .slice()
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  const pinnedNotes = sortedNotes.filter((n) => n.pinned);
  const displayedNotes = view === 'recent' ? sortedNotes.slice(0, 8) : pinnedNotes.slice(0, 8);

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return undefined;
    return folders.find((f) => f.id === folderId)?.name;
  };

  return (
    <PreviewSection
      title="یادداشت‌ها"
      icon={<Book size={18} />}
      linkTo="/notes"
      linkLabel="مشاهده همه"
      toggle={{
        options: [
          { value: 'recent', label: 'جدید' },
          { value: 'pinned', label: 'سنجاق‌شده' },
        ],
        value: view,
        onChange: (val) => setView(val as 'recent' | 'pinned'),
      }}
    >
      {displayedNotes.length === 0 ? (
        <div className="preview-section-empty">
          <Book size={32} className="preview-section-empty-icon" />
          <p>
            {view === 'recent'
              ? 'هیچ یادداشت جدیدی وجود ندارد'
              : 'یادداشت سنجاق‌شده‌ای وجود ندارد'}
          </p>
        </div>
      ) : (
        <div className="preview-section-grid">
          {displayedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              folderName={getFolderName(note.folderId)}
              onOpen={(n, size) => {
                setViewingNote(n);
                setModalSize(size);
              }}
              showActions={false}
              titlePreviewLimit={30}
              contentPreviewLimit={80}
            />
          ))}
        </div>
      )}

      {viewingNote && (
        <NoteDetailModal
          note={viewingNote}
          folderName={getFolderName(viewingNote.folderId)}
          modalSize={modalSize}
          onClose={() => setViewingNote(null)}
          onEdit={() => {}}
          onDelete={() => {}}
          showActions={false}
        />
      )}
    </PreviewSection>
  );
};

export default NotesPreview;
