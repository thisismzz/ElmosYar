// src/components/Discussion/Comments/DiscussionComments.tsx
import React, { useMemo, useState } from "react";
import type {
	Comment,
	CommentsProps,
	PostHeaderProps,
	Reply,
} from "../../../types/discussion_comments";
import {
	createCommentOnPost,
	createReplyOnComment,
	dislikeComment,
	getRepliesForComment,
	likeComment,
} from "../../../services/commentService";
import { ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import "./DiscussionComments.css";

// ---------- Time ago (Persian) ----------
const timeAgoFa = (isoOrTs: string) => {
	const d = new Date(isoOrTs);
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();

	const mins = Math.floor(diffMs / (1000 * 60));
	if (mins < 1) return "همین الان";
	if (mins < 60) return `${mins} دقیقه پیش`;

	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours} ساعت پیش`;

	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} روز پیش`;

	const weeks = Math.floor(days / 7);
	if (weeks < 5) return `${weeks} هفته پیش`;

	const months = Math.floor(days / 30);
	if (months < 12) return `${months} ماه پیش`;

	const years = Math.floor(days / 365);
	return `${years} سال پیش`;
};

const getInitials = (name: string): string =>
	name
		.split(" ")
		.map((w) => w.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);

const getAvatarColor = (name: string): string => {
	const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];
	return colors[name.length % colors.length];
};

// ---------- Post header (compact) ----------
const PostHeader: React.FC<PostHeaderProps> = ({ post }) => {
	const initials = getInitials(post.user.name);
	const avatarColor = getAvatarColor(post.user.name);

	return (
		<div className="discussion-post-header compact">
			<div className="discussion-post-user-info compact">
				<div className="discussion-user-avatar" style={{ backgroundColor: avatarColor }}>
					{initials}
				</div>

				<div className="discussion-user-details">
					<div className="discussion-author-row">
						<span className="discussion-author-name">{post.user.name}</span>
						{post.user.username ? <span className="discussion-author-username">@{post.user.username}</span> : null}
						<span className="discussion-post-time">{timeAgoFa(post.timestamp)}</span>
					</div>
				</div>
			</div>

			<div className="discussion-post-content-wrapper compact">
				<p className="discussion-post-content-text">{post.content}</p>
			</div>

			<div className="discussion-post-stats compact">
				<div className="discussion-stat-item">
					<span className="discussion-stat-icon">
						<ThumbsUp size={18} />
					</span>
					<span className="discussion-stat-count">{post.likes}</span>
				</div>
				<div className="discussion-stat-item">
					<span className="discussion-stat-icon">
						<ThumbsDown size={18} />
					</span>
					<span className="discussion-stat-count">{post.dislikes}</span>
				</div>
				<div className="discussion-stat-item">
					<span className="discussion-stat-icon">
						<MessageCircle size={18} />
					</span>
					<span className="discussion-stat-count">{post.comments}</span>
				</div>
			</div>
		</div>
	);
};

// ---------- Composer ----------
const CommentComposer: React.FC<{ onSubmit: (text: string) => Promise<void> }> = ({ onSubmit }) => {
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim() || loading) return;

		setLoading(true);
		try {
			await onSubmit(text.trim());
			setText("");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="comment-composer" onSubmit={submit}>
			<textarea
				className="comment-input"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="نظر خود را بنویسید..."
				rows={4}
				required
			/>
			<div className="composer-actions">
				<button type="submit" className="comment-submit-button" disabled={!text.trim() || loading}>
					ارسال
				</button>
			</div>
		</form>
	);
};

// ---------- Reply Item ----------
const ReplyItem: React.FC<{
	reply: Reply;
	onLike: (id: number) => void;
	onDislike: (id: number) => void;
}> = ({ reply, onLike, onDislike }) => {
	const displayName = reply.isAnonymous ? "ناشناس" : reply.name;
	const initials = getInitials(displayName);
	const avatarColor = getAvatarColor(displayName);

	return (
		<div className="reply-item">
			<div className="reply-content">
				<div className="reply-header">
					<div className="user-avatar small" style={{ backgroundColor: avatarColor }}>
						{initials}
					</div>
					<div className="user-info">
						<span className="author-name">{displayName}</span>
						{reply.isAnonymous ? null : reply.username ? <span className="reply-username">@{reply.username}</span> : null}
						<span className="comment-time">{timeAgoFa(reply.time)}</span>
					</div>
				</div>
				<p className="reply-text">{reply.text}</p>
			</div>

			<div className="reply-actions">
				<button className={`action-btn like-btn small ${reply.is_liked ? "liked" : ""}`} onClick={() => onLike(reply.id)}>
					<span className="action-icon">
						<ThumbsUp size={14} fill={reply.is_liked ? "currentColor" : "none"} />
					</span>
					<span className="action-count">{reply.likes}</span>
				</button>

				<button className={`action-btn dislike-btn small ${reply.is_disliked ? "disliked" : ""}`} onClick={() => onDislike(reply.id)}>
					<span className="action-icon">
						<ThumbsDown size={14} fill={reply.is_disliked ? "currentColor" : "none"} />
					</span>
					<span className="action-count">{reply.dislikes}</span>
				</button>
			</div>
		</div>
	);
};

