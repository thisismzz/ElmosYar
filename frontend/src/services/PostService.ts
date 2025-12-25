// services/postService.ts
import api from "./authService";
import { type Post, BackendPost, PaginationInfo } from "../types/discussion_posts";

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

export interface Comment {
	id: number;
	user: {
		id: number;
		name: string;
		avatar: string;
		username: string;
	};
	content: string;
	timestamp: string;
	likes: number;
	isLiked: boolean;
}

class UltimatePostService {
  
  async getPosts(params: GetPostsParams = {}): Promise<GetPostsResponse> {
    try {
      console.log('📡 در حال دریافت پست‌ها از API...', params);
      
      const queryParams = new URLSearchParams();

      const normalizeSearchValue = (val: any): string => {
        if (typeof val === 'string') return val;
        const serialize = (obj: any): any => {
          if (obj instanceof RegExp) return obj.source;
          if (Array.isArray(obj)) return obj.map(serialize);
          if (obj && typeof obj === 'object') {
            const out: any = {};
            for (const k in obj) out[k] = serialize(obj[k]);
            return out;
          }
          return obj;
        };
        return JSON.stringify(serialize(val));
      };

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === 'search') {
          const s = normalizeSearchValue(value);
          if (s !== '') queryParams.append(key, s);
          return;
        }

        queryParams.append(key, value.toString());
      });

			const response = await api.get(`/posts/?${queryParams}`);
			console.log('✅ اتصال به بک‌اند موفق!', response.data);

			const backendPosts = this.extractPostsFromResponse(response.data);
			const formattedPosts = backendPosts.map(backendPost =>
				this.mapBackendPostToFrontend(backendPost)
			);

			return {
				success: true,
				posts: formattedPosts,
				pagination: response.data.pagination || {
					page: params.page || 1,
					per_page: params.per_page || 10,
					total: formattedPosts.length,
					total_pages: 1
				}
			};

		} catch (error: any) {
			console.error('💥 خطا در دریافت پست‌ها:', {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data
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
			console.error('❌ خطا در لایک:', error);
			throw error;
		}
	}

	async dislikePost(postId: number): Promise<Post> {
		try {
			console.log(`👎 در حال دیسلایک پست ${postId}...`);
			const response = await api.post(`/posts/${postId}/dislike/`);

			return this.mapBackendPostToFrontend(response.data.post || response.data);
		} catch (error: any) {
			console.error('❌ خطا در دیسلایک:', error);
			throw error;
		}
	}

	async removeReaction(postId: number): Promise<Post> {
		try {
			const response = await api.post(`/posts/${postId}/remove_reaction/`);
			return this.mapBackendPostToFrontend(response.data.post || response.data);
		} catch (error: any) {
			console.error('❌ خطا در حذف ری‌اکشن:', error);
			throw error;
		}
	}

	async createPost(postData: {
		content: string;
		category?: string;
		tags?: string;
		media?: File[];
		attributes?: any;
	})
	// : Promise<Post>
	 {
		try {
			const formData = new FormData();
			formData.append('content', postData.content);

			if (postData.category) formData.append('category', postData.category);
			if (postData.tags) formData.append('tags', postData.tags);
			if (postData.media) {
				postData.media.forEach((file, index) => {
					formData.append(`media_${index}`, file);
				});
			}
			if (postData.attributes) formData.append('attributes', JSON.stringify(postData.attributes));

			const response = await api.post('/posts/', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			// return this.mapBackendPostToFrontend(response.data);
		} catch (error: any) {
			console.error('❌ خطا در ایجاد پست:', error);
			throw error;
		}
	}

	async getPostById(postId: number): Promise<Post> {
		try {
			const response = await api.get(`/posts/${postId}/`);
			return this.mapBackendPostToFrontend(response.data);
		} catch (error: any) {
			console.error('❌ خطا در دریافت پست:', error);
			throw error;
		}
	}

	async getComments(postId: number, params: GetPostsParams = {}): Promise<{ comments: Comment[]; pagination: PaginationInfo }> {
		try {
			const queryParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					queryParams.append(key, value.toString());
				}
			});

			const response = await api.get(`/posts/${postId}/comments/?${queryParams}`);

			const comments = Array.isArray(response.data)
				? response.data
				: response.data.comments || response.data.results || [];

			const formattedComments = comments.map((comment: any) => ({
				id: comment.id,
				user: {
					id: comment.author?.id || comment.user?.id || 1,
					name: comment.author?.first_name || comment.user?.name || "کاربر ناشناس",
					avatar: comment.author?.profile_picture || comment.user?.avatar || "",
					username: comment.author?.username || comment.user?.username || "user"
				},
				content: comment.content || comment.text || "",
				timestamp: comment.created_at || comment.timestamp || new Date().toISOString(),
				likes: comment.likes_count || comment.likes || 0,
				isLiked: comment.is_liked || comment.liked || false
			}));

			return {
				comments: formattedComments,
				pagination: response.data.pagination || {
					page: params.page || 1,
					per_page: params.per_page || 10,
					total: formattedComments.length,
					total_pages: 1
				}
			};
		} catch (error: any) {
			console.error('❌ خطا در دریافت نظرات:', error);
			throw error;
		}
	}

	async createComment(postId: number, content: string): Promise<Comment> {
		try {
			const response = await api.post(`/posts/${postId}/comment/`, { content });

			const commentData = response.data.comment || response.data;
			return {
				id: commentData.id,
				user: {
					id: commentData.author?.id || commentData.user?.id || 1,
					name: commentData.author?.first_name || commentData.user?.name || "کاربر ناشناس",
					avatar: commentData.author?.profile_picture || commentData.user?.avatar || "",
					username: commentData.author?.username || commentData.user?.username || "user"
				},
				content: commentData.content || commentData.text || "",
				timestamp: commentData.created_at || commentData.timestamp || new Date().toISOString(),
				likes: commentData.likes_count || commentData.likes || 0,
				isLiked: commentData.is_liked || commentData.liked || false
			};
		} catch (error: any) {
			console.error('❌ خطا در ایجاد نظر:', error);
			throw error;
		}
	}

	private extractPostsFromResponse(responseData: any): any[] {
		if (responseData.posts) return responseData.posts;
		if (Array.isArray(responseData)) return responseData;
		if (responseData.results) return responseData.results;
		return [];
	}

	mapBackendPostToFrontend = (backendPost: BackendPost): Post => ({
		id: backendPost.id,
		user: {
			id: backendPost.author_info.id,
			name: `${backendPost.author_info.first_name} ${backendPost.author_info.last_name}`.trim() || backendPost.author_info.username,
			avatar: backendPost.author_info.profile_picture || '/default-avatar.png',
			username: backendPost.author_info.username,
		},
		content: backendPost.attributes.body,
		timestamp: backendPost.created_at,
		likes: backendPost.likes_count,
		dislikes: backendPost.dislikes_count,
		comments: backendPost.comments_count,
		isLiked: backendPost.user_reaction === 'like',
		isDisliked: backendPost.user_reaction === 'dislike',
		category: backendPost.category,
		media: backendPost.media,
		tags: backendPost.tags ? backendPost.tags.split(',').map(tag => tag.trim()) : [],
		attributes: backendPost.attributes,
	});
}
/*
* search helpers
*/

