import React, { useState } from 'react';
import { Comment, CommentsProps } from '../../types/comments';
import CommentItem from './CommentItem';
import CommentModal from './CommentModal';
import './Comments.css';

const Comments: React.FC<CommentsProps> = ({ 
  initialComments = [],
  title = "نظرات"
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddComment = (newComment: { name: string; text: string }) => {
    const addedComment: Comment = {
      id: Date.now(),
      name: newComment.name,
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
              onDislike={handleDislike} // Added this line
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
        />
      </div>
    </div>
  );
};

export default Comments;