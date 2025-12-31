import React from 'react';
import { X } from 'lucide-react';
import './NoteForm.css';

type Folder = {
  id: string;
  name: string;
};

type NoteFormProps = {
  isEditing: boolean;
  formData: {
    title: string;
    content: string;
    folderId: string;
    pinned: boolean;
  };
  folders: Folder[];
  onSubmit: () => void;
  onCancel: () => void;
  onChange: (field: string, value: string | boolean) => void;
};

const NoteForm: React.FC<NoteFormProps> = ({
  isEditing,
  formData,
  folders,
  onSubmit,
  onCancel,
  onChange,
}) => {
  return (
    <div className="note-form">
      <div className="note-form-header">
        <h3>{isEditing ? 'ویرایش یادداشت' : 'یادداشت جدید'}</h3>
        <button onClick={onCancel} className="note-form-icon-btn">
          <X size={16} />
        </button>
      </div>

      <input
        type="text"
        placeholder="عنوان یادداشت"
        value={formData.title}
        onChange={(e) => onChange('title', e.target.value)}
        className="note-form-input"
      />

      <textarea
        placeholder="متن یادداشت"
        value={formData.content}
        onChange={(e) => onChange('content', e.target.value)}
        className="note-form-textarea"
      />

      <div className="note-form-row">
        <select
          value={formData.folderId}
          onChange={(e) => onChange('folderId', e.target.value)}
          className="note-form-select note-form-folder-select"
        >
          <option value="">بدون پوشه</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>

        <label className="note-form-pin-row">
          سنجاق کردن
          <input
            type="checkbox"
            checked={formData.pinned}
            onChange={(e) => onChange('pinned', e.target.checked)}
            className="note-form-checkbox"
          />
        </label>
      </div>

      <button onClick={onSubmit} className="note-form-btn">
        {isEditing ? 'بروزرسانی' : 'ایجاد'}
      </button>
    </div>
  );
};

export default NoteForm;