// ---------- Comment Item ----------
const CommentItem: React.FC<{
	comment: Comment;
	onLike: (commentId: number) => void;
	onDislike: (commentId: number) => void;
	onReplySubmit: (parentCommentId: number, text: string) => Promise<void>;
	onLoadReplies: (commentId: number) => Promise<void>;
}> = ({ comment, onLike, onDislike, onReplySubmit, onLoadReplies }) => {
	const [showReplies, setShowReplies] = useState(false);
	const [replyOpen, setReplyOpen] = useState(false);
	const [replyText, setReplyText] = useState("");
	const [loadingReplies, setLoadingReplies] = useState(false);
	const [submittingReply, setSubmittingReply] = useState(false);

	const displayName = comment.isAnonymous ? "ناشناس" : comment.name;
	const initials = getInitials(displayName);
	const avatarColor = getAvatarColor(displayName);

	const toggleReplies = async () => {
		const next = !showReplies;
		setShowReplies(next);

		if (next && (comment.replies?.length ?? 0) === 0 && (comment.replyCount ?? 0) > 0) {
			setLoadingReplies(true);
			try {
				await onLoadReplies(comment.id);
			} finally {
				setLoadingReplies(false);
			}
		}
	};

	const submitReply = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!replyText.trim() || submittingReply) return;

		setSubmittingReply(true);
		try {
			await onReplySubmit(comment.id, replyText.trim());
			setReplyText("");
			setReplyOpen(false);
			setShowReplies(true);
		} finally {
			setSubmittingReply(false);
		}
	};

	return (
		<div className={`comment ${(comment.replyCount ?? 0) > 0 ? "has-replies" : ""}`}>
			<div className="comment-header">
				<div className="comment-user-avatar" style={{ backgroundColor: avatarColor }}>
					{initials}
				</div>

				<div className="user-info">
					<div className="comment-author-row">
						<span className="author-name">{displayName}</span>
						{comment.isAnonymous ? null : comment.username ? <span className="comment-username">@{comment.username}</span> : null}
						<span className="comment-time">{timeAgoFa(comment.time)}</span>
					</div>
				</div>
			</div>

			<p className="comment-content">{comment.text}</p>

			<div className="comment-actions">
				<div className="action-group">
					<button className={`action-btn like-btn ${comment.is_liked ? "liked" : ""}`} onClick={() => onLike(comment.id)}>
						<span className="action-icon">
							<ThumbsUp size={18} fill={comment.is_liked ? "currentColor" : "none"} />
						</span>
						<span className="action-count">{comment.likes}</span>
					</button>

					<button className={`action-btn dislike-btn ${comment.is_disliked ? "disliked" : ""}`} onClick={() => onDislike(comment.id)}>
						<span className="action-icon">
							<ThumbsDown size={18} fill={comment.is_disliked ? "currentColor" : "none"} />
						</span>
						<span className="action-count">{comment.dislikes}</span>
					</button>

					<button className="action-btn reply-btn" onClick={() => setReplyOpen((p) => !p)}>
						<span className="action-icon">
							<MessageCircle size={18} />
						</span>
						<span className="action-text">پاسخ</span>
					</button>
				</div>

				{(comment.replyCount ?? 0) > 0 && (
					<button className="action-btn view-replies-btn" onClick={toggleReplies}>
						<span className="action-icon">{showReplies ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
						<span className="action-text">{comment.replyCount} پاسخ</span>
					</button>
				)}
			</div>

			{replyOpen && (
				<form className="reply-form" onSubmit={submitReply}>
					<div className="reply-input-wrapper">
						<textarea
							value={replyText}
							onChange={(e) => setReplyText(e.target.value)}
							placeholder={`پاسخ به ${displayName}...`}
							className="reply-input"
							rows={3}
							required
						/>
						<div className="reply-form-actions">
							<button type="button" className="comment-cancel-btn small" onClick={() => setReplyOpen(false)}>
								انصراف
							</button>
							<button type="submit" className="comment-submit-button small" disabled={!replyText.trim() || submittingReply}>
								ارسال پاسخ
							</button>
						</div>
					</div>
				</form>
			)}

			{showReplies && (
				<div className="replies-list">
					{loadingReplies ? <div className="replies-loading">در حال بارگذاری پاسخ‌ها...</div> : null}

					{(comment.replies ?? []).map((r) => (
						<div key={r.id} className="reply-wrapper">
							<ReplyItem reply={r} onLike={onLike} onDislike={onDislike} />
						</div>
					))}
				</div>
			)}
		</div>
	);
};

