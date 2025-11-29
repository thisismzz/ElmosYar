// types/comments.ts
import { Post } from './posts';

export interface Comment {
  id: number;
  name: string;
  time: string;
  text: string;
  likes: number;
  dislikes?: number;
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