import React, { useEffect, useState } from 'react';
import './NotesPage.css';
import { Plus } from 'lucide-react';
import NoteCard from '../../components/Notes/NoteCard';
import NoteForm from '../../components/Notes/NoteForm';
import NoteDetailModal from '../../components/Notes/NoteDetailModal';
import FoldersSidebar from '../../components/Notes/FoldersSidebar';

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

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [modalNote, setModalNote] = useState<Note | null>(null);
  const [modalSize, setModalSize] = useState<'default' | 'popup'>('default');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    folderId: '',
    pinned: false,
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setNotes(parsed.notes || []);
        setFolders(parsed.folders || []);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist on change
  useEffect(() => {
    const payload = { notes, folders };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [notes, folders]);

  // close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalNote(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const uid = () => Math.random().toString(36).slice(2, 9);

  const addFolder = (name: string) => {
    const folder: Folder = { id: uid(), name };
    setFolders((s) => [...s, folder]);
  };

  const deleteFolder = (id: string) => {
    if (window.confirm('آیا از حذف این پوشه اطمینان دارید؟')) {
      setFolders((s) => s.filter((f) => f.id !== id));
      setNotes((s) => s.map((n) => (n.folderId === id ? { ...n, folderId: null } : n)));
      if (selectedFolder === id) setSelectedFolder(null);
    }
  };

  const addNote = (data: { title: string; content: string; folderId: string; pinned: boolean }) => {
    const note: Note = {
      id: uid(),
      title: data.title,
      content: data.content,
      folderId: data.folderId || null,
      pinned: data.pinned,
      updatedAt: new Date().toISOString(),
    };
    setNotes((s) => [note, ...s]);
  };

  const updateNote = (id: string, data: { title: string; content: string; folderId: string; pinned: boolean }) => {
    setNotes((s) =>
      s.map((n) =>
        n.id === id
          ? {
              ...n,
              title: data.title,
              content: data.content,
              folderId: data.folderId || null,
              pinned: data.pinned,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
  };

  const deleteNote = (id: string) => {
    if (window.confirm('آیا از حذف این یادداشت اطمینان دارید؟')) {
      setNotes((s) => s.filter((n) => n.id !== id));
      if (editingNote === id) setEditingNote(null);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesFolder = selectedFolder === null || note.folderId === selectedFolder;
    return matchesFolder;
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingNote) {
      updateNote(editingNote, formData);
      setEditingNote(null);
    } else {
      addNote(formData);
      setIsCreating(false);
    }

    setFormData({ title: '', content: '', folderId: '', pinned: false });
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setFormData({ title: note.title, content: note.content, folderId: note.folderId || '', pinned: note.pinned });
      setEditingNote(noteId);
      setIsCreating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    setIsCreating(false);
    setFormData({ title: '', content: '', folderId: '', pinned: false });
  };

  const handleViewNote = (note: Note, size: 'default' | 'popup') => {
    setModalNote(note);
    setModalSize(size);
  };

  const sortedNotes = filteredNotes
    .slice()
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        +new Date(b.updatedAt) - +new Date(a.updatedAt)
    );

  return (
    <div className="notes-page notes-page-container">
      <div className="notes-page-layout">
        <FoldersSidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          onFolderAdd={addFolder}
          onFolderDelete={deleteFolder}
        />

        <div className="notes-page-main">
          <div className="notes-page-header">
            <div />
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingNote(null);
                setFormData({
                  title: '',
                  content: '',
                  folderId: selectedFolder || '',
                  pinned: false,
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="notes-page-btn"
            >
              یادداشت جدید <Plus size={16} />
            </button>
          </div>

          {(isCreating || editingNote) && (
            <NoteForm
              isEditing={!!editingNote}
              formData={formData}
              folders={folders}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onChange={handleFormChange}
            />
          )}

          {sortedNotes.length > 0 ? (
            <div className="notes-page-grid">
              {sortedNotes.map((note) => {
                const folder = folders.find((f) => f.id === note.folderId);
                return (
                  <NoteCard
                    key={note.id}
                    note={note}
                    folderName={folder?.name}
                    onEdit={handleEdit}
                    onDelete={deleteNote}
                    onOpen={handleViewNote}
                  />
                );
              })}
            </div>
          ) : (
            <div className="notes-page-empty">
              هنوز یادداشتی وجود ندارد. اولین یادداشت خود را بسازید!
            </div>
          )}
        </div>
      </div>

      {modalNote && (
        <NoteDetailModal
          note={modalNote}
          folderName={folders.find((f) => f.id === modalNote.folderId)?.name}
          modalSize={modalSize}
          onClose={() => setModalNote(null)}
          onEdit={handleEdit}
          onDelete={deleteNote}
        />
      )}
    </div>
  );
};

export default NotesPage;
