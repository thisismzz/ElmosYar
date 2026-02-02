import { useMemo } from "react";
import { ReviewCard } from "../../components/Reviews/ReviewCard";
import { Review } from "../../types/review_posts";
import { Card } from "../../components/UILib";
import { usePosts } from "../../hooks/usePosts";
import { useNavigate } from "react-router-dom";
import { postService } from '../../services/PostService';


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

	return (
		<div className="min-h-screen bg-gray-50/30">
			<div className="max-w-5xl mx-auto py-8">
				<div className="space-y-6">
					{loading ? (
						<Card className="p-12 text-center">
							<p className="text-gray-500">Loading...</p>
						</Card>
					) : reviews.length === 0 ? (
						<Card className="p-12 text-center">
							<p className="text-gray-500">...</p>
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
