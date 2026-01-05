import type { BackendPost, User } from "./discussion_posts";

export type Reaction = "like" | "dislike" | null;

export type CommentNode = {
  id: number;
  postId: number;           // root post id this comment belongs to
  parentId: number | null;  // null => top-level comment
  content: string;
  createdAt: string;

  likes: number;
  dislikes: number;
  commentsCount: number;    // replies_count (if backend provides)

  isLiked: boolean;
  isDisliked: boolean;

  isAnonymous: boolean;
  user?: User;              // absent when anonymous or missing author_info

  children: CommentNode[];
};

export type CommentsApiResponse = {
  posts: BackendPost[];
  pagination?: any;
};

export type CreateCommentPayload = {
  content: string;
  parentId?: number | null;
  anonymous?: boolean;
};
