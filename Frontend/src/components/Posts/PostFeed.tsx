// components/PostFeed.tsx
import React, { useState, useEffect } from 'react';
import { type PostFeedProps, type Post, type BackendPost } from '../../types/posts';
import { postService, type GetPostsParams } from '../../services/PostService';
import { ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react'; 
import Comments from '../Comments/Comments';
import { getCommentsForPost, getPostCard } from '../../services/commentService';
import './PostFeed.css';


const mapBackendPostToPost = (backendPost: BackendPost): Post => ({
  id: backendPost.id,
  user: {
    id: backendPost.author_info.id,
    name: `${backendPost.author_info.first_name} ${backendPost.author_info.last_name}`.trim() || backendPost.author_info.username,
    avatar: backendPost.author_info.profile_picture || '/default-avatar.png',
    username: backendPost.author_info.username,
  },
  content: backendPost.content,
  timestamp: backendPost.created_at,
  likes: backendPost.likes_count,
  dislikes: backendPost.dislikes_count,
  comments: backendPost.comments_count,
  isLiked: backendPost.user_reaction === 'like',
  isDisliked: backendPost.user_reaction === 'dislike',
  category: backendPost.category,
  media: backendPost.media,
  tags: backendPost.tags ? backendPost.tags.split(',').map(tag => tag.trim()) : [],
});


const PostActions: React.FC<{
  postId: number;
  likes: number;
  dislikes: number;
  comments: number;
  isLiked: boolean;
  isDisliked: boolean;
  onLike: (postId: number) => Promise<void>;
  onDislike: (postId: number) => Promise<void>;
  onComment: (postId: number) => void;
}> = ({ postId, likes, dislikes, comments, isLiked, isDisliked, onLike, onDislike, onComment }) => {
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


const PostCard: React.FC<{
  post: Post;
  onLike: (postId: number) => Promise<void>;
  onDislike: (postId: number) => Promise<void>;
  onComment: (postId: number) => void;
}> = ({ post, onLike, onDislike, onComment }) => {
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

const PostFeed: React.FC<PostFeedProps> = ({ category, username, initialPosts = [] }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(!initialPosts.length);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
  });
  

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false); 
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [postComments, setPostComments] = useState<any[]>([]);

  const fetchPosts = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: GetPostsParams = {
        page,
        per_page: 10,
        ...(category && { category }),
        ...(username && { username }),
      };

      const response = await postService.getPosts(params);
      
      if (response.success) {
        if (append) {
          setPosts(prev => [...prev, ...response.posts]);
        } else {
          setPosts(response.posts);
        }
        
        setPagination({
          page: response.pagination.page,
          hasNext: response.pagination.has_next || response.pagination.total_pages > response.pagination.page,
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch posts';
      setError(errorMessage);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPosts.length) {
      fetchPosts(1, false);
    }
  }, [category, username]);

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

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

      if (post.isLiked) {
        await postService.removeReaction(postId);
      } else {
        await postService.likePost(postId);
      }
    } catch (err) {
      fetchPosts(pagination.page, false);
      console.error('Error liking post:', err);
    }
  };

  const handleDislike = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

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

      if (post.isDisliked) {
        await postService.removeReaction(postId);
      } else {
        await postService.dislikePost(postId);
      }
    } catch (err) {
      fetchPosts(pagination.page, false);
      console.error('Error disliking post:', err);
    }
  };

  const handleComment = async (postId: number) => {
    try {
      setCommentsLoading(true); 
      
      const [postDetails, comments] = await Promise.all([
        getPostCard(postId),
        getCommentsForPost(postId)
      ]);
      
      setSelectedPost(postDetails);
      setPostComments(comments);
      setShowCommentsModal(true);
      
    } catch (err) {
      console.error('Error loading post comments:', err);
      try {
        const postDetails = await postService.getPostById(postId);
        setSelectedPost(postDetails);
        setShowCommentsModal(true);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setCommentsLoading(false); 
    }
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
    setSelectedPost(null);
    setPostComments([]);
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const loadMore = () => {
    if (pagination.hasNext && !loading) {
      fetchPosts(pagination.page + 1, true);
    }
  };

  const retryFetch = () => {
    fetchPosts(1, false);
  };

  if (loading && posts.length === 0) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error && posts.length === 0) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={retryFetch} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
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
        
        {loading && posts.length > 0 && (
          <div className="loading-more">Loading more posts...</div>
        )}
        
        {pagination.hasNext && !loading && (
          <button className="load-more-btn" onClick={loadMore}>
            Load More
          </button>
        )}
        
        {error && posts.length > 0 && (
          <div className="error">
            <p>Error: {error}</p>
            <button onClick={retryFetch} className="retry-btn">
              Try Again
            </button>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="no-posts">
            No posts found.
          </div>
        )}
      </div>

      {/* Modal کامنت‌ها */}
      {showCommentsModal && (
        <div className="comments-modal-overlay" onClick={handleCloseComments}>
          <div className="comments-modal-content" onClick={handleModalContentClick}>
            <div className="comments-modal-header">
              <h3>نظرات پست</h3>
              <button 
                className="close-comments-btn"
                onClick={handleCloseComments}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="comments-modal-body">
              {selectedPost && (
                <Comments 
                  post={selectedPost}
                  comments={postComments}
                  setComments={setPostComments}
                  currentUserName="" 
                  title=""
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* اینجا خطا داشت - تصحیح شد */}
      {commentsLoading && ( 
        <div className="comments-loading">
          در حال بارگذاری نظرات...
        </div>
      )}
    </>
  );
};

export default PostFeed;

