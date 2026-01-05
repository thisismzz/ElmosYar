import { useMemo } from "react";
import { ReviewCard } from "../../components/Reviews/ReviewCard";
import { Review } from "../../types/review_posts";
import { Card } from "../../components/UILib";
import { usePosts } from "../../hooks/usePosts";
import { useNavigate } from "react-router-dom";
import type { Post } from '../../types/discussion_posts';

const mapPostToReview = (post: Post): Review => ({
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
});

export function ReviewPage() {
	const navigate = useNavigate();
	const { posts, loading } = usePosts();
	
	const reviews = useMemo(() => 
		posts.map(mapPostToReview),
		[posts]
	);

	return (
		<div className="min-h-screen bg-gray-50/30">
			<div className="max-w-5xl mx-auto px-4 py-8">
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
								onLike={() => {console.log("tried to like")}}
								onComment={() => {console.log("tried to comment")}}
								onClick={() => navigate(`/topic/professors/${review.professorName}`)}
								showDetailedRatings={true}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}
