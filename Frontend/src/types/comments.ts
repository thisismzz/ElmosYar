export interface Comment {
  id: number;
  name: string;
  time: string;
  text: string;
  likes: number;
  dislikes: number;
}

export interface CommentsProps {
  initialComments?: Comment[];
  title?: string;
  currentUserName?: string;
  postId?: number;
  onBackToPosts?: () => void;
}