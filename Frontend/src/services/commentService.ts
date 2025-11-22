import api from './authService'; // re-use the axios instance with interceptors
import { Comment } from '../types/comments'; // adjust path as needed

const COMMENTS_BASE_URL = '/posts';

// Fetch comments for a specific post
export const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
  try {
    // Backend returns: { success: true, post: { ..., comments: [...] } }
    const response = await api.get(`${COMMENTS_BASE_URL}/${postId}/`);

    // Ensure structure is valid
    if (!response.data?.post?.comments) {
      return [];
    }

    // Return as Comment[]
    return response.data.post.comments as Comment[];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export default {
  getCommentsByPostId,
};
