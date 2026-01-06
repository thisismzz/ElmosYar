import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { postService, type GetPostsParams } from '../services/PostService';
import type { Post } from '../types/discussion_posts';
import { useFilters } from '../contexts/FilterContext';

interface UsePostsOptions {
  username?: string;
  allowedSearchKeys?: string[];
  enabled?: boolean;
}

interface UsePostsResult {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Maps URL pathname to post category
 * Examples:
 * - /topic/food -> food
 * - /topic/professors -> professor-review
 * - /topic/discussion -> discussion
 */
const getCategoryFromLocation = (pathname: string): string | undefined => {
  const match = pathname.match(/^\/topic\/([^/]+)/);
  return match ? match[1] : undefined;
};

/**
 * Hook to fetch posts with automatic filter integration
 * Automatically detects category from URL pathname
 * Handles loading, error states, and refetching automatically
 */
export const usePosts = (options: UsePostsOptions = {}): UsePostsResult => {
  const { 
    username: usernameOption, 
    allowedSearchKeys,
    enabled = true 
  } = options;
  
  const location = useLocation();
  const category = getCategoryFromLocation(location.pathname);
  
  const { serializeSearch, getUsername, filters } = useFilters();
  
  // Use username from FilterContext if available, otherwise fall back to options
  const username = getUsername() || usernameOption;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // Create filter dependencies from filters object
  const filterDependencies = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  const fetchPosts = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Build serialized search from FilterContext
      const search = serializeSearch?.(allowedSearchKeys);
      
      const params: GetPostsParams = {
        page: 1,
        per_page: 100,
        ...(category && { category }),
        ...(username && { username }),
        ...(search && { search }),
      };
      
      const response = await postService.getPosts(params);
      
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch posts';
      setError(errorMessage);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [category, username, serializeSearch, enabled]);

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [filterDependencies, fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
};
