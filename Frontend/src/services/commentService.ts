// src/services/commentService.ts
import api from "./authService";
import { postService, type GetPostsParams } from "./PostService";
import type { Comment as FrontendComment, Reply as FrontendReply } from "../types/discussion_comments";
import type { Post } from "../types/discussion_posts";

/**
 * Key rules (per your backend):
 * - Comments are posts in separate categories (discussion-comments / review-comments).
 * - Some comment categories are anonymous (e.g. review-comments).
 * - Replies are "comments on comments" (i.e., comments endpoint on commentId).
 *
 * Therefore:
 * - Like/dislike a comment => postService.likePost(commentId) / dislikePost(commentId)
 * - Create reply => postService.createComment(parentCommentId, content)
 * - Fetch replies => postService.getComments(commentId)
 */

const ANONYMOUS_CATEGORIES = new Set<string>(["review-comments"]);

export const fetchPostWithComments = async (postId: number) => {
	const response = await api.get(`/posts/${postId}/`);
	return response.data;
};

// ---------- Post mapping ----------
export const mapBackendPostToFrontendPostCard = (backendPost: any): Post => {
	return {
		id: backendPost.id,
		user: {
			id: backendPost.author_info?.id ?? -1,
			name:
				`${backendPost.author_info?.first_name ?? ""} ${backendPost.author_info?.last_name ?? ""}`.trim() ||
				backendPost.author_info?.username ||
				"کاربر",
			avatar: backendPost.author_info?.profile_picture ?? "",
			username: backendPost.author_info?.username ?? "",
		},
		content: backendPost.attributes?.body ?? backendPost.content ?? "",
		attributes: backendPost.attributes ?? {},
		timestamp: backendPost.created_at,
		likes: backendPost.likes_count ?? 0,
		dislikes: backendPost.dislikes_count ?? 0,
		comments: backendPost.comments_count ?? 0,
		isLiked: backendPost.user_reaction === "like",
		isDisliked: backendPost.user_reaction === "dislike",
		category: backendPost.category,
		media: backendPost.media ?? [],
		tags:
			typeof backendPost.attributes?.tags === "string"
				? backendPost.attributes.tags
						.split(",")
						.map((t: string) => t.trim())
						.filter(Boolean)
				: [],
	};
};

export const getPostCard = async (postId: number): Promise<Post> => {
	const data = await fetchPostWithComments(postId);
	const backendPost = data?.post ?? data;
	return mapBackendPostToFrontendPostCard(backendPost);
};

// ---------- Comment anonymity helpers ----------
type RawComment = any;

const isAnonymousRaw = (raw: RawComment): boolean => {
	if (raw?.is_anonymous === true) return true;
	if (raw?.anonymous === true) return true;

	const category = raw?.category;
	if (typeof category === "string" && ANONYMOUS_CATEGORIES.has(category)) return true;

	// missing author/user fields => anonymous
	const username = raw?.author?.username || raw?.author_info?.username || raw?.user?.username || raw?.user?.username;
	if (!username) return true;

	return false;
};

const pickUserFields = (raw: RawComment) => {
	const author = raw?.author || raw?.author_info || raw?.user || {};
	return {
		id: author?.id ?? raw?.user?.id ?? -1,
		name: author?.first_name || author?.name || author?.username || "کاربر",
		username: author?.username || raw?.user?.username || "",
		avatar: author?.profile_picture || author?.avatar || "",
	};
};

const toFrontendReply = (c: FrontendComment): FrontendReply => ({
	id: c.id,
	user: c.isAnonymous
		? undefined
		: {
				name: c.name,
				username: c.username,
				avatar: c.avatar,
		  },
	name: c.name,
	username: c.username,
	avatar: c.avatar,
	isAnonymous: c.isAnonymous,
	time: c.time,
	text: c.text,
	likes: c.likes,
	dislikes: c.dislikes,
	is_liked: c.is_liked,
	is_disliked: c.is_disliked,
});

export const mapRawCommentsToFrontend = (rawComments: RawComment[]): FrontendComment[] => {
	return rawComments.map((raw) => {
		const anonymous = isAnonymousRaw(raw);
		const u = anonymous ? null : pickUserFields(raw);

		// allow nested replies if backend sends them (optional)
		const nestedRaw: RawComment[] = raw?.replies || raw?.comments || [];

		const base: FrontendComment = {
			id: raw.id,
			parentId: raw.parent,
			user: anonymous
				? undefined
				: {
						id: u!.id,
						name: u!.name,
						username: u!.username,
						avatar: u!.avatar || undefined,
				  },
			name: anonymous ? "ناشناس" : u!.name,
			username: anonymous ? undefined : u!.username || undefined,
			avatar: anonymous ? undefined : u!.avatar || undefined,
			isAnonymous: anonymous,

			time: raw.created_at || raw.timestamp || new Date().toISOString(),
			text: raw.content || raw.text || "",

			likes: raw.likes_count ?? raw.likes ?? 0,
			dislikes: raw.dislikes_count ?? raw.dislikes ?? 0,
			is_liked: raw.is_liked ?? raw.liked ?? false,
			is_disliked: raw.is_disliked ?? raw.disliked ?? false,

			replies: [],
			replyCount: raw.comments_count ?? raw.replies_count ?? (Array.isArray(nestedRaw) ? nestedRaw.length : 0),
		};

		if (Array.isArray(nestedRaw) && nestedRaw.length > 0) {
			base.replies = mapRawCommentsToFrontend(nestedRaw).map(toFrontendReply);
			base.replyCount = base.replies.length;
		}

		return base;
	});
};

// ---------- Fetch comments / replies ----------
export const getCommentsForPost = async (postId: number): Promise<FrontendComment[]> => {
	const res = await postService.getComments(postId);
	console.log("get comments - " , res , mapRawCommentsToFrontend(res.comments))
	return mapRawCommentsToFrontend(res.comments);
};

export const getRepliesForComment = async (postId:number, commentId: number, params?: GetPostsParams): Promise<FrontendReply[]> => {
	const res = await postService.getComments(postId, params ?? {});
	console.log("replis", res);
	
	console.log("get replies - ", res, mapRawCommentsToFrontend(res.comments).map(toFrontendReply))
	return mapRawCommentsToFrontend(res.comments).map(toFrontendReply);
};

// ---------- Create comment / reply ----------
export const createCommentOnPost = async (postId: number, content: string) => {
	return await postService.createComment(postId, content);
};

export const createReplyOnComment = async (parentPostId: number, parentCommentId: number, content: string) => {
	// replies are comments on comments
	return await postService.createComment(parentPostId, content, parentCommentId.toString());
};

// ---------- Like / dislike posts ----------
export const likePost = async (postId: number) => postService.likePost(postId);
export const dislikePost = async (postId: number) => postService.dislikePost(postId);
export const removeReaction = async (postId: number) => postService.removeReaction(postId);

// ---------- Like / dislike comments (comments are posts) ----------
export const likeComment = async (commentId: number) => postService.likePost(commentId);
export const dislikeComment = async (commentId: number) => postService.dislikePost(commentId);
