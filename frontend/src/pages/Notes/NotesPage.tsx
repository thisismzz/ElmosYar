import React, { useEffect, useState } from 'react';
import './NotesPage.css';
import { Plus, AlertCircle } from 'lucide-react';
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
const DRIVE_FILENAME = 'elmosyar-notes-backup.json';

const NotesPage: React.FC = () => {
	const [notes, setNotes] = useState<Note[]>([]);
	const [folders, setFolders] = useState<Folder[]>([]);
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [editingNote, setEditingNote] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [modalNote, setModalNote] = useState<Note | null>(null);
	const [modalSize, setModalSize] = useState<'default' | 'popup'>('default');
	const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isGoogleReady, setIsGoogleReady] = useState(false);

	const [formData, setFormData] = useState({
		title: '',
		content: '',
		folderId: '',
		pinned: false,
	});

	// Initialize Google Drive
	useEffect(() => {
		const initGoogleDrive = async () => {
			try {
				// Wait for Google script to load
				if (typeof window.google === 'undefined') {
					// Create a script element to load Google API
					const script = document.createElement('script');
					script.src = 'https://accounts.google.com/gsi/client';
					script.async = true;
					script.defer = true;
					
					script.onload = () => {
						try {
							initGoogleTokenClient(GOOGLE_CLIENT_ID);
							setIsGoogleReady(true);
						} catch (error) {
							console.error('Failed to initialize Google client:', error);
							setErrorMessage('خطا در راه‌اندازی سرویس Google Drive');
						}
					};
					
					script.onerror = () => {
						setErrorMessage('خطا در بارگذاری سرویس Google Drive');
					};
					
					document.head.appendChild(script);
				} else {
					try {
						initGoogleTokenClient(GOOGLE_CLIENT_ID);
						setIsGoogleReady(true);
					} catch (error) {
						console.error('Failed to initialize Google client:', error);
						setErrorMessage('خطا در راه‌اندازی سرویس Google Drive');
					}
				}
			} catch (error) {
				console.error('Error initializing Google Drive:', error);
				setErrorMessage('خطا در راه‌اندازی سرویس Google Drive');
			}
		};

		initGoogleDrive();
	}, []);

	// Load data
	useEffect(() => {
		const loadData = async () => {
			try {
				// Try disk first
				if (await hasLinkedLocalFolder()) {
					const disk = await loadNotesFromDisk();
					if (disk) {
						setNotes(disk.notes || []);
						setFolders(disk.folders || []);
						return;
					}
				}
				// Fallback to localStorage
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw) {
					const parsed = JSON.parse(raw);
					setNotes(parsed.notes || []);
					setFolders(parsed.folders || []);
				}
			} catch (error) {
				console.error('Error loading notes:', error);
				setErrorMessage('خطا در بارگذاری یادداشت‌ها');
			}
		};

		loadData();
	}, []);

	// Save data
	useEffect(() => {
		const saveData = async () => {
			try {
				if (await hasLinkedLocalFolder()) {
					await saveNotesToDisk({ notes, folders });
				} else {
					localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, folders }));
				}
			} catch (error) {
				console.error('Error saving notes:', error);
				setErrorMessage('خطا در ذخیره یادداشت‌ها');
			}
		};

		saveData();
	}, [notes, folders]);

	// Drive sync functions
	const handleSaveToDrive = async () => {
		if (!isGoogleReady) {
			setErrorMessage('سرویس Google Drive آماده نیست. لطفا صفحه را بازخوانی کنید.');
			return;
		}

		setSyncStatus('loading');
		try {
			const payload = { 
				notes, 
				folders,
				syncedAt: new Date().toISOString(),
				version: '1.0'
			};
			
			await savePayloadToDrive(payload);
			setSyncStatus('success');
			setErrorMessage('');
			
			// Clear success status after 3 seconds
			setTimeout(() => setSyncStatus('idle'), 3000);
		} catch (error: any) {
			console.error('Error saving to Drive:', error);
			setSyncStatus('error');
			setErrorMessage(`خطا در ذخیره در Google Drive: ${error.message || 'خطای ناشناخته'}`);
		}
	};

	const handleLoadFromDrive = async () => {
		if (!isGoogleReady) {
			setErrorMessage('سرویس Google Drive آماده نیست. لطفا صفحه را بازخوانی کنید.');
			return;
		}

		setSyncStatus('loading');
		try {
			const remote = await loadPayloadFromDrive<{ 
				notes: Note[], 
				folders: Folder[],
				syncedAt?: string,
				version?: string
			}>();
			
			if (!remote || !remote.notes) {
				throw new Error('داده‌ای در Google Drive یافت نشد');
			}

			// Ask for confirmation if there are local notes
			if (notes.length > 0) {
				if (!window.confirm('آیا می‌خواهید یادداشت‌های فعلی با نسخه Google Drive جایگزین شوند؟')) {
					setSyncStatus('idle');
					return;
				}
			}

			setNotes(remote.notes || []);
			setFolders(remote.folders || []);
			setSyncStatus('success');
			setErrorMessage('');
			
			// Show success message with sync time if available
			if (remote.syncedAt) {
				const syncTime = new Date(remote.syncedAt).toLocaleDateString('fa-IR');
				alert(`داده‌ها با موفقیت بارگذاری شدند (آخرین همگام‌سازی: ${syncTime})`);
			} else {
				alert('داده‌ها با موفقیت بارگذاری شدند');
			}
			
			// Clear success status after 3 seconds
			setTimeout(() => setSyncStatus('idle'), 3000);
		} catch (error: any) {
			console.error('Error loading from Drive:', error);
			setSyncStatus('error');
			setErrorMessage(`خطا در بارگذاری از Google Drive: ${error.message || 'خطای ناشناخته'}`);
		}
	};

	// Close modal on Escape
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setModalNote(null);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	const uid = () => Math.random().toString(36).slice(2, 9);

	const addFolder = (name: string) => {
		if (!name.trim()) return;
		
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
		if (!data.title.trim()) return;
		
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
		if (!data.title.trim()) return;
		
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
		if (!formData.title.trim()) {
			alert('عنوان یادداشت نمی‌تواند خالی باشد');
			return;
		}

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
			setFormData({ 
				title: note.title, 
				content: note.content, 
				folderId: note.folderId || '', 
				pinned: note.pinned 
			});
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
			{/* Error Alert */}
			{errorMessage && (
				<div className="error-alert">
					<AlertCircle size={20} />
					<span>{errorMessage}</span>
					<button 
						onClick={() => setErrorMessage('')}
						className="error-alert-close"
					>
						×
					</button>
				</div>
			)}

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
						<div className="notes-header-actions">
							<DriveSyncButton
								onSave={handleSaveToDrive}
								onLoad={handleLoadFromDrive}
								// isLoading={syncStatus === 'loading'}
								// isDisabled={!isGoogleReady}
								// lastSyncTime={notes.length > 0 ? notes[0]?.updatedAt : undefined}
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

						<div className="notes-stats">
							<span className="notes-count">
								{notes.length} یادداشت
							</span>
							{selectedFolder && (
								<span className="folder-indicator">
									پوشه: {folders.find(f => f.id === selectedFolder)?.name}
								</span>
							)}
						</div>
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
							<div className="empty-state-icon">
								📝
							</div>
							<h3>هنوز یادداشتی وجود ندارد</h3>
							<p>اولین یادداشت خود را بسازید!</p>
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