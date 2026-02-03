import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Review } from "../../types/review_posts";
import { getPostById } from "../../services/PostService";
import { getCommentsForPost } from "../../services/commentService";
import { ReviewCard } from "../../components/Reviews/ReviewCard";
import Comments from "../../components/Discussion/Comments/DiscussionComments";
import type { Comment } from "../../types/discussion_comments";
import "./ReviewComments.css";

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

export default function ReviewCommentsPage() {
    const { reviewId } = useParams();
    const navigate = useNavigate();
    const numericReviewId = Number(reviewId);

    const [review, setReview] = useState<Review | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            if (!numericReviewId || Number.isNaN(numericReviewId)) return;

            setLoading(true);
            try {
                const [p, cs] = await Promise.all([
                    getPostById(numericReviewId),
                    getCommentsForPost(numericReviewId)
                ]);
                setReview(mapPostToReview(p));
                setComments(cs);
            } catch (error) {
                console.error("Error loading review comments:", error);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [numericReviewId]);

    if (!numericReviewId || Number.isNaN(numericReviewId)) {
        return (
            <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900">
                <div className="max-w-5xl mx-auto py-6 px-4">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                        شناسه نقد نامعتبر است.
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900">
                <div className="max-w-5xl mx-auto py-6 px-4">
                    {/* دکمه بازگشت اسکلت */}
                    <div className="skeleton-back-button">
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-text"></div>
                    </div>

                    {/* اسکلت کارت نقد */}
                    <div className="skeleton-review-card-large">
                        <div className="skeleton-card-header">
                            <div className="skeleton-professor-info">
                                <div className="skeleton-avatar-large"></div>
                                <div className="skeleton-professor-details">
                                    <div className="skeleton-text xlarge"></div>
                                    <div className="skeleton-badges">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="skeleton-badge"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="skeleton-rating">
                                <div className="skeleton-stars-large"></div>
                                <div className="skeleton-rating-text-large"></div>
                            </div>
                        </div>

                        <div className="skeleton-card-body">
                            <div className="skeleton-comment">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="skeleton-text medium"></div>
                                ))}
                            </div>

                            <div className="skeleton-detailed-ratings-large">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="skeleton-rating-item-large">
                                        <div className="skeleton-text small"></div>
                                        <div className="skeleton-mini-stars"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* اسکلت بخش نظرات */}
                    <div className="skeleton-comments-section">
                        <div className="skeleton-comments-header">
                            <div className="skeleton-title"></div>
                            <div className="skeleton-sort"></div>
                        </div>

                        <div className="skeleton-comment-composer">
                            <div className="skeleton-textarea"></div>
                            <div className="skeleton-submit-button"></div>
                        </div>

                        <div className="skeleton-comments-list">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="skeleton-comment-item">
                                    <div className="skeleton-comment-header">
                                        <div className="skeleton-avatar-small"></div>
                                        <div className="skeleton-comment-info">
                                            <div className="skeleton-text small"></div>
                                            <div className="skeleton-text xsmall"></div>
                                        </div>
                                    </div>
                                    <div className="skeleton-comment-content">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="skeleton-text medium"></div>
                                        ))}
                                    </div>
                                    <div className="skeleton-comment-actions">
                                        <div className="skeleton-action"></div>
                                        <div className="skeleton-action"></div>
                                        <div className="skeleton-action"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-5xl mx-auto py-6 px-4">
                {/* دکمه بازگشت */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 inline-flex items-center gap-2 
                        text-[#16519F] dark:text-[#4FCBE9] 
                        hover:bg-[#4FCBE9]/10 dark:hover:bg-[#4FCBE9]/20 
                        px-3 py-2 rounded-xl transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    بازگشت
                </button>

                {/* کارت نقد */}
                {review && (
                    <ReviewCard
                        review={review}
                        key={review.id}
                        onLike={() => { }}
                        onOpenProfessor={() => navigate(`/topic/professor-review/${review.professorName}`)}
                        showDetailedRatings={true}
                        onOpenComments={() => navigate(`/reviews/${review.id}/comments`)}
                    />
                )}

                {/* بخش نظرات */}
                <div className="mt-8">
                    <Comments
                        postId={numericReviewId}
                        comments={comments}
                        setComments={setComments}
                        title="نظرات"
                        showComposer={true}
                    />
                </div>
            </div>
        </div>
    );
}