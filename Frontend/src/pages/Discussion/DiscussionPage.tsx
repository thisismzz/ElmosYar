// components/PostFeed.tsx
import React, { useState } from 'react';
import { type PostFeedProps, type Post } from '../../types/discussion_posts';
import { postService } from '../../services/PostService';
import { X } from 'lucide-react';
import Comments from '../../components/Discussion/Comments/DiscussionComments';
import { PostCard } from '../../components/Discussion/Posts/DiscussionPostFeed';
import { getCommentsForPost, getPostCard } from '../../services/commentService';
import { usePosts } from '../../hooks/usePosts';
import './DiscussionPage.css';

const DiscussionPage: React.FC<PostFeedProps> = ({ username }) => {
	const { posts, loading, error, refetch } = usePosts();
	
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [showCommentsModal, setShowCommentsModal] = useState(false);
	const [commentsLoading, setCommentsLoading] = useState(false);
	const [postComments, setPostComments] = useState<any[]>([]);

	const handleLike = async (postId: number) => {
		try {
			await postService.likePost(postId);
			refetch();
		} catch (err) {
			console.error('Error liking post:', err);
		}
	};

	const handleDislike = async (postId: number) => {
		try {
			await postService.dislikePost(postId);
			refetch();
		} catch (err) {
			console.error('Error disliking post:', err);
		}
	};

	// Executes when clicking the comments button. Gets comments and post card, and updates postComments.
	const handleComment = async (postId: number) => {
		try {
			setCommentsLoading(true);

			const [postDetails, comments] = await Promise.all([
				getPostCard(postId),
				getCommentsForPost(postId)
			]);

			setSelectedPost(postDetails);
			setPostComments(comments);
			setShowCommentsModal(true);

		} catch (err) {
			console.error('Error loading post comments:', err);
			try {
				const postDetails = await postService.getPostById(postId);
				setSelectedPost(postDetails);
				setShowCommentsModal(true);
			} catch (fallbackError) {
				console.error('Fallback also failed:', fallbackError);
			}
		} finally {
			setCommentsLoading(false);
		}
	};

	const handleCloseComments = () => {
		setShowCommentsModal(false);
		setSelectedPost(null);
		setPostComments([]);
	};

	const handleModalContentClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	if (loading && posts.length === 0) {
		return (
			<div className="discussion-page-container">
				<div className="loading">Loading posts...</div>
			</div>
		);
	}

	if (error && posts.length === 0) {
		return (
			<div className="discussion-page-container">
				<div className="error">
					<p>Error: {error}</p>
					<button onClick={refetch} className="retry-btn">
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="discussion-page-container">
			<div className="post-feed">
				<div className="post-list">
					{posts.map(post => (
						<PostCard
							key={post.id}
							onLike={handleLike}
							post={post}
							onDislike={handleDislike}
							onComment={handleComment}
						/>
					))}
				</div>

				{!loading && posts.length === 0 && (
					<div className="no-posts">
						No posts found.
					</div>
				)}
			</div>

			{/* Modal کامنت‌ها */}
			{showCommentsModal && (
				<div className="comments-modal-overlay" onClick={handleCloseComments}>
					<div className="comments-modal-content" onClick={handleModalContentClick}>
						<div className="comments-modal-header">
							<h3>نظرات پست</h3>
							<button
								className="close-comments-btn"
								onClick={handleCloseComments}
							>
								<X size={20} />
							</button>
						</div>

						<div className="comments-modal-body">
							{selectedPost && (
								<Comments
									post={selectedPost}
									comments={postComments}
									setComments={setPostComments}
									currentUserName=""
									title=""
								/>
							)}
						</div>
					</div>
				</div>
			)}

			{/* اینجا خطا داشت - تصحیح شد */}
			{commentsLoading && (
				<div className="comments-loading">
					در حال بارگذاری نظرات...
				</div>
			)}
		</div>
	);
};

export default DiscussionPage;