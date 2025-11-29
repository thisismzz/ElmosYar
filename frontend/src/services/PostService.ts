// services/postService.ts
import api from "./authService";
import { type Post, BackendPost, PaginationInfo } from "../types/posts";

export interface GetPostsParams {
  page?: number;
  per_page?: number;
  category?: string;
  username?: string;
  search?: string;
}

export interface GetPostsResponse {
  success: boolean;
  posts: Post[];
  pagination: PaginationInfo;
}

export interface Comment {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

class UltimatePostService {
  
  async getPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
    try {
      console.log('📡 در حال دریافت پست‌ها از API...', params);
      
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/posts/?${queryParams}`);
      console.log('✅ اتصال به بک‌اند موفق!', response.data);

      const backendPosts = this.extractPostsFromResponse(response.data);
      const formattedPosts = backendPosts.map(backendPost => 
        this.mapBackendPostToFrontend(backendPost)
      );

      return {
        success: true,
        posts: formattedPosts,
        pagination: response.data.pagination || {
          page: params.page || 1,
          per_page: params.per_page || 10,
          total: formattedPosts.length,
          total_pages: 1
        }
      };
      
    } catch (error: any) {
      console.error('💥 خطا در دریافت پست‌ها:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async fetchPosts(): Promise<Post[]> {
    const response = await this.getPosts();
    return response.posts;
  }

  async likePost(postId: number): Promise<Post> {
    try {
      console.log(`👍 در حال لایک پست ${postId}...`);
      const response = await api.post(`/posts/${postId}/like/`);
      
      return this.mapBackendPostToFrontend(response.data.post || response.data);
    } catch (error: any) {
      console.error('❌ خطا در لایک:', error);
      throw error;
    }
  }

  async dislikePost(postId: number): Promise<Post> {
    try {
      console.log(`👎 در حال دیسلایک پست ${postId}...`);
      const response = await api.post(`/posts/${postId}/dislike/`);
      
      return this.mapBackendPostToFrontend(response.data.post || response.data);
    } catch (error: any) {
      console.error('❌ خطا در دیسلایک:', error);
      throw error;
    }
  }

  async removeReaction(postId: number): Promise<Post> {
    try {
      const response = await api.post(`/posts/${postId}/remove_reaction/`);
      return this.mapBackendPostToFrontend(response.data.post || response.data);
    } catch (error: any) {
      console.error('❌ خطا در حذف ری‌اکشن:', error);
      throw error;
    }
  }

  async createPost(postData: {
    content: string;
    category?: string;
    tags?: string;
    media?: File[];
  }): Promise<Post> {
    try {
      const formData = new FormData();
      formData.append('content', postData.content);
      
      if (postData.category) formData.append('category', postData.category);
      if (postData.tags) formData.append('tags', postData.tags);
      if (postData.media) {
        postData.media.forEach((file, index) => {
          formData.append(`media_${index}`, file);
        });
      }

      const response = await api.post('/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return this.mapBackendPostToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ خطا در ایجاد پست:', error);
      throw error;
    }
  }

  async getPostById(postId: number): Promise<Post> {
    try {
      const response = await api.get(`/posts/${postId}/`);
      return this.mapBackendPostToFrontend(response.data);
    } catch (error: any) {
      console.error('❌ خطا در دریافت پست:', error);
      throw error;
    }
  }

  async getComments(postId: number, params: GetPostsParams = {}): Promise<{ comments: Comment[]; pagination: PaginationInfo }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/posts/${postId}/comments/?${queryParams}`);
      
      const comments = Array.isArray(response.data) 
        ? response.data 
        : response.data.comments || response.data.results || [];

      const formattedComments = comments.map((comment: any) => ({
        id: comment.id,
        user: {
          id: comment.author?.id || comment.user?.id || 1,
          name: comment.author?.first_name || comment.user?.name || "کاربر ناشناس",
          avatar: comment.author?.profile_picture || comment.user?.avatar || "",
          username: comment.author?.username || comment.user?.username || "user"
        },
        content: comment.content || comment.text || "",
        timestamp: comment.created_at || comment.timestamp || new Date().toISOString(),
        likes: comment.likes_count || comment.likes || 0,
        isLiked: comment.is_liked || comment.liked || false
      }));

