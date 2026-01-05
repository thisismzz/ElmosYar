// src/types/discussion_comments.ts
import React from "react";

export interface Reply {
	id: number;

	// optional identity for anonymous
	user?: {
		name: string;
		username?: string;
		avatar?: string;
	};

	// convenience fields (existing usage)
	name: string;
	username?: string;
	avatar?: string;
	isAnonymous: boolean;

	time: string; // ISO or backend timestamp
	text: string;

	likes: number;
	dislikes: number;
	is_liked: boolean;
	is_disliked: boolean;
}

export interface Comment {
	id: number;
	parentId: number;

	// if anonymous, user is undefined
	user?: {
		id: number;
		name: string;
		username: string;
		avatar?: string;
	};

	name: string;
	username?: string;
	avatar?: string;
	isAnonymous: boolean;

	time: string; // ISO or backend timestamp
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
			username?: string;
			avatar?: string;
		};
		likes: number;
		dislikes: number;
		comments: number;
	};

	postId?: number;

	// reddit-style: show composer at top
	showComposer?: boolean;
}

export interface PostHeaderProps {
	post: {
		id: number;
		content: string;
		timestamp: string;
		user: {
			name: string;
			username?: string;
			avatar?: string;
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

	onReplySubmit: (parentCommentId: number, text: string) => Promise<void>;
	onLoadReplies: (commentId: number) => Promise<void>;

	isReply?: boolean;
}

export interface CommentComposerProps {
	onSubmit: (text: string) => Promise<void>;
	placeholder?: string;
}
