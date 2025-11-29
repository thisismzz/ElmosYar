// services/PostService.ts
import api from './authService'; // Import the same axios instance
import { Post, BackendPost, PaginationInfo } from '../types/posts';

export interface GetPostsParams {
  page?: number;
  per_page?: number;
  category?: string;
  username?: string;
}

export interface GetPostsResponse {
  success: boolean;
  posts: BackendPost[];
  pagination: PaginationInfo;
}

class PostService {
  async getPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/posts/?${queryParams}`);
    return response.data;
  }

  async likePost(postId: number): Promise<void> {
    await api.post(`/posts/${postId}/like/`);
  }

  async dislikePost(postId: number): Promise<void> {
    await api.post(`/posts/${postId}/dislike/`);
  }

  async removeReaction(postId: number): Promise<void> {
    await api.post(`/posts/${postId}/remove_reaction/`);
  }

  async createPost(postData: {
    content: string;
    category?: string;
    tags?: string;
    media?: File[];
  }): Promise<BackendPost> {
    const formData = new FormData();
    formData.append('content', postData.content);
    
    if (postData.category) {
      formData.append('category', postData.category);
    }
    
    if (postData.tags) {
      formData.append('tags', postData.tags);
    }
    
    if (postData.media) {
      postData.media.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });
    }

    const response = await api.post('/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getPostById(postId: number): Promise<BackendPost> {
    const response = await api.get(`/posts/${postId}/`);
    return response.data;
  }

  async deletePost(postId: number): Promise<void> {
    await api.delete(`/posts/${postId}/`);
  }

  async getComments(postId: number, params: GetPostsParams = {}): Promise<GetPostsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/posts/${postId}/comments/?${queryParams}`);
    return response.data;
  }

  async createComment(postId: number, content: string): Promise<BackendPost> {
    const response = await api.post(`/posts/${postId}/comments/`, { content });
    return response.data;
  }

  async savePost(postId: number): Promise<void> {
    await api.post(`/posts/${postId}/save/`);
  }

  async unsavePost(postId: number): Promise<void> {
    await api.post(`/posts/${postId}/unsave/`);
  }

  async getSavedPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/posts/saved/?${queryParams}`);
    return response.data;
  }
}

export const postService = new PostService();
export default PostService;