// types.ts
export interface User {
  id: number;
  name: string;
  avatar: string;
  username: string;
}

export interface Post {
  id: number;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  comments: number;
}

export interface PostFeedProps {
  posts: Post[];
}

export interface PostCardProps {
  post: Post;
}

export interface PostActionsProps {
  likes: number;
  dislikes: number;
  comments: number;
  onLike: () => void;
  onDislike: () => void;
  onComment: () => void;
}