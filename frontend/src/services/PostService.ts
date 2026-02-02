// src/services/postService.ts
import api from "./authService";
import { type Post, BackendPost, PaginationInfo } from "../types/discussion_posts";
import type { Comment } from "../types/discussion_comments";
export interface GetPostsParams {
	page?: number;
	per_page?: number;
	category?: string;
	username?: string;
	search?: string | Record<string, any>;
}

export interface GetPostsResponse {
	success: boolean;
	posts: Post[];
	pagination: PaginationInfo;
}



class UltimatePostService {
	async getPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
		try {
			console.log("📡 در حال دریافت پست‌ها از API...", params);

			const queryParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value === undefined || value === null) return;
				queryParams.append(key, value.toString());
			});

			const response = await api.get(`/posts/?${queryParams}`);
			console.log("✅ اتصال به بک‌اند موفق!", response.data);

			const backendPosts = this.extractPostsFromResponse(response.data);
			const formattedPosts = backendPosts.map((backendPost: BackendPost) => this.mapBackendPostToFrontend(backendPost));

			return {
				success: true,
				posts: formattedPosts,
				pagination:
					response.data.pagination || {
						page: params.page || 1,
						per_page: params.per_page || 10,
						total: formattedPosts.length,
						total_pages: 1,
					},
			};
		} catch (error: any) {
			console.error("💥 خطا در دریافت پست‌ها:", {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data,
			});
			throw error;
		}
	}

	async fetchPosts(): Promise<Post[]> {
		const response = await this.getPosts();
		return response.posts;
	}

	async likePost(postId: number): Promise<Post> {
		try {
			console.log(`👍 در حال لایک پست ${postId}...`);
			const response = await api.post(`/posts/${postId}/like/`);
			return this.mapBackendPostToFrontend(response.data.post || response.data);
		} catch (error: any) {
			console.error("❌ خطا در لایک:", error);
			throw error;
		}
	}

	async dislikePost(postId: number): Promise<Post> {
		try {
			console.log(`👎 در حال دیسلایک پست ${postId}...`);
			const response = await api.post(`/posts/${postId}/dislike/`);
			return this.mapBackendPostToFrontend(response.data.post || response.data);
		} catch (error: any) {
			console.error("❌ خطا در دیسلایک:", error);
			throw error;
		}
	}

	async removeReaction(postId: number): Promise<Post> {
		try {
			const response = await api.post(`/posts/${postId}/remove_reaction/`);
			return this.mapBackendPostToFrontend(response.data.post || response.data);
		} catch (error: any) {
			console.error("❌ خطا در حذف ری‌اکشن:", error);
			throw error;
		}
	}

	async createPost(postData: { category: string; media?: File[]; attributes?: any }): Promise<Post> {
		try {
			console.log("📡 در حال ایجاد پست جدید...", postData);
			const requestBody: any = { category: postData.category };
			if (postData.attributes) requestBody.attributes = postData.attributes;

			const response = await api.post("/posts/", requestBody, {
				headers: { "Content-Type": "application/json" },
			});

			return this.mapBackendPostToFrontend(response.data.post || response.data);
		} catch (error: any) {
			console.error("❌ خطا در ایجاد پست:", error);
			throw error;
		}
	}

	async getPostById(postId: number): Promise<Post> {
		try {
			const response = await api.get(`/posts/${postId}/`);
			// depending on backend this might be {post: {...}} or directly the post
			return this.mapBackendPostToFrontend(response.data.post || response.data);
		} catch (error: any) {
			console.error("❌ خطا در دریافت پست:", error);
			throw error;
		}
	}

	private isAnonymousComment(raw: any): boolean {
		// explicit flags
		// if (raw?.is_anonymous === true) return true;
		// if (raw?.anonymous === true) return true;

		// // missing author/user -> treat as anonymous
		// const hasAuthor = Boolean(raw?.author || raw?.author_info || raw?.user);
		// if (!hasAuthor) return true;

		// // sometimes author exists but username is removed
		// const username = raw?.author?.username || raw?.author_info?.username || raw?.user?.username;
		// if (!username) return true;

		return false;
	}

	private mapBackendCommentToFrontend(raw: any): Comment { //!comments will have no replies
		const isAnonymous = this.isAnonymousComment(raw);
		const author = raw?.user_info;
		const username = isAnonymous ? undefined : (author?.username || raw?.user?.username || "user");
		const name = isAnonymous ? "ناشناس" : (author?.first_name + author?.last_name);
		const avatar = isAnonymous ? undefined : (author?.profile_picture || author?.avatar || "");

		return {
			id: raw.id,
			user: {
				id: author?.id || raw?.user?.id || 1,
				name,
				avatar,
				username,
			},
			content: raw.content || raw.text || "",
			timestamp: raw.created_at || raw.timestamp || new Date().toISOString(),

			likes: raw.likes_count ?? raw.likes ?? 0,
			dislikes: raw.dislikes_count ?? raw.dislikes ?? 0,

			isLiked: raw.is_liked ?? raw.liked ?? false,
			isDisliked: raw.is_disliked ?? raw.disliked ?? false,

			isAnonymous: isAnonymous,


            parent: raw.parent,
            replies: [], //!
		};
	}

	async getComments(
		postId: number,
		params: GetPostsParams = {}
	): Promise<{ comments: Comment[]; pagination: PaginationInfo }> {
		try {
			const queryParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) queryParams.append(key, value.toString());
			});

			const response = await api.get(`/posts/${postId}/?${queryParams}`);

			// tolerate shapes: array | {comments} | {results}
			const rawComments = response.data.post.comments

			const formattedComments: Comment[] = rawComments.map((c: any) => this.mapBackendCommentToFrontend(c));
			return {
				comments: formattedComments,
				pagination:
					response.data.pagination || {
						page: params.page || 1,
						per_page: params.per_page || 10,
						total: formattedComments.length,
						total_pages: 1,
					},
			};
		} catch (error: any) {
			console.error("❌ خطا در دریافت نظرات:", error);
			throw error;
		}
	}

	async createComment(postId: number, content: string, parentCommentId?: string): Promise<Comment> {
		try {
			const response = await api.post(`/posts/${postId}/comment/`, { content: content, parent: parentCommentId });
			const commentData = response.data.comment || response.data;

			return this.mapBackendCommentToFrontend(commentData);
		} catch (error: any) {
			console.error("❌ خطا در ایجاد نظر:", error);
			throw error;
		}
	}

	private extractPostsFromResponse(responseData: any): any[] {
		if (responseData.posts) return responseData.posts;
		if (Array.isArray(responseData)) return responseData;
		if (responseData.results) return responseData.results;
		return [];
	}

	mapBackendPostToFrontend = (backendPost: BackendPost): Post => {
		const tagsString = backendPost.attributes?.tags || "";
		const tagsArray = tagsString ? tagsString.split(",").filter((tag: string) => tag.trim()) : [];

		const authorInfo = backendPost.author_info || {
			id: 0,
			username: "unknown",
			first_name: "",
			last_name: "",
			profile_picture: "",
		};

		return {
			id: backendPost.id,
			user: {
				id: authorInfo.id,
				name: `${authorInfo.first_name} ${authorInfo.last_name}`.trim() || authorInfo.username,
				avatar: authorInfo.profile_picture || "/default-avatar.png",
				username: authorInfo.username,
			},
			content: backendPost.attributes?.body || "",
			timestamp: backendPost.created_at,
			likes: backendPost.likes_count || 0,
			dislikes: backendPost.dislikes_count || 0,
			comments: backendPost.comments_count || 0,
			isLiked: backendPost.user_reaction === "like",
			isDisliked: backendPost.user_reaction === "dislike",
			category: backendPost.category,
			media: backendPost.media || [],
			attributes: backendPost.attributes || {},
			tags: tagsArray,
		};
	};
}

export const postService = new UltimatePostService();

export const fetchPosts = () => postService.fetchPosts();
export const likePost = (postId: number) => postService.likePost(postId);
export const dislikePost = (postId: number) => postService.dislikePost(postId);
export const createPost = (category: string, attributes?: any) =>
	postService.createPost({
		category,
		attributes,
	});
export const getPostById = (postId: number) => postService.getPostById(postId);
export const getComments = (postId: number, params?: GetPostsParams) => postService.getComments(postId, params);
export const createComment = (postId: number, content: string) => postService.createComment(postId, content);

export default UltimatePostService;
