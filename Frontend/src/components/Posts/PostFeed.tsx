// PostFeed.tsx
import React from 'react';
import { type PostFeedProps, type Post } from '../../types/posts';
import './PostFeed.css';


const PostActions: React.FC<{
  likes: number;
  dislikes: number;
  comments: number;
  onLike: () => void;
  onDislike: () => void;
  onComment: () => void;
}> = ({ likes, dislikes, comments, onLike, onDislike, onComment }) => {
  return (
    <div className="post-actions">
      <button className="action-btn" onClick={onLike}>
        <span className="action-count">{likes}</span>
        <span className="action-icon">👍</span>
      </button>
      
      <button className="action-btn" onClick={onDislike}>
        <span className="action-count">{dislikes}</span>
        <span className="action-icon">👎</span>
      </button>
      
      <button className="action-btn" onClick={onComment}>
        <span className="action-count">{comments}</span>
        <span className="action-icon">💬</span>
      </button>
    </div>
  );
};


const PostCard: React.FC<{
  post: Post;
  onLike: () => void;
  onDislike: () => void;
  onComment: () => void;
}> = ({ post, onLike, onDislike, onComment }) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'همین حالا';
    if (diffInHours === 1) return '1 ساعت پیش';
    return `${diffInHours} ساعت پیش`;
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-avatar">
          {post.user.name.charAt(0)}
        </div>
        <div className="user-info">
          <div className="user-name">{post.user.name}</div>
          <div className="post-time">{formatTimeAgo(post.timestamp)}</div>
        </div>
      </div>
      
      {post.content && (
        <div className="post-content">
          {post.content}
        </div>
      )}
      
      <PostActions
        likes={post.likes}
        dislikes={post.dislikes}
        comments={post.comments}
        onLike={onLike}
        onDislike={onDislike}
        onComment={onComment}
      />
    </div>
  );
};


const PostFeed: React.FC<PostFeedProps> = ({ posts }) => {
  const handleLike = (postId: number) => {
    console.log('Liked post:', postId);
  };

  const handleDislike = (postId: number) => {
    console.log('Disliked post:', postId);
  };

  const handleComment = (postId: number) => {
    console.log('Comment on post:', postId);
  };

  return (
    <div className="post-feed">
      <div className="post-list">
        {posts.map(post => (
          <PostCard 
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            onDislike={() => handleDislike(post.id)}
            onComment={() => handleComment(post.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PostFeed;