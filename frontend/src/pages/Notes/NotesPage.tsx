import React, { useEffect, useState } from 'react';
import './NotesPage.css';
import { Plus, Folder, Trash2, Pin, Edit2, X } from 'lucide-react';

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

const NoteCard: React.FC<{ note: Note; folderName?: string; onEdit: (id: string) => void; onDelete: (id: string) => void; onOpen: (note: Note, size: 'default' | 'popup') => void }> = ({ note, folderName, onEdit, onDelete, onOpen }) => {
  const PREVIEW_LIMIT = 60;
  const isLong = note.content && note.content.length > PREVIEW_LIMIT;
  const displayed = !isLong ? note.content : note.content.slice(0, PREVIEW_LIMIT);

  // detect single vs double click: single -> default small modal, double -> popup
  const clickTimeout = React.useRef<number | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimeout.current) {
      // second click within timeout -> treat as double
      window.clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      onOpen(note, 'popup');
    } else {
      // schedule single-click action
      // @ts-ignore setTimeout returns number in browser
      clickTimeout.current = window.setTimeout(() => {
        clickTimeout.current = null;
        onOpen(note, 'default');
      }, 250);
    }
  };

  React.useEffect(() => {
    return () => {
      if (clickTimeout.current) window.clearTimeout(clickTimeout.current);
    };
  }, []);

  return (
    <div className="note-card" onClick={handleClick}>
      <div className="note-card-header">
        <div className="note-actions">
          {note.pinned && <Pin size={16} className="note-pin" />}
          <button onClick={(e) => { e.stopPropagation(); onEdit(note.id); }} className="btn icon-btn"><Edit2 size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="btn icon-btn"><Trash2 size={16} /></button>
        </div>
        <h3 className="note-title">{note.title}</h3>
      </div>

      <p className="note-content">{displayed}{isLong? '...' : ''}</p>


        <footer className="note-meta-row">
        {folderName && <span className="note-folder"><Folder size={14} /> {folderName}</span>}
        <span className="note-date">{new Date(note.updatedAt).toLocaleDateString()}</span>
        </footer>
    </div>
  );
};

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [modalNote, setModalNote] = useState<Note | null>(null);
  const [modalSize, setModalSize] = useState<'default' | 'popup'>('default');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    folderId: '' as string | undefined,
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
    setFolders((s) => s.filter((f) => f.id !== id));
    // move notes out of folder
    setNotes((s) => s.map((n) => (n.folderId === id ? { ...n, folderId: null } : n)));
    if (selectedFolder === id) setSelectedFolder(null);
  };

  const addNote = (data: { title: string; content: string; folderId?: string; pinned?: boolean }) => {
    const note: Note = {
      id: uid(),
      title: data.title,
      content: data.content,
      folderId: data.folderId || null,
      pinned: !!data.pinned,
      updatedAt: new Date().toISOString(),
    };
    setNotes((s) => [note, ...s]);
  };

  const updateNote = (id: string, data: { title: string; content: string; folderId?: string; pinned?: boolean }) => {
    setNotes((s) =>
      s.map((n) => (n.id === id ? { ...n, title: data.title, content: data.content, folderId: data.folderId || null, pinned: !!data.pinned, updatedAt: new Date().toISOString() } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((s) => s.filter((n) => n.id !== id));
    if (editingNote === id) setEditingNote(null);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesFolder = selectedFolder === null || note.folderId === selectedFolder;
    return matchesFolder;
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingNote) {
      updateNote(editingNote, { title: formData.title, content: formData.content, folderId: formData.folderId, pinned: formData.pinned });
      setEditingNote(null);
    } else {
      addNote({ title: formData.title, content: formData.content, folderId: formData.folderId, pinned: formData.pinned });
      setIsCreating(false);
    }

    setFormData({ title: '', content: '', folderId: '', pinned: false });
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

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  return (
    <div className="notes-page container">
      <div className="notes-layout">
        
        <div className="notes-sidebar">
          <div className="folders-box">
            <div className="folders-row">
              <button
                onClick={() => {
                  if (showNewFolder) {
                    setShowNewFolder(false);
                    setNewFolderName('');
                  } else {
                    setShowNewFolder(true);
                  }
                }}
                className="folder-add-btn"
              >
                {showNewFolder ? <X size={16} /> : <Plus size={16} />}
              </button>
              <h3>پوشه‌ها</h3>
            </div>

            {showNewFolder && (
              <div className="new-folder-row">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="نام پوشه"
                  className="folder-input small"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddFolder();
                    if (e.key === 'Escape') {
                      setShowNewFolder(false);
                      setNewFolderName('');
                    }
                  }}
                  autoFocus
                />
                <button onClick={handleAddFolder} className="btn btn-primary small">اضافه <Plus size={14} /></button>
              </div>
            )}

            <button onClick={() => setSelectedFolder(null)} className={`folder-btn ${selectedFolder === null ? 'active' : ''}`}>
              همه یادداشت‌ها
            </button>

            {folders.map((folder) => (
              <div key={folder.id} className={`folder-row ${selectedFolder === folder.id ? 'active' : ''}`}>
                <button onClick={() => deleteFolder(folder.id)} className="btn icon-btn"><Trash2 size={16} /></button>
                <button onClick={() => setSelectedFolder(folder.id)} className="folder-link"><Folder size={16} />{folder.name}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="notes-main">
            <div className="notes-header">
            <div />
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingNote(null);
                setFormData({ title: '', content: '', folderId: selectedFolder || '', pinned: false });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn btn-primary"
            >
              یادداشت جدید <Plus size={16} />
            </button>
          </div>

          {/* Note Form */}
          {(isCreating || editingNote) && (
            <div className="note-form">
              <div className="note-form-header">
                <h3>{editingNote ? 'ویرایش یادداشت' : 'یادداشت جدید'}</h3>
                <button onClick={handleCancel} className="btn icon-btn"><X size={16} /></button>
              </div>

              <input
                type="text"
                placeholder="عنوان یادداشت"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input input-title"
              />

              <textarea
                placeholder="متن یادداشت"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="textarea note-textarea"
              />

              <div className="form-row">
                <select value={formData.folderId} onChange={(e) => setFormData({ ...formData, folderId: e.target.value })} className="select folder-select">
                  <option value="">بدون پوشه</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>

                <label className="pin-row">
                  <span className="pin-label">پین کن</span>
                  <input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })} className="checkbox" />
                </label>
              </div>

              <button onClick={handleSubmit} className="btn btn-primary">
                  {editingNote ? 'بروزرسانی' : 'ایجاد'}
              </button>
            </div>
          )}

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="notes-grid">
              {filteredNotes
                .slice()
                .sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt))
                .map((note) => {
                  const folder = folders.find((f) => f.id === note.folderId);
                  return (
                    <NoteCard
                      key={note.id}
                      note={note}
                      folderName={folder?.name}
                      onEdit={handleEdit}
                      onDelete={deleteNote}
                      onOpen={(n, size) => {
                        setModalNote(n);
                        setModalSize(size);
                      }}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="notes-empty">هنوز یادداشتی وجود ندارد. اولین یادداشت خود را بسازید!</div>
          )}
          {/* Modal for viewing full note */}
          {modalNote && (
            <div className="note-modal-overlay" onClick={() => setModalNote(null)}>
              <div className={`note-modal ${modalSize === 'popup' ? 'popup' : 'small'}`} onClick={(e) => e.stopPropagation()}>
                <div className="note-modal-header">
                  <h3 className="note-title">{modalNote.title}</h3>
                  <div>
                    {modalSize === 'popup' && (
                      <>
                        <button className="btn icon-btn" onClick={() => { handleEdit(modalNote.id); setModalNote(null); }}><Edit2 size={16} /></button>
                        <button className="btn icon-btn" onClick={() => { deleteNote(modalNote.id); setModalNote(null); }}><Trash2 size={16} /></button>
                      </>
                    )}
                    <button className="btn icon-btn" onClick={() => setModalNote(null)}><X size={16} /></button>
                  </div>
                </div>

                <div className="note-content">{modalNote.content}</div>

                <footer className="note-meta-row">
                  {modalNote.folderId && <span className="note-folder"><Folder size={14} /> {folders.find((f) => f.id === modalNote.folderId)?.name}</span>}
                  <span className="note-date">{new Date(modalNote.updatedAt).toLocaleString()}</span>
                </footer>
              </div>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default NotesPage;