type Day = "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

export type SearchValue =
	| string //substring regex
	| number //exact match
	| boolean //exact boolean match
	| null //will be ignored
	| undefined //will bei gnored
	| Date //exact match
	| Day //a day
	| [number, number] //range
	| [Date, Date] //range
	| string[]; //OR regex match

/*
search method describes how to search posts in the backend. 
	in "specified_fields", the backend is given a json with the same keys as what is shown in the 
	frontend posts (e.g. name, mealType, location and etc for food posts.). This method is used for 
	filters. 
	in "any", the backend is given a string which should be present somewhere in the post's content. 
	This is used for the search bar. 
	either of the two fields can be null, which means nothing is specified for that method of search.
*/
export interface PostSearchParameters<T extends Record<string, SearchValue>> {
	filters: T;
	search_bar: string;
}


export function containsRegex(value: string): string {
	const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return `.*${escaped}.*`;
}

function escapeRegex(value: unknown): string {
	if (value === null || value === undefined) return "";

	const str = String(value);

	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toContainsRegex(value: unknown): string {
	const str = String(value ?? ""); // safely convert to string
	return `.*${escapeRegex(str)}.*`;
}


export function makeSearchQuery(
	fields: Record<string, SearchValue>
): Record<string, RegExp> {
	const query: Record<string, any> = {};

	for (const [key, value] of Object.entries(fields)) {
		if (value === "" || value === null || value === undefined) continue;

		if (typeof value === "string") {
			query[key] = toContainsRegex(value);
			continue;
		}

		if (typeof value === "number") {
			query[key] = value;
			continue;
		}

		if (typeof value === "boolean") {
			query[key] = value;
			continue;
		}

		if (value instanceof Date) {
			query[key] = value.toISOString();
			continue;
		}
		//* will be changed to be all regex
		if (Array.isArray(value) && value.length === 2 && typeof value[0] === "number") {
			const [min, max] = value as [number, number];
			query[key] = { $range: [min, max] };
			continue;
		}

		//* also will be changed to regex
		if (
			Array.isArray(value) &&
			value.length === 2 &&
			value[0] instanceof Date &&
			value[1] instanceof Date
		) {
			query[key] = {
				$range: [value[0].toISOString(), value[1].toISOString()]
			};
			continue;
		}

		//* also hould be changed to regex
		if (Array.isArray(value) && typeof value[0] === "string") {
			const patterns = value.map(v => toContainsRegex(v));
			query[key] = { $or: patterns };
			continue;
		}
	}

	return query;
}


export const makeSearchQueryFromSearchParameters = <T extends Record<string, SearchValue>>(search_parameters: PostSearchParameters<T>) => {
	const filter_expressions = makeSearchQuery(search_parameters.filters)
	if (search_parameters.search_bar == "") return filter_expressions;
	const escaped = containsRegex(search_parameters.search_bar)
	const result: Record<string, RegExp> = {};

	for (const key in filter_expressions) {
		const r = filter_expressions[key];
		result[key] = new RegExp(`^(?:${r}|${escaped})$`, r.flags);
	}

	return result;
}



export const postService = new UltimatePostService();

export const fetchPosts = () => postService.fetchPosts();
export const likePost = (postId: number) => postService.likePost(postId);
export const dislikePost = (postId: number) => postService.dislikePost(postId);
export const createPost = (
	content: string,
	category?: string,
	tags?: string,
	media?: File[],
	attributes?: any,) =>
	postService.createPost({ content, category, tags, media, attributes });
export const getPostById = (postId: number) => postService.getPostById(postId);
export const getComments = (postId: number, params?: GetPostsParams) => postService.getComments(postId, params);
export const createComment = (postId: number, content: string) => postService.createComment(postId, content);

export default UltimatePostService;

