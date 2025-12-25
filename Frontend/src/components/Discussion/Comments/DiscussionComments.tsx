import React, { useState } from 'react';
import { Comment, CommentsProps, PostHeaderProps, CommentItemProps, CommentModalProps} from '../../../types/discussion_comments';
import { likeComment, dislikeComment } from '../../../services/commentService';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import './DiscussionComments.css';
import { createComment } from '../../../services/PostService';

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
          <span className="stat-icon">
            <span className="action-icon">
              <ThumbsUp size={18} fill={false ? "currentColor" : "none"} />
            </span>
          </span>
          <span className="stat-count">{post.likes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">
            <span className="action-icon">
              <ThumbsDown size={18} fill={false ? "currentColor" : "none"} />
            </span>
          </span>
          <span className="stat-count">{post.dislikes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon"><MessageCircle size={18} /></span>
          <span className="stat-count">{post.comments}</span>
        </div>
      </div>
    </div>
  );
};



const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike = (commentId) => likeComment(commentId),
  onDislike = (commentId) => dislikeComment(commentId),
}) => {
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
      <div className="post-actions">
        <button
          className={`action-btn ${comment.is_liked ? 'liked' : ''}`}
          onClick={() => onLike(comment.id)}
          // disabled={isLoading}
        >
          <span className="action-icon">
            <ThumbsUp size={18} fill={comment.is_liked ? "currentColor" : "none"} />
          </span><span className="action-count">{comment.likes}</span>
        </button>

        <button
          className={`action-btn ${comment.is_disliked ? 'disliked' : ''}`}
          onClick={() => onDislike(comment.id)}
          // disabled={isLoading}
        >
          <span className="action-icon">
            <ThumbsDown size={18} fill={comment.is_disliked ? "currentColor" : "none"} />
          </span><span className="action-count">{comment.dislikes}</span>
        </button>
      </div>
    </div>
  );
};



const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, onSubmit, currentUserName, postId }) => {
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
            <button type="submit" className="submit-button" onClick={() => createComment(postId, text)}>
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
  comments: externalComments,
  setComments: externalSetComments,
  title = "نظرات",
  currentUserName = "کاربر",
  post
}) => {

  // If parent provided comments → use them
  // Else → fall back to internal state
  const [internalComments, internalSetComments] = useState<Comment[]>(initialComments);

  const comments = externalComments ?? internalComments;
  const setComments = externalSetComments ?? internalSetComments;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddComment = (newComment: { text: string }) => {
    const addedComment: Comment = {
      id: Date.now(),
      name: currentUserName,
      time: 'همین الان',
      text: newComment.text,
      likes: 0,
      dislikes: 0,
      is_liked: false,
      is_disliked: false,
    };
    setComments(prev => [addedComment, ...prev]);
  };

  const handleLike = async (commentId: number) => {
    const like_result = await likeComment(commentId);
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
          ...comment,
          likes: like_result.likes_count,
          dislikes: like_result.dislikes_count,
          is_liked: like_result.is_liked,
          is_disliked: like_result.is_disliked,
        }
        : comment
    ));
  };

  const handleDislike = async (commentId: number) => {
    const dislike_result = await dislikeComment(commentId);
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
          ...comment,
          likes: dislike_result.likes_count,
          dislikes: dislike_result.dislikes_count,
          is_liked: dislike_result.is_liked,
          is_disliked: dislike_result.is_disliked,
        }
        : comment
    ));
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
		  postId={post ? post.id : -1}
        />
      </div>
    </div>
  );
};

export default Comments;