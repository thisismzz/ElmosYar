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

export interface Comment { //this type of comment in: postservice.craetecomment, commentservice.createcommentonpost
	id: number;
	user: {
		id: number;
		name: string;
		avatar?: string;
		username?: string;
	};
	content: string;
	timestamp: string;

	likes: number;
	dislikes: number;

	isLiked: boolean;
	isDisliked: boolean;

	isAnonymous: boolean;

    parent: number | null;

	repliesCount?: number;
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
            id: number;
			name: string;
			username?: string;
			avatar?: string;
		};
		likes: number;
		dislikes: number;
		comments: number;
        isLiked?: boolean;
        isDisliked?: boolean;
        category?: string;
        tags?: string[]; 
        attributes: any;
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
