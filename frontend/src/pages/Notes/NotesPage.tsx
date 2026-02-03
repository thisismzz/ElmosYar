import React, { useEffect, useState } from 'react';
import './NotesPage.css';
import { Plus } from 'lucide-react';
import NoteCard from '../../components/Notes/NoteCard';
import NoteForm from '../../components/Notes/NoteForm';
import NoteDetailModal from '../../components/Notes/NoteDetailModal';
import FoldersSidebar from '../../components/Notes/FoldersSidebar';
import {
	initGoogleTokenClient,
	savePayloadToDrive,
	loadPayloadFromDrive,
} from "../../services/driveSync";
import { DriveSyncButton } from '../../components/Notes/DriveSyncButton';

import {
	linkLocalFolder,
	hasLinkedLocalFolder,
	loadNotesFromDisk,
	saveNotesToDisk,
} from "../../services/localFileStorage";


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

const GOOGLE_CLIENT_ID = "288963586582-tc0mhbp0te272ghsvl0or8l775oii4rp.apps.googleusercontent.com";
const STORAGE_KEY = 'elmosyar_notes_v1';

const NotesPage: React.FC = () => {
	const [notes, setNotes] = useState<Note[]>([]);
	const [folders, setFolders] = useState<Folder[]>([]);
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [editingNote, setEditingNote] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [modalNote, setModalNote] = useState<Note | null>(null);
	const [modalSize, setModalSize] = useState<'default' | 'popup'>('default');

	const [driveStatus, setDriveStatus] = useState<string>("");

	const [formData, setFormData] = useState({
		title: '',
		content: '',
		folderId: '',
		pinned: false,
	});

	// load from disk
	useEffect(() => {
		(async () => {
			// Try disk first
			if (await hasLinkedLocalFolder()) {
				const disk = await loadNotesFromDisk();
				if (disk) {
					setNotes(disk.notes || []);
					setFolders(disk.folders || []);
					return;
				}
			}
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				setNotes(parsed.notes || []);
				setFolders(parsed.folders || []);
			}
		})();
	}, []);

	useEffect(() => {
		// Persist to disk (if linked). If not linked localStorage 
		(async () => {
			if (await hasLinkedLocalFolder()) {
				await saveNotesToDisk({ notes, folders });
			} else {
				localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, folders }));
			}
		})();
	}, [notes, folders]);

	// Initialize GIS client once the script is loaded
	useEffect(() => {
		try {
			initGoogleTokenClient(GOOGLE_CLIENT_ID);
		} catch (e) {
			// If script hasn't loaded yet, you can retry after a short delay or on user click.
			// For simplicity, just ignore here and initialize lazily on button click if needed.
		}
	}, []);

	async function onSaveToDrive() {
		try {
			setDriveStatus("Saving to Drive...");
			await savePayloadToDrive({ notes, folders });
			setDriveStatus("Saved to Drive.");
		} catch (e: any) {
			setDriveStatus(`Save failed: ${e?.message ?? String(e)}`);
		}
	}

	async function onLoadFromDrive() {
		try {
			setDriveStatus("Loading from Drive...");
			const remote = await loadPayloadFromDrive<{ notes: any[]; folders: any[] }>();
			if (!remote) {
				setDriveStatus("No Drive backup found yet.");
				return;
			}
			setNotes(remote.notes || []);
			setFolders(remote.folders || []);
			setDriveStatus("Loaded from Drive.");
		} catch (e: any) {
			setDriveStatus(`Load failed: ${e?.message ?? String(e)}`);
		}
	}

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
						{/* <div style={{ display: "flex", gap: 8 }}>
							<button onClick={onSaveToDrive}>Save</button>
							<button onClick={onLoadFromDrive}>Load</button>
						</div> */}
						{/* <div className='rtl'>{driveStatus}</div> */}
						{/* <div /> */}

						<DriveSyncButton
							onSave={async () => {
								onSaveToDrive();
							}}
							onLoad={async () => {
								onLoadFromDrive();
							}}
						/>

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
