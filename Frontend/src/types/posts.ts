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
  isLiked?: boolean;
  isDisliked?: boolean;
}

export interface PostFeedProps {
  posts: Post[];
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