      return {
        comments: formattedComments,
        pagination: response.data.pagination || {
          page: params.page || 1,
          per_page: params.per_page || 10,
          total: formattedComments.length,
          total_pages: 1
        }
      };
    } catch (error: any) {
      console.error('❌ خطا در دریافت نظرات:', error);
      throw error;
    }
  }

  async createComment(postId: number, content: string): Promise<Comment> {
    try {
      const response = await api.post(`/posts/${postId}/comments/`, { content });
      
      const commentData = response.data.comment || response.data;
      return {
        id: commentData.id,
        user: {
          id: commentData.author?.id || commentData.user?.id || 1,
          name: commentData.author?.first_name || commentData.user?.name || "کاربر ناشناس",
          avatar: commentData.author?.profile_picture || commentData.user?.avatar || "",
          username: commentData.author?.username || commentData.user?.username || "user"
        },
        content: commentData.content || commentData.text || "",
        timestamp: commentData.created_at || commentData.timestamp || new Date().toISOString(),
        likes: commentData.likes_count || commentData.likes || 0,
        isLiked: commentData.is_liked || commentData.liked || false
      };
    } catch (error: any) {
      console.error('❌ خطا در ایجاد نظر:', error);
      throw error;
    }
  }

  private extractPostsFromResponse(responseData: any): any[] {
    if (responseData.posts) return responseData.posts;
    if (Array.isArray(responseData)) return responseData;
    if (responseData.results) return responseData.results;
    return [];
  }

  private mapBackendPostToFrontend(backendPost: any): Post {
    return {
      id: backendPost.id,
      user: {
        id: backendPost.author?.id || 
             backendPost.user?.id || 
             backendPost.author_info?.id || 
             backendPost.user_id ||
             1,
        name: backendPost.author?.first_name || 
              backendPost.user?.name || 
              backendPost.author_info?.first_name || 
              (backendPost.user?.first_name ? 
                `${backendPost.user.first_name} ${backendPost.user.last_name || ''}`.trim() 
                : "کاربر ناشناس"),
        avatar: backendPost.author?.profile_picture || 
                backendPost.user?.avatar || 
                backendPost.author_info?.profile_picture || 
                backendPost.profile_picture ||
                "",
        username: backendPost.author?.username || 
                  backendPost.user?.username || 
                  backendPost.author_info?.username ||
                  "user"
      },
      content: backendPost.content || backendPost.text || backendPost.body || "محتوای پست",
      timestamp: backendPost.created_at || backendPost.timestamp || backendPost.date || new Date().toISOString(),
      likes: backendPost.likes_count || backendPost.likes || backendPost.like_count || 0,
      dislikes: backendPost.dislikes_count || backendPost.dislikes || 0,
      comments: backendPost.comments_count || backendPost.comments || backendPost.comment_count || 0,
      isLiked: backendPost.is_liked || backendPost.liked || false,
      isDisliked: backendPost.is_disliked || backendPost.disliked || false,
      media: backendPost.media || backendPost.attachments || [],
      category: backendPost.category,
      tags: backendPost.tags ? (Array.isArray(backendPost.tags) ? backendPost.tags : backendPost.tags.split(',')) : []
    };
  }
}

export const postService = new UltimatePostService();

export const fetchPosts = () => postService.fetchPosts();
export const likePost = (postId: number) => postService.likePost(postId);
export const dislikePost = (postId: number) => postService.dislikePost(postId);
export const createPost = (content: string) => postService.createPost({ content });
export const getPostById = (postId: number) => postService.getPostById(postId);
export const getComments = (postId: number, params?: GetPostsParams) => postService.getComments(postId, params);
export const createComment = (postId: number, content: string) => postService.createComment(postId, content);

export default UltimatePostService;