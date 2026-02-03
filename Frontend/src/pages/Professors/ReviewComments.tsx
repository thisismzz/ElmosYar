// src/pages/Discussion/PostCommentsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Comments from "../../components/Discussion/Comments/DiscussionComments";
// import { getCommentsForPost, getPostCard } from "../../services/commentService";
import type { Comment } from "../../types/discussion_comments";
// import type { Post } from "../../types/discussion_posts";
import { ArrowLeft } from "lucide-react";
import { countReplyComments } from "../../utils/helpers";
import { Review } from "../../types/review_posts";
import { getPostById, likePost } from "../../services/PostService";
import { getCommentsForPost } from "../../services/commentService";
import { ReviewCard } from "../../components/Reviews/ReviewCard";

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
        console.log("review comments page")
        const run = async () => {
            if (!numericReviewId || Number.isNaN(numericReviewId)) return;

            setLoading(true);
            try {
                // const [p, cs] = await Promise.all([getPostCard(numericReviewId), getCommentsForPost(numericReviewId)]);
                const p = await getPostById(numericReviewId)
                const cs = await getCommentsForPost(numericReviewId);
                console.log("comments: (reviewCommentsPage)", cs)
                setReview(mapPostToReview(p));
                setComments(cs);
            } finally {
                setLoading(false);
            }

        };

        run();
    }, [numericReviewId]);

    if (!numericReviewId || Number.isNaN(numericReviewId)) {
        return <div className="p-6 text-center text-gray-500">شناسه پست نامعتبر است.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-5xl mx-auto py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 inline-flex items-center gap-2 text-[#16519F] hover:bg-[#4FCBE9]/10 px-3 py-2 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4" />
                    بازگشت
                </button>


                {loading || (review == null) ? (
                    <div className="text-center text-gray-500 py-10">در حال بارگذاری...</div>
                ) : (
                    <ReviewCard
                        review={review}
                        key={review.id}
                        onLike={() => { likePost(review.id) }}
                        onOpenProfessor={() => navigate(`/topic/professor-review/${review.professorName}`)}
                        showDetailedRatings={true}
                        onOpenComments={() => navigate(`/reviews/${review.id}/comments`)}
                    />
                )}

                {loading ? (
                    <div className="text-center text-gray-500 py-10"></div>
                ) : (
                    <Comments
                        post={
                            undefined
                        }
                        postId={numericReviewId}
                        comments={comments}
                        setComments={setComments}
                        title="نظرات"
                        showComposer={true}
                    />
                )}
            </div>
        </div>
    );
}
