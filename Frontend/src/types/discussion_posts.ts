// types/posts.ts
export interface User {
  id: number;
  name: string;
  avatar: string;
  username: string;
}

export interface BackendUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  is_email_verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface Media {
  id: number;
  url: string;
  media_type: string;
  caption: string;
  order: number;
  file_size: number;
}

export interface BackendPost {
  id: number;
  author: number;
  author_info: BackendUser;
  content: string;
  created_at: string;
  updated_at: string;
  tags: string; 
  mentions: any[];
  media: Media[];
  category: string;
  parent: number | null;
  is_repost: boolean;
  original_post: number | null;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  reposts_count: number;
  replies_count: number;
  user_reaction: 'like' | 'dislike' | null;
  is_saved: boolean;
  attributes: any;
}

export interface Post {
  id: number;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  comments: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  category?: string;
  media?: Media[];
  tags?: string[]; 
  attributes: any;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PostFeedProps {
  category?: string;
  username?: string;
  initialPosts?: Post[];
}

export interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onDislike: (postId: number) => void;
  onComment: (postId: number) => void;
}

export interface PostActionsProps {
  postId: number;
  likes: number;
  dislikes: number;
  comments: number;
  isLiked: boolean;
  isDisliked: boolean;
  onLike: (postId: number) => void;
  onDislike: (postId: number) => void;
  onComment: (postId: number) => void;
}

export type DiscussionSearchProps = {
	body?: string
}