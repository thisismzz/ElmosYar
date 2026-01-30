// src/components/Discussion/PostFeed/DiscussionPostFeed.tsx
import React, { useState, useEffect } from "react";
import type { PostFeedProps, Post, PostCardProps, PostActionsProps } from "../../../types/discussion_posts";
import { postService } from "../../../services/PostService";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import "./DiscussionPostFeed.css";
import { useNavigate } from "react-router-dom";

const PostActions: React.FC<PostActionsProps & { onOpenComments: (postId: number) => void }> = ({
	postId,
	likes,
	dislikes,
	comments,
	isLiked,
	isDisliked,
	onLike,
	onDislike,
	onOpenComments,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isLoading) return;
		setIsLoading(true);
		try {
			await onLike(postId);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDislike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isLoading) return;
		setIsLoading(true);
		try {
			await onDislike(postId);
		} finally {
			setIsLoading(false);
		}
	};

	const handleComment = (e: React.MouseEvent) => {
		e.stopPropagation();
		onOpenComments(postId);
	};

	return (
		<div className="post-actions">
			<button className={`action-btn ${isLiked ? "liked" : ""} ${isLoading ? "loading" : ""}`} onClick={handleLike} disabled={isLoading}>
				<span className="action-icon">
					<ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
				</span>
				<span className="action-count">{likes}</span>
			</button>

			<button className={`action-btn ${isDisliked ? "disliked" : ""} ${isLoading ? "loading" : ""}`} onClick={handleDislike} disabled={isLoading}>
				<span className="action-icon">
					<ThumbsDown size={18} fill={isDisliked ? "currentColor" : "none"} />
				</span>
				<span className="action-count">{dislikes}</span>
			</button>

			<button className="action-btn comment-btn" onClick={handleComment}>
				<span className="action-icon">
					<MessageCircle size={18} />
				</span>
				<span className="action-count">{comments}</span>
			</button>
		</div>
	);
};

export const PostCard: React.FC<PostCardProps & { onOpenComments: (postId: number) => void }> = ({
	post,
	onLike,
	onDislike,
	onComment,
	onOpenComments,
}) => {
	const formatTimeAgo = (timestamp: string) => {
		const now = new Date();
		const postDate = new Date(timestamp);
		const diffMins = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
		if (diffMins < 1) return "همین حالا";
		if (diffMins < 60) return `${diffMins} دقیقه پیش`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours} ساعت پیش`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} روز پیش`;
	};

	return (
		<div className="post-card" onClick={() => onOpenComments(post.id)} role="button" tabIndex={0}>
			<div className="post-header">
				<div className="user-avatar">
					<img
						src={post.user.avatar}
						alt={post.user.name}
						onError={(e) => {
							(e.target as HTMLImageElement).src =
								"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9kayreViIUlp8-GZFDlXdNHQc7Ckc8PpM0w&s";
						}}
					/>
				</div>

				<div className="post-header-meta">
					<div className="user-name">{post.user.name}</div>
					<div className="user-username">@{post.user.username}</div>
				</div>

				<div className="post-time">{formatTimeAgo(post.timestamp)}</div>
			</div>

			{post.content ? <div className="post-content post-content-clamp">{post.content}</div> : null}

			{post.tags && post.tags.length > 0 ? (
				<div className="post-tags">
					{post.tags.map((tag, index) => (
						<span key={index} className="post-tag">
							#{tag}
						</span>
					))}
				</div>
			) : null}

			{post.media && post.media.length > 0 ? (
				<div className="post-media">
					{post.media.map((m) => (
						<div key={m.id} className="media-item">
							{m.media_type === "image" ? (
								<img
									src={m.url}
									alt={m.caption}
									onError={(e) => {
										(e.target as HTMLImageElement).style.display = "none";
									}}
								/>
							) : null}
						</div>
					))}
				</div>
			) : null}

			<PostActions
				postId={post.id}
				likes={post.likes}
				dislikes={post.dislikes}
				comments={post.comments}
				isLiked={post.isLiked || false}
				isDisliked={post.isDisliked || false}
				onLike={onLike}
				onDislike={onDislike}
				onComment={onComment}
				onOpenComments={onOpenComments}
			/>
		</div>
	);
};

export default function DiscussionPostFeed({ category, username, initialPosts }: PostFeedProps) {
	const navigate = useNavigate();
	const [posts, setPosts] = useState<Post[]>(initialPosts ?? []);
	const [loading, setLoading] = useState(!initialPosts);

	useEffect(() => {
		if (initialPosts) return;

		const load = async () => {
			setLoading(true);
			try {
				const res = await postService.getPosts({ category, username });
				setPosts(res.posts ?? []);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [category, username, initialPosts]);

	// IMPORTANT: postService.likePost/dislikePost return Post
	const handleLike = async (postId: number) => {
		const r = await postService.likePost(postId);
		setPosts((prev) =>
			prev.map((p) =>
				p.id === postId
					? {
							...p,
							likes: r.likes,
							dislikes: r.dislikes,
							isLiked: r.isLiked,
							isDisliked: r.isDisliked,
					  }
					: p
			)
		);
	};

	const handleDislike = async (postId: number) => {
		const r = await postService.dislikePost(postId);
		setPosts((prev) =>
			prev.map((p) =>
				p.id === postId
					? {
							...p,
							likes: r.likes,
							dislikes: r.dislikes,
							isLiked: r.isLiked,
							isDisliked: r.isDisliked,
					  }
					: p
			)
		);
	};

	const openComments = (postId: number) => navigate(`/post/${postId}/comments`);

	if (loading) return <div className="post-feed">در حال بارگذاری...</div>;

	return (
		<div className="post-feed">
			<div className="post-list">
				{posts.map((post) => (
					<PostCard
						key={post.id}
						post={post}
						onLike={handleLike}
						onDislike={handleDislike}
						onComment={() => console.log("onComment")}
						onOpenComments={openComments}
					/>
				))}
			</div>
		</div>
	);
}
