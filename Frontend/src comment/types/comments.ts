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
}