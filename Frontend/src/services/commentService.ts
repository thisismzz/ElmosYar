import api from "./authService";
import { Comment as FrontendComment } from "../types/comments";
import { Post } from "../types/posts";
/**
 * Get full post details including comments from backend
 */
export const fetchPostWithComments = async (postId: number) => {
	const response = await api.get(`/posts/${postId}/`);
	return response.data; // Django returns: { success, post: { ... } }
};


/**
 * Convert backend comment objects → frontend <Comment[]> interface
 *
 * Backend 
 *
 * Frontend needs:
 * {
 *   id: number;
 *   name: string;
 *   time: string;
 *   text: string;
 *   likes: number;
 *   dislikes?: number;
 * }
 */
export const mapBackendCommentsToFrontend = (
	backendComments: any[]
): FrontendComment[] => {
	return backendComments.map((c) => ({
		id: c.id,
		name: c.user?.username || "Unknown",               // backend: user.username
		time: new Date(c.created_at).toISOString(),        // normalized timestamp
		text: c.content,
		likes: c.likes ? c.likes.length : 0,               // backend returns array of users
		dislikes: 0,                                       // backend does NOT support comment dislikes
	}));
};

export const mapBackendPostToFrontendPostCard = (
	backendPost: any
): Post => {
	return ({
		id: backendPost.id,
		user: {
			id: backendPost.author_info.id,
			name: backendPost.author_info.first_name,
			avatar: backendPost.author_info.profile_picture,
			username: backendPost.author_info.username,
		},
		content: backendPost.content,
		timestamp: backendPost.created_at,
		likes: backendPost.likes_count,
		dislikes: backendPost.dislikes_count,
		comments: backendPost.comments_count,// backend does NOT support comment dislikes
	});
};


/**
 * Get Post + convert comments → frontend format
 */
export const getCommentsForPost = async (
	postId: number
): Promise<FrontendComment[]> => {
	const data = await fetchPostWithComments(postId);

	const backendComments = data?.post?.comments || [];
	return mapBackendCommentsToFrontend(backendComments);
};
export const getPostCard = async (
	postId: number
): Promise<Post> => {
	const data = await fetchPostWithComments(postId);

	const backendPost = data?.post || undefined;
	return mapBackendPostToFrontendPostCard(backendPost);
};



