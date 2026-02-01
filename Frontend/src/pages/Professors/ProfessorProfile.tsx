import { useMemo, useState } from "react";
import { Button } from "../../components/UILib"; 
import { Card } from "../../components/UILib"; 
import { Avatar, AvatarFallback } from "../../components/UILib"; 
import { Badge } from "../../components/UILib"; 
import { ReviewCard } from "../../components/Reviews/ReviewCard";
import { Review } from "../../types/review_posts";
import { StarRating } from "../../components/Reviews/StarRating";
import { ArrowLeft, TrendingUp, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select";

import { useNavigate, useParams } from "react-router-dom";
import { usePosts } from "../../hooks/usePosts";
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

export function ProfessorProfilePage(
) {
	const navigate = useNavigate();
	const {professorName} = useParams();
	const { posts } = usePosts();
	
	const reviews = useMemo(() => 
		posts.map(mapPostToReview),
		[posts]
	);

  const [sortBy, setSortBy] = useState("جدید");

  const professorReviews = reviews.filter((r) => r.professorName === professorName);
  
  // Calculate average rating
  const avgRating = professorReviews.length
    ? professorReviews.reduce((sum, r) => sum + r.overallRating, 0) / professorReviews.length
    : 0;

  // Get faculty from first review
  const faculty = professorReviews[0]?.faculty || "Unknown Faculty"; //TODO: make multiple faculties

  // Get initials for avatar
  const initials = (professorName ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Sort reviews
  // inside ProfessorProfilePage: sorting
const sortedReviews = [...professorReviews].sort((a, b) => {
  if (sortBy === "جدید") return 0;
  if (sortBy === "بالاترین") return b.overallRating - a.overallRating;
  return a.overallRating - b.overallRating; // "پایین ترین"
});


  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/topic/professor-review/")}
          className="mb-6 -ml-2 hover:bg-[#4FCBE9]/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          بازگشت
        </Button>

        {/* Professor Header */}
        <Card className="p-8 mb-8 shadow-lg border-gray-100 bg-gradient-to-r from-white to-[#4FCBE9]/5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            
            
            <div className="flex-1">
              <h1 className="text-[#16519F] mb-3">{professorName}</h1>
              <Badge className="bg-[#16519F] text-white hover:bg-[#16519F]/90 mb-4">
                {faculty}
              </Badge>
              
              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-md">
                  <StarRating rating={Math.round(avgRating)} readonly size="lg" />
                  <span className="text-2xl text-[#16519F]">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-md flex flex-row-reverse">
                  <span className="text-2xl text-[#4FCBE9]">{professorReviews.length}</span>
                  <span className="text-sm text-gray-600 mr-1 mt-1">
                    امتیاز
                  </span>
                </div>
              </div>
            </div>
			<Avatar className="w-28 h-28 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-[#16519F] to-[#4FCBE9] text-white text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
		  
        </Card>

        {/* Sort Controls */}
        <div className="flex items-center gap-5 mb-6 flex-row-reverse">
          <h2 className="text-[#16519F]">همه نظر ها</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 rounded-xl shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="جدید">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  جدید ترین
                </div>
              </SelectItem>
              <SelectItem value="بالاترین">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  بیشترین امتیاز
                </div>
              </SelectItem>
              <SelectItem value="پایین ترین">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 rotate-180" />
                  کمترین امتیاز
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {sortedReviews.length === 0 ? (
            <Card className="p-12 text-center shadow-md">
              <p className="text-gray-500">No reviews yet for this professor.</p>
            </Card>
          ) : (
            sortedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onLike={() => {}}
                // onComment={() => {}}
                showDetailedRatings={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
