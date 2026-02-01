// src/components/Reviews/ReviewCard.tsx
import { Card, Button, Badge } from "../UILib";
import { StarRating } from "./StarRating";
import { ThumbsUp, ThumbsDown, MessageCircle, User } from "lucide-react";
import { Review } from "../../types/review_posts";

interface ReviewCardProps {
	review: Review;
	onLike?: (id: number) => void;
	onDislike?: (id: number) => void;
	onOpenComments?: (id: number) => void;     // clicking post -> comments
	onOpenProfessor?: (professorName: string) => void; // clicking identity -> profile
	showDetailedRatings?: boolean;
}

export function ReviewCard({
    review,
	onLike,
	onDislike,
	onOpenComments,
	onOpenProfessor,
	showDetailedRatings = false,
}: ReviewCardProps) {
	const ratingLabels = [
		{ key: "teaching", label: "کیفیت تدریس" },
		{ key: "grading", label: "نمره دهی عادلانه" },
		{ key: "clarity", label: "شفافیت جزوه" },
		{ key: "helpfulness", label: "جواب دادن به سوالات" },
		{ key: "satisfaction", label: "نظم و ثبات" },
	];

	return (
		<Card
			onClick={() => onOpenComments?.(review.id)}
			className="
        overflow-hidden cursor-pointer bg-white
        border border-gray-100
        transition-all
        hover:shadow-[0_15px_35px_rgba(102,126,234,0.12),0_5px_15px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
        hover:scale-[1.005]
        rounded-[20px]
      "
		>
			{/* Header */}
			<div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-[#4FCBE9]/5">
				<div className="flex items-start justify-between gap-4 flex-row-reverse">
					{/* Professor Identity (only this highlights + navigates to profile) */}
					<div
						className="flex items-start gap-4 flex-row-reverse group"
						onClick={(e) => {
							e.stopPropagation();
							onOpenProfessor?.(review.professorName);
						}}
						role="button"
						tabIndex={0}
					>
						<div
							className="
                w-12 h-12 rounded-full
                bg-gradient-to-br from-[#16519F] to-[#4FCBE9]
                flex items-center justify-center text-white shadow-md
                group-hover:shadow-lg
                group-hover:scale-105
                transition-all
              "
						>
							<User className="w-6 h-6" />
						</div>

						<div className="flex-1">
							<h3 className="text-xl text-[#16519F] mb-2 text-right group-hover:underline">
								{review.professorName}
							</h3>

							<div className="flex flex-wrap gap-2 mb-2 justify-end">
								<Badge className="bg-[#16519F] text-white hover:bg-[#16519F]/90">{review.faculty}</Badge>
								<Badge variant="outline" className="border-[#4FCBE9] text-[#4FCBE9]">
									{review.courseName}
								</Badge>
								<Badge variant="secondary" className="bg-gray-100 text-gray-600">
									{review.semester}
								</Badge>
							</div>
						</div>
					</div>

					{/* Overall */}
					<div className="flex flex-col items-end">
						<div className="bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
							<StarRating rating={review.overallRating} readonly size="sm" />
							<span className="block text-center text-sm text-[#16519F] mt-1">
								{review.overallRating.toFixed(1)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Body */}
			{review.comment ? (
				<div className="p-6">
					<p className="text-gray-700 leading-relaxed whitespace-pre-line line-clamp-6">{review.comment}</p>
				</div>
			) : null}

			{/* Detailed Ratings */}
			{showDetailedRatings && review.ratings ? (
				<div className="px-6 pb-6">
					<div className="border-t border-gray-100 pt-4">
						<h4 className="text-sm text-gray-600 mb-4 text-right">جزئیات امتیاز دهی</h4>
						<div className="grid grid-cols-1 md:grid-cols-5 gap-3">
							{ratingLabels.map((rating) => (
								<Card
									key={rating.key}
									className="flex h-16 flex-col justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm"
								>
									<span className="text-xs font-medium text-neutral-700 text-center">{rating.label}</span>
									<div className="flex justify-center">
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
				</div>
			) : null}

			{/* Actions */}
			<div className="flex gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex-row-reverse">
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onLike?.(review.id);
					}}
					className={`rounded-full ${
						review.isLiked
							? "text-[#F07E74] bg-[#F07E74]/10"
							: "text-gray-600 hover:text-[#F07E74] hover:bg-[#F07E74]/10"
					}`}
				>
					<ThumbsUp className={`w-4 h-4 mr-2 ${review.isLiked ? "fill-[#F07E74]" : ""}`} />
					{review.likes}
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onDislike?.(review.id);
					}}
					className={`rounded-full ${
						(review as any).isDisliked
							? "text-gray-800 bg-gray-200"
							: "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
					}`}
				>
					<ThumbsDown className={`w-4 h-4 mr-2 ${(review as any).isDisliked ? "fill-current" : ""}`} />
					{(review as any).dislikes ?? 0}
				</Button>

				{/* no hover; clicking card opens comments */}
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onOpenComments?.(review.id);
					}}
					className="rounded-full text-gray-600 hover:bg-transparent hover:text-gray-600"
				>
					<MessageCircle className="w-4 h-4 mr-2" />
					{review.comments}
				</Button>
			</div>
		</Card>
	);
}
