// components/PostFeed.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { type PostFeedProps, type Post, DiscussionSearchProps } from '../../types/discussion_posts';
import { postService, type GetPostsParams } from '../../services/PostService';
import { X } from 'lucide-react';
import Comments from '../../components/Discussion/Comments/DiscussionComments';
import { PostCard } from '../../components/Discussion/Posts/DiscussionPostFeed';
import { getCommentsForPost, getPostCard } from '../../services/commentService';
import { useFilters } from '../../contexts/FilterContext';
import './DiscussionPage.css';

const DiscussionPage: React.FC<PostFeedProps> = ({ category, username, initialPosts = [] }) => {
	const { getFilter, serializeSearch } = useFilters();
	
	// Get search query filter only
	const searchQuery = getFilter('q', '');
	
	const filterDependencies = useMemo(() => {
		return { searchQuery };
	}, [searchQuery]);
	
	const [posts, setPosts] = useState<Post[]>(initialPosts);
	const [loading, setLoading] = useState(!initialPosts.length);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		page: 1,
		hasNext: false,
	});

	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [showCommentsModal, setShowCommentsModal] = useState(false);
	const [commentsLoading, setCommentsLoading] = useState(false);
	const [postComments, setPostComments] = useState<any[]>([]);

	const fetchPosts = async (page: number = 1, append: boolean = false) => {
		try {
			setLoading(true);
			setError(null);
			
			// Build search parameters similar to foodPage
			let search_query = undefined;

			// Build serialized search from FilterContext (includes `*` from `q` param)
			search_query = serializeSearch && serializeSearch();
			
			const params: GetPostsParams = {
				page,
				per_page: 10,
				...(category && { category }),
				...(username && { username }),
				...(search_query && { search: search_query }),
			};
			
			const response = await postService.getPosts(params);
			
			if (response.success) {
				if (append) {
					setPosts(prev => [...prev, ...response.posts]);
				} else {
					setPosts(response.posts);
				}

				setPagination({
					page: response.pagination.page,
					hasNext: response.pagination.has_next || response.pagination.total_pages > response.pagination.page,
				});
			}
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch posts';
			setError(errorMessage);
			console.error('Error fetching posts:', err);
		} finally {
			setLoading(false);
		}
	};

	// Fetch posts when filters change - similar to foodPage
	useEffect(() => {
		if (!initialPosts.length) {
			fetchPosts(1, false);
		}
	}, [filterDependencies]); // Use filterDependencies instead of filters

	
	const handleLike = async (postId: number) => {
		try {
			const post = posts.find(p => p.id === postId);
			if (!post) return;

			setPosts(posts.map(post => {
				if (post.id === postId) {
					if (post.isLiked) {
						return {
							...post,
							likes: post.likes - 1,
							isLiked: false
						};
					} else {
						const newPost = {
							...post,
							likes: post.likes + 1,
							isLiked: true
						};
						if (post.isDisliked) {
							newPost.dislikes = post.dislikes - 1;
							newPost.isDisliked = false;
						}
						return newPost;
					}
				}
				return post;
			}));

			await postService.likePost(postId);
		} catch (err) {
			fetchPosts(pagination.page, false);
			console.error('Error liking post:', err);
		}
	};

	const handleDislike = async (postId: number) => {
		try {
			const post = posts.find(p => p.id === postId);
			if (!post) return;

			setPosts(posts.map(post => {
				if (post.id === postId) {
					if (post.isDisliked) {
						return {
							...post,
							dislikes: post.dislikes - 1,
							isDisliked: false
						};
					} else {
						const newPost = {
							...post,
							dislikes: post.dislikes + 1,
							isDisliked: true
						};
						if (post.isLiked) {
							newPost.likes = post.likes - 1;
							newPost.isLiked = false;
						}
						return newPost;
					}
				}
				return post;
			}));

			await postService.dislikePost(postId);
		} catch (err) {
			fetchPosts(pagination.page, false);
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

	const loadMore = () => {
		if (pagination.hasNext && !loading) {
			fetchPosts(pagination.page + 1, true);
		}
	};

	const retryFetch = () => {
		fetchPosts(1, false);
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
					<button onClick={retryFetch} className="retry-btn">
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

				{loading && posts.length > 0 && (
					<div className="loading-more">Loading more posts...</div>
				)}

				{pagination.hasNext && !loading && (
					<button className="load-more-btn" onClick={loadMore}>
						Load More
					</button>
				)}

				{error && posts.length > 0 && (
					<div className="error">
						<p>Error: {error}</p>
						<button onClick={retryFetch} className="retry-btn">
							Try Again
						</button>
					</div>
				)}

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