// ---------- Main ----------
const Comments: React.FC<CommentsProps> = ({
	initialComments = [],
	comments: externalComments,
	setComments: externalSetComments,
	title = "نظرات",
	currentUserName = "کاربر",
	post,
	postId,
	showComposer = true,
}) => {
	const [internalComments, internalSetComments] = useState<Comment[]>(initialComments);
	const comments = externalComments ?? internalComments;
	const setComments = externalSetComments ?? internalSetComments;

	const targetPostId = useMemo(() => postId ?? post?.id ?? -1, [postId, post]);

	const addTopLevelComment = async (text: string) => {
		if (targetPostId < 0) return;

		// optimistic insert
		const optimistic: Comment = {
			id: Date.now(),
			user: { id: -1, name: currentUserName, username: "none", avatar: undefined },
			name: currentUserName,
			username: undefined,
			avatar: undefined,
			isAnonymous: false,
			time: new Date().toISOString(),
			text,
			likes: 0,
			dislikes: 0,
			is_liked: false,
			is_disliked: false,
			replies: [],
			replyCount: 0,
		};

		setComments((prev) => [optimistic, ...prev]);

		try {
			await createCommentOnPost(targetPostId, text);
		} catch (e) {
			setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
			throw e;
		}
	};

	const handleReplySubmit = async (parentCommentId: number, text: string) => {
		const optimisticReply: Reply = {
			id: Date.now(),
			user: { name: currentUserName },
			name: currentUserName,
			username: undefined,
			avatar: undefined,
			isAnonymous: false,
			time: new Date().toISOString(),
			text,
			likes: 0,
			dislikes: 0,
			is_liked: false,
			is_disliked: false,
		};

		setComments((prev) =>
			prev.map((c) =>
				c.id === parentCommentId
					? {
							...c,
							replies: [...(c.replies ?? []), optimisticReply],
							replyCount: (c.replyCount ?? 0) + 1,
					  }
					: c
			)
		);

		try {
			await createReplyOnComment(parentCommentId, text);
		} catch (e) {
			setComments((prev) =>
				prev.map((c) =>
					c.id === parentCommentId
						? {
								...c,
								replies: (c.replies ?? []).filter((r) => r.id !== optimisticReply.id),
								replyCount: Math.max(0, (c.replyCount ?? 1) - 1),
						  }
						: c
				)
			);
			throw e;
		}
	};

	const handleLoadReplies = async (commentId: number) => {
		const replies = await getRepliesForComment(commentId);
		setComments((prev) =>
			prev.map((c) => (c.id === commentId ? { ...c, replies, replyCount: replies.length } : c))
		);
	};

	// IMPORTANT: likeComment/dislikeComment return Post (frontend), not likes_count fields.
	const handleLike = async (commentId: number) => {
		const r = await likeComment(commentId);
		setComments((prev) =>
			prev.map((c) =>
				c.id === commentId
					? {
							...c,
							likes: r.likes,
							dislikes: r.dislikes,
							is_liked: r.isLiked ?? true,
							is_disliked: r.isDisliked ?? false,
					  }
					: c
			)
		);
	};

	const handleDislike = async (commentId: number) => {
		const r = await dislikeComment(commentId);
		setComments((prev) =>
			prev.map((c) =>
				c.id === commentId
					? {
							...c,
							likes: r.likes,
							dislikes: r.dislikes,
							is_liked: r.isLiked ?? false,
							is_disliked: r.isDisliked ?? true,
					  }
					: c
			)
		);
	};

	return (
		<div className="comments-container">
			<div className="comments-card">
				{post ? <PostHeader post={post} /> : null}

				<div className="comments-header simple">
					<h2 className="comments-title">{title}</h2>
				</div>

				{showComposer ? <CommentComposer onSubmit={addTopLevelComment} /> : null}

				<div className="comments-list">
					{comments.map((c) => (
						<CommentItem
							key={c.id}
							comment={c}
							onLike={handleLike}
							onDislike={handleDislike}
							onReplySubmit={handleReplySubmit}
							onLoadReplies={handleLoadReplies}
						/>
					))}

					{comments.length === 0 ? (
						<div className="empty-state">
							<h3>هنوز نظری ثبت نشده است</h3>
							<p>اولین نفری باشید که نظر می‌دهد!</p>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default Comments;
