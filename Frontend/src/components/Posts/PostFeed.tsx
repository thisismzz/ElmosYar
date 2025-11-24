import React, { useState } from 'react';
import { type PostFeedProps, type Post } from '../../types/posts';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import './PostFeed.css';

const PostActions: React.FC<{
  postId: number;
  likes: number;
  dislikes: number;
  comments: number;
  isLiked: boolean;
  isDisliked: boolean;
  onLike: (postId: number) => void;
  onDislike: (postId: number) => void;
  onComment: (postId: number) => void;
}> = ({ postId, likes, dislikes, comments, isLiked, isDisliked, onLike, onDislike, onComment }) => {
  return (
    <div className="post-actions">
      <button 
        className={`action-btn ${isLiked ? 'liked' : ''}`} 
        onClick={() => onLike(postId)}
      >
        <span className="action-icon">
          <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
        </span>
        <span className="action-count">{likes}</span>
      </button>
      
      <button 
        className={`action-btn ${isDisliked ? 'disliked' : ''}`} 
        onClick={() => onDislike(postId)}
      >
        <span className="action-icon">
          <ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
        </span>
        <span className="action-count">{dislikes}</span>
      </button>
      
      <button className="action-btn" onClick={() => onComment(postId)}>
        <span className="action-icon">
          <MessageCircle size={18} />
        </span>
        <span className="action-count">{comments}</span>
      </button>
    </div>
  );
};

const PostCard: React.FC<{
  post: Post;
  onLike: (postId: number) => void;
  onDislike: (postId: number) => void;
  onComment: (postId: number) => void;
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

const PostFeed: React.FC<PostFeedProps> = ({ posts: initialPosts }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts.map(post => ({
    ...post,
    isLiked: false,
    isDisliked: false
  })));

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (post.isLiked) {
          return {
            ...post,
            likes: post.likes - 1,
            isLiked: false
          };
        } else {
          const newPost = {
            ...post,
            likes: post.likes + 1,
            isLiked: true
          };
          if (post.isDisliked) {
            newPost.dislikes = post.dislikes - 1;
            newPost.isDisliked = false;
          }
          return newPost;
        }
      }
      return post;
    }));
  };

  const handleDislike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (post.isDisliked) {
          return {
            ...post,
            dislikes: post.dislikes - 1,
            isDisliked: false
          };
        } else {
          const newPost = {
            ...post,
            dislikes: post.dislikes + 1,
            isDisliked: true
          };
          if (post.isLiked) {
            newPost.likes = post.likes - 1;
            newPost.isLiked = false;
          }
          return newPost;
        }
      }
      return post;
    }));
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
            onLike={handleLike}
            onDislike={handleDislike}
            onComment={handleComment}
          />
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
