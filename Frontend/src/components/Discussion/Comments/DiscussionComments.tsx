import React, { useState } from 'react';
import { 
  Comment, 
  CommentsProps, 
  PostHeaderProps, 
  CommentItemProps, 
  CommentModalProps,
  Reply,
  ReplyModalProps
} from '../../../types/discussion_comments';
import { likeComment, dislikeComment } from '../../../services/commentService';
import { ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './DiscussionComments.css';
import { createComment, createReply } from '../../../services/PostService';

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
    <div className="discussion-post-header">
      <div className="discussion-post-user-info">
        <div className="discussion-user-avatar" style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>
        <div className="discussion-user-details">
          <span className="discussion-author-name">{post.user.name}</span>
          <span className="discussion-post-time">{formatTimeAgo(post.timestamp)}</span>
        </div>
      </div>

      <div className="discussion-post-content-wrapper">
        <p className="discussion-post-content-text">{post.content}</p>
      </div>

      <div className="discussion-post-stats">
        <div className="discussion-stat-item">
          <span className="discussion-stat-icon">
            <span className="discussion-action-icon">
              <ThumbsUp size={18} fill={false ? "currentColor" : "none"} />
            </span>
          </span>
          <span className="discussion-stat-count">{post.likes}</span>
        </div>
        <div className="discussion-stat-item">
          <span className="discussion-stat-icon">
            <span className="discussion-action-icon">
              <ThumbsDown size={18} fill={false ? "currentColor" : "none"} />
            </span>
          </span>
          <span className="discussion-stat-count">{post.dislikes}</span>
        </div>
        <div className="discussion-stat-item">
          <span className="discussion-stat-icon"><MessageCircle size={18} /></span>
          <span className="discussion-stat-count">{post.comments}</span>
        </div>
      </div>
    </div>
  );
};

const ReplyItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onDislike,
}) => {
  const initials = getInitials(comment.name);
  const avatarColor = getAvatarColor(comment.name);

  return (
    <div className="reply-item">
      <div className="reply-content">
        <div className="reply-header">
          <div className="user-avatar small" style={{ backgroundColor: avatarColor }}>
            {initials}
          </div>
          <div className="user-info">
            <span className="author-name">{comment.name}</span>
            <span className="comment-time">{comment.time}</span>
          </div>
        </div>
        <p className="reply-text">{comment.text}</p>
      </div>
      <div className="reply-actions">
        <button
          className={`action-btn like-btn small ${comment.is_liked ? 'liked' : ''}`}
          onClick={() => onLike(comment.id)}
        >
          <span className="action-icon">
            <ThumbsUp size={14} fill={comment.is_liked ? "currentColor" : "none"} />
          </span>
          <span className="action-count">{comment.likes}</span>
        </button>

        <button
          className={`action-btn dislike-btn small ${comment.is_disliked ? 'disliked' : ''}`}
          onClick={() => onDislike(comment.id)}
        >
          <span className="action-icon">
            <ThumbsDown size={14} fill={comment.is_disliked ? "currentColor" : "none"} />
          </span>
          <span className="action-count">{comment.dislikes}</span>
        </button>
      </div>
    </div>
  );
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onDislike,
  currentUserName = 'کاربر',
  showReplyButton = true,
  onReplyClick,
  onViewReplies,
  isReply = false,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const initials = getInitials(comment.name);
  const avatarColor = getAvatarColor(comment.name);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && onReplyClick) {
      // اینجا می‌توانید API call برای ذخیره پاسخ اضافه کنید
      const newReply: Reply = {
        id: Date.now(),
        user: {
          name: currentUserName,
        },
        time: 'همین الان',
        text: replyText.trim(),
        likes: 0,
        dislikes: 0,
        is_liked: false,
        is_disliked: false,
      };
      
      // اضافه کردن پاسخ به لیست پاسخ‌ها
      if (comment.replies) {
        comment.replies.push(newReply);
      } else {
        comment.replies = [newReply];
      }
      
      setReplyText('');
      setShowReplyInput(false);
      
      // فراخوانی تابع callback
      onReplyClick(comment.id);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
    if (onViewReplies && !showReplies) {
      onViewReplies(comment.id);
    }
  };

  if (isReply) {
    return <ReplyItem comment={comment} onLike={onLike} onDislike={onDislike} />;
  }

  return (
    <div className={`comment ${comment.replies && comment.replies.length > 0 ? 'has-replies' : ''}`}>
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
      <div className="comment-actions">
        <div className="action-group">
          <button
            className={`action-btn like-btn ${comment.is_liked ? 'liked' : ''}`}
            onClick={() => onLike(comment.id)}
          >
            <span className="action-icon">
              <ThumbsUp size={18} fill={comment.is_liked ? "currentColor" : "none"} />
            </span>
            <span className="action-count">{comment.likes}</span>
          </button>

          <button
            className={`action-btn dislike-btn ${comment.is_disliked ? 'disliked' : ''}`}
            onClick={() => onDislike(comment.id)}
          >
            <span className="action-icon">
              <ThumbsDown size={18} fill={comment.is_disliked ? "currentColor" : "none"} />
            </span>
            <span className="action-count">{comment.dislikes}</span>
          </button>
        </div>
        
        <div className="action-group">
          {showReplyButton && (
            <button 
              className="action-btn reply-btn"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <span className="action-icon">
                <MessageCircle size={18} />
              </span>
              <span className="action-text">پاسخ</span>
            </button>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <button 
              className="action-btn view-replies-btn"
              onClick={toggleReplies}
            >
              <span className="action-icon">
                {showReplies ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
              <span className="action-text">
                {comment.replies.length} پاسخ
              </span>
            </button>
          )}
        </div>
      </div>

      {/* فرم پاسخ‌دهی */}
      {showReplyInput && (
        <form className="reply-form" onSubmit={handleReplySubmit}>
          <div className="reply-input-wrapper">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`پاسخ به ${comment.name}...`}
              className="reply-input"
              rows={3}
              required
            />
            <div className="reply-form-actions">
              <button 
                type="button" 
                className="cancel-btn small"
                onClick={() => setShowReplyInput(false)}
              >
                انصراف
              </button>
              <button 
                type="submit" 
                className="submit-button small"
                disabled={!replyText.trim()}
              >
                ارسال پاسخ
              </button>
            </div>
          </div>
        </form>
      )}

      {/* نمایش پاسخ‌ها */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="replies-list">
          {comment.replies.map(reply => (
            <div key={reply.id} className="reply-wrapper">
              <ReplyItem 
                comment={{
                  id: reply.id,
                  name: reply.user.name,
                  time: reply.time,
                  text: reply.text,
                  likes: reply.likes,
                  dislikes: reply.dislikes,
                  is_liked: reply.is_liked,
                  is_disliked: reply.is_disliked,
                }}
                onLike={onLike}
                onDislike={onDislike}
                isReply={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CommentModal: React.FC<CommentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentUserName, 
  postId 
}) => {
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
          <div className="modal-user-info">
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
            <button 
              type="submit" 
              className="submit-button" 
              onClick={() => createComment(postId, text)}
              disabled={!text.trim()}
            >
              ارسال نظر
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUserName,
  parentCommentId
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit({ text: text.trim(), parentId: parentCommentId });
      setText('');
      onClose();
    }
  };

  const initials = getInitials(currentUserName);
  const avatarColor = getAvatarColor(currentUserName);

  if (!isOpen) return null;

  return 
};

const Comments: React.FC<CommentsProps> = ({
  initialComments = [],
  comments: externalComments,
  setComments: externalSetComments,
  title = "نظرات",
  currentUserName = "کاربر",
  post,
  showReplyButton = true
}) => {
  const [internalComments, internalSetComments] = useState<Comment[]>(initialComments);
  const comments = externalComments ?? internalComments;
  const setComments = externalSetComments ?? internalSetComments;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

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
      replies: [],
      replyCount: 0
    };
    setComments(prev => [addedComment, ...prev]);
  };

  const handleAddReply = (newReply: { text: string; parentId: number }) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === newReply.parentId) {
        const reply: Reply = {
          id: Date.now(),
          user: {
            name: currentUserName,
          },
          time: 'همین الان',
          text: newReply.text,
          likes: 0,
          dislikes: 0,
          is_liked: false,
          is_disliked: false,
        };

        const updatedReplies = [...(comment.replies || []), reply];
        
        return {
          ...comment,
          replies: updatedReplies,
          replyCount: updatedReplies.length
        };
      }
      return comment;
    }));
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

  const handleReplyClick = (commentId: number) => {
    setSelectedCommentId(commentId);
    setIsReplyModalOpen(true);
  };

  const handleViewReplies = (commentId: number) => {
    // اینجا می‌توانید برای لود کردن پاسخ‌های بیشتر از API استفاده کنید
    console.log(`در حال لود کردن پاسخ‌های نظر ${commentId}`);
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
            <span className="btn-icon">✏️</span>
            نظر خود را بنویسید
          </button>
        </div>

        <div className="comments-list">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onDislike={handleDislike}
              currentUserName={currentUserName}
              showReplyButton={showReplyButton}
              onReplyClick={handleReplyClick}
              onViewReplies={handleViewReplies}
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

        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => {
            setIsReplyModalOpen(false);
            setSelectedCommentId(null);
          }}
          onSubmit={handleAddReply}
          currentUserName={currentUserName}
          parentCommentId={selectedCommentId || -1}
        />
      </div>
    </div>
  );
};

export default Comments;