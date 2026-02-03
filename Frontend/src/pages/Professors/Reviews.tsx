import { useMemo } from "react";
import { ReviewCard } from "../../components/Reviews/ReviewCard";
import { Review } from "../../types/review_posts";
import { Card } from "../../components/UILib";
import { usePosts } from "../../hooks/usePosts";
import { useNavigate } from "react-router-dom";
import { postService } from '../../services/PostService';
import "./Reviews.css";

const mapPostToReview = (post: any): Review => ({
	id: post.id,
	professorName: post.attributes.professorName,
	faculty: post.attributes.faculty,
	courseName: post.attributes.courseName,
	semester: post.attributes.semester,
	overallRating: parseFloat(post.attributes.overallRating),
	ratings: {
		teaching: parseFloat(post.attributes.ratingsTeaching),
		grading: parseFloat(post.attributes.ratingsGrading),
		clarity: parseFloat(post.attributes.ratingsClarity),
		helpfulness: parseFloat(post.attributes.ratingsHelpfulness),
		satisfaction: parseFloat(post.attributes.ratingsSatisfaction),
	},
	comment: post.attributes.body,
	likes: post.likes,
	comments: post.comments,
	isLiked: post.isLiked,
    dislikes: post.dislikes,
    isDisliked: post.isDisliked
});

export function ReviewPage() {
	const navigate = useNavigate();
	const { posts, loading, refetch } = usePosts();
	
	const reviews = useMemo(() => 
		posts.map(mapPostToReview),
		[posts]
	);

	const handleLike = async (reviewId: number) => {
		try {
			await postService.likePost(reviewId);
			refetch();
		} catch (err) {
			console.error('Error liking review:', err);
		}
	};

	if (loading) {
		return (
			<div className="reviews-page-container loading-container">
				{/* اسکلت هدر */}
				<div className="skeleton-header">
					<div className="skeleton-title"></div>
					<div className="skeleton-subtitle"></div>
				</div>

				{/* اسکلت کارت‌های نقد */}
				<div className="skeleton-reviews-grid">
					{[...Array(4)].map((_, index) => (
						<div key={index} className="skeleton-review-card">
							{/* هدر کارت */}
							<div className="skeleton-card-header">
								<div className="skeleton-professor-info">
									<div className="skeleton-avatar"></div>
									<div className="skeleton-professor-details">
										<div className="skeleton-text large"></div>
										<div className="skeleton-badges">
											{[...Array(3)].map((_, i) => (
												<div key={i} className="skeleton-badge"></div>
											))}
										</div>
									</div>
								</div>
								<div className="skeleton-rating">
									<div className="skeleton-stars"></div>
									<div className="skeleton-rating-text"></div>
								</div>
							</div>

							{/* بدنه کارت */}
							<div className="skeleton-card-body">
								<div className="skeleton-comment">
									{[...Array(4)].map((_, i) => (
										<div key={i} className="skeleton-text medium"></div>
									))}
								</div>

								{/* امتیازات جزئی */}
								<div className="skeleton-detailed-ratings">
									{[...Array(5)].map((_, i) => (
										<div key={i} className="skeleton-rating-item">
											<div className="skeleton-text small"></div>
											<div className="skeleton-mini-stars"></div>
										</div>
									))}
								</div>
							</div>

							{/* فوتر کارت */}
							<div className="skeleton-card-footer">
								<div className="skeleton-actions">
									<div className="skeleton-action-button"></div>
									<div className="skeleton-action-button"></div>
									<div className="skeleton-action-button"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="reviews-page-container dark:bg-gray-900">
			<div className="max-w-5xl mx-auto py-8">
				<div className="space-y-6">
					{reviews.length === 0 ? (
						<Card className="p-12 text-center bg-white dark:bg-gray-800 dark:border-gray-700">
							<p className="text-gray-500 dark:text-gray-400">نقدی یافت نشد.</p>
						</Card>
					) : (
						reviews.map((review) => (
							<ReviewCard
								key={review.id}
								review={review}
								onLike={() => handleLike(review.id)}
								onOpenProfessor={() => navigate(`/topic/professor-review/${review.professorName}`)}
								showDetailedRatings={true}
								onOpenComments={() => navigate(`/reviews/${review.id}/comments`)}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}