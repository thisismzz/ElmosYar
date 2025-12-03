// components/PostFeed.tsx
import React, { useState, useEffect } from 'react';
import { type PostFeedProps, type Post, type BackendPost, PostCardProps, PostActionsProps } from '../../../types/discussion_posts';
import { postService, type GetPostsParams } from '../../../services/PostService';
import { ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react'; 
import Comments from '../Comments/DiscussionComments';
import { getCommentsForPost, getPostCard } from '../../../services/commentService';
import './DiscussionPostFeed.css';


const PostActions: React.FC<PostActionsProps> = ({ postId, likes, dislikes, comments, isLiked, isDisliked, onLike, onDislike, onComment }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onLike(postId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDislike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onDislike(postId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-actions">
      <button 
        className={`action-btn ${isLiked ? 'liked' : ''} ${isLoading ? 'loading' : ''}`} 
        onClick={handleLike}
        disabled={isLoading}
      >
        <span className="action-icon">
          <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
        </span>
        <span className="action-count">{likes}</span>
      </button>
      
      <button 
        className={`action-btn ${isDisliked ? 'disliked' : ''} ${isLoading ? 'loading' : ''}`} 
        onClick={handleDislike}
        disabled={isLoading}
      >
        <span className="action-icon">
          <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
        </span>
        <span className="action-count">{dislikes}</span>
      </button>
      
      <button 
        className="action-btn" 
        onClick={() => onComment(postId)}
      >
        <span className="action-icon">
          <MessageCircle size={18} />
        </span>
        <span className="action-count">{comments}</span>
      </button>
    </div>
  );
};


export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDislike, onComment }) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'همین حالا';
    if (diffInHours === 1) return '1 ساعت پیش';
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 روز پیش';
    return `${diffInDays} روز پیش`;
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-avatar">
          <img 
            src={post.user.avatar} 
            alt={post.user.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9kayreViIUlp8-GZFDlXdNHQc7Ckc8PpM0w&s";
            }}
          />
        </div>
        <div className="user-info">
          <div className="user-name">{post.user.name}</div>
          <div className="user-username">@{post.user.username}</div>
          <div className="post-time">{formatTimeAgo(post.timestamp)}</div>
        </div>
      </div>
      
      {post.content && (
        <div className="post-content">
          {post.content}
        </div>
      )}
      
      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, index) => (
            <span key={index} className="post-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      {post.media && post.media.length > 0 && (
        <div className="post-media">
          {post.media.map(mediaItem => (
            <div key={mediaItem.id} className="media-item">
              {mediaItem.media_type === 'image' && (
                <img 
                  src={mediaItem.url} 
                  alt={mediaItem.caption} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      <PostActions
        postId={post.id}
        likes={post.likes}
        dislikes={post.dislikes}
        comments={post.comments}
        isLiked={post.isLiked || false}
        isDisliked={post.isDisliked || false}
        onLike={onLike}
        onDislike={onDislike}
        onComment={onComment}
      />
    </div>
  );
};
