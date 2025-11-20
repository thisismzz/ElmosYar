import React from 'react';
import { Comment } from '../../types/comments';
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

export default CommentItem;