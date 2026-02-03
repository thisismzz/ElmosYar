// DiscussionPage.tsx
import React from "react";
import { type PostFeedProps } from "../../types/discussion_posts";
import { postService } from "../../services/PostService";
import { PostCard } from "../../components/Discussion/Posts/DiscussionPostFeed";
import { usePosts } from "../../hooks/usePosts";
import { useNavigate } from "react-router-dom";
import "./DiscussionPage.css";

const DiscussionPage: React.FC<PostFeedProps> = ({ username }) => {
  const navigate = useNavigate();
  const { posts, loading, error, refetch } = usePosts({ username });

  const handleLike = async (postId: number) => {
    try {
      await postService.likePost(postId);
      refetch();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDislike = async (postId: number) => {
    try {
      await postService.dislikePost(postId);
      refetch();
    } catch (err) {
      console.error('Error disliking post:', err);
    }
  };

  // Navigate to dedicated comments page (Reddit-like)
  const openComments = (postId: number) => {
    navigate(`/post/${postId}/comments`);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="discussion-page-container">
        <div className="post-feed loading-container">
          <div className="loading-animation">
            <div className="loading-spinner">
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
            </div>
            <div className="loading-text">در حال بارگذاری پست‌ها...</div>
          </div>
          
          {/* شبیه‌ساز اسکلت پست‌ها */}
          <div className="skeleton-posts">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="skeleton-post">
                <div className="skeleton-header">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-user-info">
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line shorter"></div>
                  </div>
                </div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
                <div className="skeleton-image"></div>
                <div className="skeleton-actions">
                  <div className="skeleton-button"></div>
                  <div className="skeleton-button"></div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="discussion-page-container">
        <div className="error-state">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fa5252" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 className="error-title">خطا در بارگذاری پست‌ها</h3>
          <p className="error-message">{error}</p>
          <button onClick={refetch} className="retry-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discussion-page-container">
      <div className="post-feed">
        <div className="post-list">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDislike={handleDislike}
              onComment={openComments}
              onOpenComments={openComments}
            />
          ))}
        </div>

        {!loading && posts.length === 0 && (
          <div className="no-posts-state">
            <div className="no-posts-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#868e96" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="no-posts-title">پستی یافت نشد</h3>
            <p className="no-posts-message">اولین نفری باشید که پست می‌گذارد!</p>
          </div>
        )}
        
        {/* لودینگ برای بارگذاری بیشتر */}
        {loading && posts.length > 0 && (
          <div className="more-posts-loading">
            <div className="dots-loading">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <span>در حال بارگذاری پست‌های بیشتر...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionPage;