// src/pages/Discussion/PostCommentsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Comments from "../../components/Discussion/Comments/DiscussionComments";
import { getCommentsForPost, getPostCard } from "../../services/commentService";
import type { Comment } from "../../types/discussion_comments";
import type { Post } from "../../types/discussion_posts";
import { ArrowLeft } from "lucide-react";
import { countReplyComments } from "../../utils/helpers";

export default function PostCommentsPage() {
	const { postId } = useParams();
	const navigate = useNavigate();

	const numericPostId = Number(postId);

	const [post, setPost] = useState<Post | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const run = async () => {
			if (!numericPostId || Number.isNaN(numericPostId)) return;

			setLoading(true);
			try {
				// const [p, cs] = await Promise.all([getPostCard(numericPostId), getCommentsForPost(numericPostId)]);
                const p = await getPostCard(numericPostId)
                const cs = await getCommentsForPost(numericPostId);
                console.log("comments: (PostCommentsPage)", cs)
				setPost(p);
				setComments(cs);
			} finally {
				setLoading(false);
			}
		};

		run();
	}, [numericPostId]);

	if (!numericPostId || Number.isNaN(numericPostId)) {
		return <div className="p-6 text-center text-gray-500">شناسه پست نامعتبر است.</div>;
	}

	return (
		<div className="min-h-screen bg-[#1f2937]">
			<div className="max-w-5xl mx-auto py-6">
				<button
					onClick={() => navigate(-1)}
					className="mb-4 inline-flex items-center gap-2 text-[#16519F] hover:bg-[#4FCBE9]/10 px-3 py-2 rounded-xl"
				>
					<ArrowLeft className="w-4 h-4" />
					بازگشت
				</button>

				{loading ? (
					<div className="text-center text-gray-500 py-10">در حال بارگذاری...</div>
				) : (
					<Comments
						post={
							post
								? {
										id: post.id,
										content: post.content,
										timestamp: post.timestamp,
										user: { name: post.user.name, username: post.user.username, avatar: post.user.avatar, id: post.user.id },
										likes: post.likes,
										dislikes: post.dislikes,
										comments: post.comments - countReplyComments(comments),
                                        attributes: post.attributes,
                                        isLiked: post.isLiked,
                                        isDisliked: post.isDisliked
								  }
								: undefined
						}
						postId={numericPostId}
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
