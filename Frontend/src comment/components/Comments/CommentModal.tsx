import React, { useState } from 'react';
import './Comments.css';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: { name: string; text: string }) => void;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && text.trim()) {
      onSubmit({ name: name.trim(), text: text.trim() });
      setName('');
      setText('');
      onClose();
    }
  };

  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>نظر جدید</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="comment-form">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            {name && (
              <div className="modal-avatar" style={{ backgroundColor: avatarColor }}>
                {initials}
              </div>
            )}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام شما"
              className="name-input"
              style={{ flex: 1 }}
              required
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="نظر خود را بنویسید..."
            className="comment-input"
            rows={4}
            required
          />
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              انصراف
            </button>
            <button type="submit" className="submit-button">
              ارسال نظر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;