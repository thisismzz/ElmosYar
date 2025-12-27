import { useEffect, useState, useMemo } from "react";
import { Input } from "../../components/UILib";
import { ReviewCard } from "../../components/Reviews/ReviewCard";
import { Review, ReviewPostSearchProps } from "../../types/review_posts";
import { Search, TrendingUp } from "lucide-react";
import { Card } from "../../components/UILib";
import { useFilters } from "../../contexts/FilterContext";
import { useNavigate } from "react-router-dom";
import { postService } from '../../services/PostService';


export const getReviewPosts = async (search?: string): Promise<Review[]> => {
	const review_posts = await postService.getPosts({
		category: "professor-review",
		search,
	});

	const result: Review[] = [];

	for (const post of review_posts.posts) {
		const post_content_json = post.attributes;
		result.push({
			id: post_content_json.id,
			professorName: post_content_json.professorName,
			faculty: post_content_json.faculty,
			courseName: post_content_json.courseName,
			semester: post_content_json.semester,
			overallRating: parseFloat(post_content_json.overallRating),
			ratings: {
				teaching: parseFloat(post_content_json.ratingsTeaching),
				grading: parseFloat(post_content_json.ratingsGrading),
				clarity: parseFloat(post_content_json.ratingsClarity),
				helpfulness: parseFloat(post_content_json.ratingsHelpfulness),
				satisfaction: parseFloat(post_content_json.ratingsSatisfaction),
			},
			comment: post_content_json.body,
			likes: post.likes,
			comments: post.comments,
			isLiked: post.isLiked,
		});
	}

	return result;
};

export function ReviewPage() {
	const navigate = useNavigate();
	const { getFilter, serializeSearch } = useFilters();

	// Get search query filter
	const searchQuery = getFilter('q', '');
	
	// Create filter dependency array for useEffect
	const filterDependencies = useMemo(() => {
		return { searchQuery };
	}, [searchQuery]);

	const [reviews, setReviews] = useState<Review[]>([]);

	useEffect(() => {
		const fetchReviewItems = async () => {
			try {
				// Build serialized search from FilterContext
				const search = serializeSearch && serializeSearch();
				
				const response = await getReviewPosts(search);

				setReviews(response);
				
			} catch (err) {
				console.error(err);
			}
		};

		fetchReviewItems();
	}, [filterDependencies]);

	return (
		<div className="min-h-screen bg-gray-50/30">
			<div className="max-w-5xl mx-auto px-4 py-8">
				<div className="space-y-6">
					{reviews.length === 0 ? (
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
