import React, { useState } from 'react';
import { Comment, CommentsProps } from '../../types/comments';
import './Comments.css';

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

interface PostHeaderProps {
  post: {
    id: number;
    content: string;
    timestamp: string;
    user: {
      name: string;
    };
    likes: number;
    dislikes: number;
    comments: number;
  };
}

// کامپوننت PostHeader اضافه شد
const PostHeader = ({ post }: PostHeaderProps) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'همین حالا';
    if (diffInHours === 1) return '1 ساعت پیش';
    return `${diffInHours} ساعت پیش`;
  };

  const initials = getInitials(post.user.name);
  const avatarColor = getAvatarColor(post.user.name);

  return (
    <div className="post-header">
      <div className="post-user-info">
        <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>
        <div className="user-details">
          <span className="author-name">{post.user.name}</span>
          <span className="post-time">{formatTimeAgo(post.timestamp)}</span>
        </div>
      </div>
      
      <div className="post-content-wrapper">
        <p className="post-content-text">{post.content}</p>
      </div>

      <div className="post-stats">
        <div className="stat-item">
          <span className="stat-icon">👍</span>
          <span className="stat-count">{post.likes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">👎</span>
          <span className="stat-count">{post.dislikes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💬</span>
          <span className="stat-count">{post.comments}</span>
        </div>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: number) => void;
  onDislike: (commentId: number) => void;
}

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

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: { text: string }) => void;
  currentUserName: string;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, onSubmit, currentUserName }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit({ text: text.trim() });
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
            <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
              {initials}
            </div>
            <span className="author-name">{currentUserName}</span>
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

const Comments: React.FC<CommentsProps> = ({ 
  initialComments = [],
  title = "نظرات",
  currentUserName = "کاربر",
  post
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddComment = (newComment: { text: string }) => {
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

  return (
    <div className="comments-container">
      <div className="comments-card">
        {post && <PostHeader post={post} />}
        
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