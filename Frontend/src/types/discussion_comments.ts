// types/comments.ts
import { Post } from './discussion_posts';

export interface Reply {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  time: string;
  text: string;
  likes: number;
  dislikes: number;
  is_liked: boolean;
  is_disliked: boolean;
}

export interface Comment {
  id: number;
  name: string;
  time: string;
  text: string;
  likes: number;
  dislikes: number;
  is_liked: boolean;
  is_disliked: boolean;
  replies?: Reply[];
  replyCount?: number;
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
  postId?: number;
  showReplyButton?: boolean;
  onReplyClick?: (commentId: number) => void;
}

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
  currentUserName?: string;
  showReplyButton?: boolean;
  onReplyClick?: (commentId: number) => void;
  onViewReplies?: (commentId: number) => void;
  isReply?: boolean;
}

export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: { text: string }) => void;
  currentUserName: string;
  postId: number;
}

export interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reply: { text: string; parentId: number }) => void;
  currentUserName: string;
  parentCommentId: number;
}

export interface RepliesPageProps {
  commentId: number;
  onBack: () => void;
  currentUserName?: string;
}