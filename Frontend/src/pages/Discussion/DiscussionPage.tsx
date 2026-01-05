// DiscussionPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { type PostFeedProps, type Post } from "../../types/discussion_posts";
import { postService, type GetPostsParams } from "../../services/PostService";
import { PostCard } from "../../components/Discussion/Posts/DiscussionPostFeed";
import { useFilters } from "../../contexts/FilterContext";
import { useNavigate } from "react-router-dom";
import "./DiscussionPage.css";

const DiscussionPage: React.FC<PostFeedProps> = ({ category, username, initialPosts = [] }) => {
  const navigate = useNavigate();
  const { getFilter, serializeSearch } = useFilters();

  // Only search query filter
  const searchQuery = getFilter("q", "");

  const filterDependencies = useMemo(() => {
    return { searchQuery };
  }, [searchQuery]);

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(!initialPosts.length);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
  });

  const fetchPosts = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Build serialized search from FilterContext (includes `*` from `q` param)
      const search = serializeSearch && serializeSearch();

      const params: GetPostsParams = {
        page,
        per_page: 10,
        ...(category && { category }),
        ...(search && { search }),
        ...(username && { username }),
      };

      const response = await postService.getPosts(params);

      if (response.success) {
        if (append) {
          setPosts((prev) => [...prev, ...response.posts]);
        } else {
          setPosts(response.posts);
        }

        setPagination({
          page: response.pagination.page,
          hasNext: Boolean(response.pagination.has_next) || response.pagination.total_pages > response.pagination.page,
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch posts";
      setError(errorMessage);
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when filters change
  useEffect(() => {
    if (!initialPosts.length) {
      fetchPosts(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDependencies]);

  // IMPORTANT: like/dislike returns Post (frontend shape). Use it to update local state.
  const handleLike = async (postId: number) => {
    try {
      const updated = await postService.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: updated.likes,
                dislikes: updated.dislikes,
                isLiked: updated.isLiked,
                isDisliked: updated.isDisliked,
              }
            : p
        )
      );
    } catch (err) {
      // fallback resync
      fetchPosts(pagination.page, false);
      console.error("Error liking post:", err);
    }
  };

  const handleDislike = async (postId: number) => {
    try {
      const updated = await postService.dislikePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: updated.likes,
                dislikes: updated.dislikes,
                isLiked: updated.isLiked,
                isDisliked: updated.isDisliked,
              }
            : p
        )
      );
    } catch (err) {
      fetchPosts(pagination.page, false);
      console.error("Error disliking post:", err);
    }
  };

  // Now: comments open a dedicated page (Reddit-like)
  const openComments = (postId: number) => {
    navigate(`/post/${postId}/comments`);
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
          <button onClick={retryFetch} className="retry-btn">
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
              // Both comment button and card click should navigate to comments page.
              onComment={openComments}
              onOpenComments={openComments}
            />
          ))}
        </div>

        {loading && posts.length > 0 && <div className="loading-more">Loading more posts...</div>}

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

        {!loading && posts.length === 0 && <div className="no-posts">No posts found.</div>}
      </div>
    </div>
  );
};

export default DiscussionPage;
