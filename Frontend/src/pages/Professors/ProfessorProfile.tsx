import { useState } from "react";
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


export function ProfessorProfilePage(
) {
	const navigate = useNavigate();
	const {professorName} = useParams();
	const [reviews, setReviews] = useState<Review[]>([]);

  const [sortBy, setSortBy] = useState("recent");

  const professorReviews = reviews.filter((r) => r.professorName === professorName);
  
  // Calculate average rating
  const avgRating = professorReviews.length
    ? professorReviews.reduce((sum, r) => sum + r.overallRating, 0) / professorReviews.length
    : 0;

  // Get faculty from first review
  const faculty = professorReviews[0]?.faculty || "Unknown Faculty";

  // Get initials for avatar
  const initials = (professorName ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Sort reviews
  const sortedReviews = [...professorReviews].sort((a, b) => {
    if (sortBy === "recent") {
      return 0; // Keep original order (assuming most recent first)
    } else if (sortBy === "highest") {
      return b.overallRating - a.overallRating;
    } else {
      return a.overallRating - b.overallRating;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("")}
          className="mb-6 -ml-2 hover:bg-[#4FCBE9]/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        {/* Professor Header */}
        <Card className="p-8 mb-8 shadow-lg border-gray-100 bg-gradient-to-r from-white to-[#4FCBE9]/5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-[#16519F] to-[#4FCBE9] text-white text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            
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
                <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                  <span className="text-2xl text-[#4FCBE9]">{professorReviews.length}</span>
                  <span className="text-sm text-gray-600 ml-1">
                    {professorReviews.length === 1 ? "Review" : "Reviews"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#16519F]">All Reviews</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 rounded-xl shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Most Recent
                </div>
              </SelectItem>
              <SelectItem value="highest">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Highest Rated
                </div>
              </SelectItem>
              <SelectItem value="lowest">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 rotate-180" />
                  Lowest Rated
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
                onComment={() => {}}
                showDetailedRatings={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
