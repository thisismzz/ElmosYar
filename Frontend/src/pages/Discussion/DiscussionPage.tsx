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
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="discussion-page-container">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={refetch} className="retry-btn">
            Try Again
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
          <div className="no-posts">No posts found.</div>
        )}
      </div>
    </div>
  );
};

export default DiscussionPage;
