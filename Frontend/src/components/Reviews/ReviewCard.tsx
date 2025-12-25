import { Card } from "../UILib";
import { Button } from "../UILib";
import { Badge } from "../UILib";
import { StarRating } from "./StarRating";
import { ThumbsUp, MessageCircle, User } from "lucide-react";
import { Review } from "../../types/review_posts";

interface ReviewCardProps {
	review: Review;
	onLike?: (id: string) => void;
	onComment?: (id: string) => void;
	onClick?: (professorName: string) => void;
	showDetailedRatings?: boolean;
}

export function ReviewCard({ review, onLike, onComment, onClick, showDetailedRatings = false }: ReviewCardProps) {
	const ratingLabels = [
		{ key: "teaching", label: "کیفیت تدریس" },
		{ key: "grading", label: "نمره دهی عادلانه" },
		{ key: "clarity", label: "شفافیت جزوه" },
		{ key: "helpfulness", label: "جواب دادن به سوالات" },
		{ key: "satisfaction", label: "نظم و ثبات" },
	];

	return (
		<Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 bg-white">
			<div onClick={() => onClick?.(review.professorName)}>
				{/* Header Section */}
				<div className="bg-gradient-to-r from-[#16519F]/5 to-[#4FCBE9]/5 p-6 border-b border-gray-100">
					<div className="flex items-start justify-between">


						<div className="flex flex-col items-end">
							<div className="bg-white rounded-lg px-3 py-2 shadow-sm">
								<StarRating rating={review.overallRating} readonly size="sm" />
								<span className="block text-center text-sm text-[#16519F] mt-1">{review.overallRating.toFixed(1)}</span>
							</div>
						</div>


						<div className="flex items-start gap-4 flex-row-reverse">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16519F] to-[#4FCBE9] flex items-center justify-center text-white shadow-md">
								<User className="w-6 h-6" />
							</div>
							<div className="flex-1">
								<h3 className="text-xl text-[#16519F] mb-2 text-right">{review.professorName}</h3>
								<div className="flex flex-wrap gap-2 mb-2">
									<Badge className="bg-[#16519F] text-white hover:bg-[#16519F]/90">
										{review.faculty}
									</Badge>
									<Badge variant="outline" className="border-[#4FCBE9] text-[#4FCBE9]">
										{review.courseName}
									</Badge>
									<Badge variant="secondary" className="bg-gray-100 text-gray-600">
										{review.semester}
									</Badge>
								</div>
							</div>
						</div>





					</div>
				</div>


				{/* Body Section */}
				{review.comment && (
					<div className="p-6">
						<p className="text-gray-700 leading-relaxed">{review.comment}</p>
					</div>
				)}
									<hr></hr>

				
				{/* Detailed Ratings Section */}
				{showDetailedRatings && review.ratings && (
					<div className="p-6 bg-gray-50/50">
						<h4 className="text-sm text-gray-600 mb-4">جزئیات امتیاز دهی</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{ratingLabels.map((rating) => (
								<Card key={rating.key} className="p-3 bg-white shadow-sm border-gray-100">
									<div className="flex items-center justify-between flex-row-reverse">
										<span className="text-sm text-gray-700">{rating.label}</span>
										<StarRating
											rating={review.ratings?.[rating.key as keyof typeof review.ratings] || 0}
											readonly
											size="sm"
										/>
									</div>
								</Card>
							))}
						</div>
					</div>
				)}


			</div>

			{/* Actions Section */}
			<div className="flex gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex-row-reverse">
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onLike?.(review.id);
					}}
					className={`rounded-full ${review.isLiked ? "text-[#F07E74] bg-[#F07E74]/10" : "text-gray-600 hover:text-[#F07E74] hover:bg-[#F07E74]/10"}`}
				>
					<ThumbsUp className={`w-4 h-4 mr-2 ${review.isLiked ? 'fill-[#F07E74]' : ''}`} />
					{review.likes}
				</Button>
				{/* <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onComment?.(review.id);
          }}
          className="rounded-full text-gray-600 hover:text-[#4FCBE9] hover:bg-[#4FCBE9]/10"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {review.comments}
        </Button> */}
			</div>
		</Card>
	);
}
