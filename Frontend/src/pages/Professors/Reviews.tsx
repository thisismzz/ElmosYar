import { useEffect, useState } from "react";
import { Input } from "../../components/UILib";
import { ReviewCard } from "../../components/Reviews/ReviewCard";
import { Review, ReviewPostSearchProps } from "../../types/review_posts";
import { Search, TrendingUp } from "lucide-react";
import { Card } from "../../components/UILib";
import { useFilters } from "../../contexts/FilterContext";
import { useNavigate } from "react-router-dom";
import { makeSearchQueryFromSearchParameters, PostSearchParameters, postService } from '../../services/PostService';


export const getReviewPosts = async (search_parameters?: PostSearchParameters<ReviewPostSearchProps>): Promise<Review[]> => {
			const query_parameters = search_parameters
				? (() => {
					  const filtersExpr = makeSearchQueryFromSearchParameters(search_parameters);
	
					  const serializeFilters = (obj: Record<string, any>) => {
						  const out: Record<string, any> = {};
						  for (const k in obj) {
							  const v = obj[k];
							  if (v instanceof RegExp) out[k] = v.source;
							  else out[k] = v;
						  }
						  return out;
					  };
	
					  return JSON.stringify(serializeFilters(filtersExpr));
				  })()
				: undefined;
	
			const review_posts = await postService.getPosts({
				category: "professor-review",
				search: query_parameters,
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

	const [searchQuery, setSearchQuery] = useState("");
	const [reviews, setReviews] = useState<Review[]>([]);


	const filteredReviews = reviews.filter((review) => {
		const query = searchQuery.toLowerCase();
		return (
			review.professorName.toLowerCase().includes(query) ||
			review.faculty.toLowerCase().includes(query) ||
			review.courseName.toLowerCase().includes(query)
		);
	});

	


	useEffect(() => {
			const fetchReviewItems = async () => {
				try {
					// setLoading(true);
					
					const nameFilter = searchQuery;
					
					const response = await getReviewPosts({
						filters: {
							professorName: searchQuery,
						},
						search_bar: "",
					});
	
					setReviews(response);
					
				} catch (err) {
					// setError('خطا در دریافت اطلاعات غذاها');
					console.error(err);
				} finally {
					// setLoading(false);
				}
			};
	
			fetchReviewItems();
		}, [searchQuery]);

	return (
		<div className="min-h-screen bg-gray-50/30">
			<div className="max-w-5xl mx-auto px-4 py-8">
				<div className="space-y-6">
					{filteredReviews.length === 0 ? (
						<Card className="p-12 text-center">
							<p className="text-gray-500">...</p>
						</Card>
					) : (
						filteredReviews.map((review) => (
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
