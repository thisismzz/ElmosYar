import api from "./authService";
import { Comment as FrontendComment } from "../types/discussion_comments";
import { Post } from "../types/discussion_posts";


export const fetchPostWithComments = async (postId: number) => {
	const response = await api.get(`/posts/${postId}/`);
	return response.data; 
};


export const mapBackendCommentsToFrontend = (
	backendComments: any[]
): FrontendComment[] => {
	console.log("backend comments: ", backendComments)
	return backendComments.map((c) => ({
		id: c.id,
		name: c.user?.username || "Unknown",               
		time: new Date(c.created_at).toISOString(),        
		text: c.content,
		likes: c.likes_count,           
		dislikes: c.dislikes_count,                                      
		is_liked: c.is_liked,
		is_disliked: c.is_disliked,
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
		attributes: backendPost.attributes,
		timestamp: backendPost.created_at,
		likes: backendPost.likes_count,
		dislikes: backendPost.dislikes_count,
		comments: backendPost.comments_count,
	});
};



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


export const likeComment = async (commentId: number) => {
	try {
		const response = await api.post(`/comments/${commentId}/like/`);

		return response.data;
	} catch (error: any) {
		throw error;
	}
}


export const dislikeComment = async (commentId: number) => {
	try {
		const response = await api.post(`/comments/${commentId}/dislike/`);

		return response.data;
	} catch (error: any) {
		throw error;
	}
}



