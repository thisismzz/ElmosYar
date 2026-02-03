import { Card, Button, Badge } from "../UILib";
import { StarRating } from "./StarRating";
import { ThumbsUp, ThumbsDown, MessageCircle, User } from "lucide-react";
import { Review } from "../../types/review_posts";
import { PostActions } from "../Discussion/Posts/DiscussionPostFeed";
import { dislikePost, likePost } from "../../services/PostService";
import { useEffect, useState } from "react";

interface ReviewCardProps {
    review: Review;
    onLike?: (id: number) => void;
    onDislike?: (id: number) => void;
    onOpenComments?: (id: number) => void;
    onOpenProfessor?: (professorName: string) => void;
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
    const [reviewState, setReviewState] = useState(review);

    const ratingLabels = [
        { key: "teaching", label: "کیفیت تدریس" },
        { key: "grading", label: "نمره دهی عادلانه" },
        { key: "clarity", label: "شفافیت جزوه" },
        { key: "helpfulness", label: "جواب دادن به سوالات" },
        { key: "satisfaction", label: "نظم و ثبات" },
    ];

    const handleLike = async (postId: number) => {
        const r = await likePost(postId);
        setReviewState({
            ...reviewState,
            isLiked: r.isLiked,
            isDisliked: r.isDisliked,
            likes: r.likes,
            dislikes: r.dislikes,
        });
    };

    const handleDislike = async (postId: number) => {
        const r = await dislikePost(postId);
        setReviewState({
            ...reviewState,
            isLiked: r.isLiked,
            isDisliked: r.isDisliked,
            likes: r.likes,
            dislikes: r.dislikes,
        });
    };

    return (
        <Card
            onClick={() => onOpenComments?.(review.id)}
            className="
                overflow-hidden cursor-pointer 
                bg-white dark:bg-gray-800
                border border-gray-100 dark:border-gray-700
                transition-all duration-300
                hover:shadow-[0_15px_35px_rgba(102,126,234,0.12),0_5px_15px_rgba(0,0,0,0.08)]
                dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)]
                hover:-translate-y-1
                hover:scale-[1.005]
                rounded-[20px]
                animate-fadeInUp
            "
            style={{ animationDelay: `${review.id % 5 * 0.1}s` }}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 
                bg-gradient-to-r from-white to-[#4FCBE9]/5 
                dark:from-gray-800 dark:to-[#4FCBE9]/10">
                <div className="flex items-start justify-between gap-4 flex-row-reverse">
                    {/* Professor Identity */}
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
                                group-hover:shadow-lg group-hover:scale-105
                                transition-all duration-300
                            "
                        >
                            <User className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl text-[#16519F] dark:text-[#4FCBE9] mb-2 text-right group-hover:underline">
                                {review.professorName}
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-2 justify-end">
                                <Badge className="bg-[#16519F] text-white hover:bg-[#16519F]/90 
                                    dark:bg-[#4FCBE9] dark:hover:bg-[#4FCBE9]/90">
                                    {review.faculty}
                                </Badge>
                                <Badge variant="outline" className="border-[#4FCBE9] text-[#4FCBE9]
                                    dark:border-[#16519F] dark:text-[#16519F]">
                                    {review.courseName}
                                </Badge>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600
                                    dark:bg-gray-700 dark:text-gray-300">
                                    {review.semester}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Overall Rating */}
                    <div className="flex flex-col items-end">
                        <div className="bg-white dark:bg-gray-700 rounded-xl px-3 py-2 
                            shadow-sm border border-gray-100 dark:border-gray-600">
                            <StarRating 
                                rating={review.overallRating} 
                                readonly 
                                size="sm" 
                                // darkMode={false}
                            />
                            <span className="block text-center text-sm text-[#16519F] 
                                dark:text-[#4FCBE9] mt-1">
                                {review.overallRating.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            {review.comment ? (
                <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed 
                        whitespace-pre-line line-clamp-6">
                        {review.comment}
                    </p>
                </div>
            ) : null}

            {/* Detailed Ratings */}
            {showDetailedRatings && review.ratings ? (
                <div className="px-6 pb-6">
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
                            {ratingLabels.map((rating) => (
                                <Card
                                    key={rating.key}
                                    className="flex relative h-16 flex-col justify-begin rounded-xl 
                                        border border-neutral-200 dark:border-gray-700 
                                        bg-white dark:bg-gray-800 pt-2 gap-0 shadow-sm"
                                >
                                    <span className="text-xs font-medium text-neutral-700 
                                        dark:text-gray-300 text-center">
                                        {rating.label}
                                    </span>
                                    <div className="absolute bottom-2 left-1/2 right-1/2 flex justify-center">
                                        <StarRating
                                            rating={review.ratings?.[rating.key as keyof typeof review.ratings] || 0}
                                            readonly
                                            size="sm"
                                            // darkMode={false}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Actions */}
            <div className="flex gap-2 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 
                border-t border-gray-100 dark:border-gray-700 flex-row-reverse">
                <PostActions
                    postId={reviewState.id}
                    likes={reviewState.likes}
                    dislikes={reviewState.dislikes}
                    comments={reviewState.comments}
                    isLiked={reviewState.isLiked ?? false}
                    isDisliked={reviewState.isDisliked ?? false}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    onComment={() => { }}
                    onOpenComments={() => { }}
                />
            </div>
        </Card>
    );
}