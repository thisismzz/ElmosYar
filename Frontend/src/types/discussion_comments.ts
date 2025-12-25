// types/comments.ts
import { Post } from './discussion_posts';

export interface Comment {
  id: number;
  name: string;
  time: string;
  text: string;
  likes: number;
  dislikes?: number;
  is_liked: boolean;
  is_disliked: boolean;
}

export interface CommentsProps {
  initialComments?: Comment[];
  comments?: Comment[];
  setComments?: React.Dispatch<React.SetStateAction<Comment[]>>;
  title?: string;
  currentUserName?: string;
  post?: {
    id: number;
    content: string;
    timestamp: string;
    user: {
      name: string;
    };
    likes: number;
    dislikes: number;
    comments: number;
  };
  postId?: number; // Add postId to fetch comments from backend
}

//* Didn't replace with post type from discussion_posts.ts because we might want to change that in the future to not show whole post contents.
export interface PostHeaderProps {
  post: {
    id: number;
    content: string;
    timestamp: string;
    user: {
      name: string;
    };
    likes: number;
    dislikes: number;
    comments: number;
  };
}

export interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: number) => void;
  onDislike: (commentId: number) => void;
}

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: { text: string }) => void;
  currentUserName: string;
  postId: number;
}