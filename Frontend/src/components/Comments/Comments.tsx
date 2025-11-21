import React, { useState } from 'react';
import { Comment, CommentsProps } from '../../types/comments';
import './Comments.css';

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: number) => void;
  onDislike: (commentId: number) => void;
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

const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onDislike }) => {
  const initials = getInitials(comment.name);
  const avatarColor = getAvatarColor(comment.name);

  return (
    <div className="comment">
      <div className="comment-header">
        <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>
        <div className="user-info">
          <span className="author-name">{comment.name}</span>
          <span className="comment-time">{comment.time}</span>
        </div>
      </div>
      <p className="comment-content">{comment.text}</p>
      <div className="comment-footer">
        <button 
          className="like-button"
          onClick={() => onLike(comment.id)}
        >
          👍 {comment.likes}
        </button>
        <button 
          className="dislike-button"
          onClick={() => onDislike(comment.id)}
        >
          👎 {comment.dislikes || 0}
        </button>
      </div>
    </div>
  );
};

const Comments: React.FC<CommentsProps> = ({ 
  initialComments = [],
  title = "نظرات",
  currentUserName ="کاربر",
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddComment = (newComment: {text: string }) => {
    const addedComment: Comment = {
      id: Date.now(),
      name: currentUserName,
      time: 'همین الان',
      text: newComment.text,
      likes: 0,
      dislikes: 0
    };
    setComments(prev => [addedComment, ...prev]);
  };

  const handleLike = (commentId: number) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  const handleDislike = (commentId: number): void => {
    setComments(prevComments => 
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, dislikes: (comment.dislikes || 0) + 1 }
          : comment
      )
    );
  };


interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: { text: string }) => void;
  currentUserName: string;
}

/*const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};*/

const getAvatarColor = (name: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit({text: text.trim() });
      setText('');
      onClose();
    }
  };

  const initials = getInitials(currentUserName); 
  const avatarColor = getAvatarColor(currentUserName);

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

  return (
    <div className="comments-container">
      <div className="comments-card">
        <div className="comments-header">
          <h2 className="comments-title">{title}</h2>
          <button 
            className="add-comment-btn"
            onClick={() => setIsModalOpen(true)}
          >
            ✏️ نظر خود را بنویسید
          </button>
        </div>

        <div className="comments-list">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onDislike={handleDislike} 
            />
          ))}
          
          {comments.length === 0 && (
            <div className="empty-state">
              <h3>هنوز نظری ثبت نشده است</h3>
              <p>اولین نفری باشید که نظر می‌دهد!</p>
            </div>
          )}
        </div>

        <CommentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddComment}
          currentUserName={currentUserName}
        />
      </div>
    </div>
  );
};

export default Comments;