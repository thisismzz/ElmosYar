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
}