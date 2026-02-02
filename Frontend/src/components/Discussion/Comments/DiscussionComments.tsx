// src/components/Discussion/Comments/DiscussionComments.tsx
import React, { useEffect, useMemo, useState } from "react";
import type {
    Comment,
    CommentsProps,
    // PostHeaderProps,
    Reply,
} from "../../../types/discussion_comments";
import {
    createCommentOnPost,
    createReplyOnComment,
    dislikeComment,
    getCommentsForPost,
    likeComment,
} from "../../../services/commentService";
import { ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import "./DiscussionComments.css";
import { formatTimeAgo, PostActions } from "../Posts/DiscussionPostFeed";
import { update } from "idb-keyval";
import SortButton, { SortConfig } from "./CommentSortButton";
import { Console } from "console";
import { dislikePost, getPostById, likePost } from "../../../services/PostService";
import { Post } from "../../../types/discussion_posts";

import { countReplyComments } from "../../../utils/helpers";


// ---------- Time ago (Persian) ----------
const timeAgoFa = (isoOrTs: string) => {
    const d = new Date(isoOrTs);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();

    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "همین الان";
    if (mins < 60) return `${mins} دقیقه پیش`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ساعت پیش`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} روز پیش`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} هفته پیش`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ماه پیش`;

    const years = Math.floor(days / 365);
    return `${years} سال پیش`;
};

const getInitials = (name: string): string =>
    name
        .split(" ")
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);

const getAvatarColor = (name: string): string => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];
    return colors[name.length % colors.length];
};


const findCommentById = (id: number, comments: Comment[]): Comment | null => {
    for (var i = 0; i < comments.length; i++) {
        if (id == comments[i].id) return comments[i];
    }
    return null;
}



// ---------- Post header (compact) ----------
const PostHeader: React.FC<{ post: Post, comments: Comment[] }> = ({ post, comments }) => {
    const [postState, setPostState] = useState(post);
    const initials = getInitials(post.user.name);
    const avatarColor = getAvatarColor(post.user.name);


    const handleLike = async (postId: number) => {
        const r = await likePost(postId);
        setPostState(
            {
                ...postState,
                isLiked: r.isLiked,
                isDisliked: r.isDisliked,
                likes: r.likes,
                dislikes: r.dislikes,
            }
        )
    };


    const handleDislike = async (postId: number) => {
        const r = await dislikePost(postId);
        setPostState(
            {
                ...postState,
                isLiked: r.isLiked,
                isDisliked: r.isDisliked,
                likes: r.likes,
                dislikes: r.dislikes,
            }
        )
    };

    useEffect(() => {
        console.log(post.comments)
        setPostState({...post, comments: comments.length - countReplyComments(comments)})
    }, [comments])
    
    return (
        <div className="">
            <div className="post-header">
                <div className="user-avatar">
                    <img
                        src={postState.user.avatar}
                        alt={postState.user.name}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9kayreViIUlp8-GZFDlXdNHQc7Ckc8PpM0w&s";
                        }}
                    />
                </div>

                <div className="post-header-meta">
                    <div className="user-name">{postState.user.name}</div>
                    <div className="user-username">@{postState.user.username}</div>
                </div>

                <div className="post-time">{formatTimeAgo(postState.timestamp)}</div>
            </div>

            {post.content ? <div className="post-content post-content-clamp">{post.content}</div> : null}




            <PostActions
                postId={postState.id}
                likes={postState.likes}
                dislikes={postState.dislikes}
                comments={postState.comments}
                isLiked={postState.isLiked}
                isDisliked={postState.isDisliked}
                onLike={handleLike}
                onDislike={handleDislike}
                onComment={() => { }}
                onOpenComments={() => { }}
            />
        </div>
    );
};

// ---------- Composer ----------
const CommentComposer: React.FC<{ onSubmit: (text: string) => Promise<void> }> = ({ onSubmit }) => {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || loading) return;

        setLoading(true);
        try {
            await onSubmit(text.trim());
            setText("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="comment-composer" onSubmit={submit}>
            <textarea
                className="comment-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="نظر خود را بنویسید..."
                rows={4}
                required
            />
            <div className="composer-actions">
                <button type="submit" className="comment-submit-button" disabled={!text.trim() || loading}>
                    ارسال
                </button>
            </div>
        </form>
    );
};

// ---------- Reply Item ----------
const ReplyItem: React.FC<{
    replyId: number;
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}> = ({ replyId, comments, setComments }) => {

    const [reply, setReply] = useState<Reply>();

    const displayName = reply?.isAnonymous ? "ناشناس" : reply?.user?.name;
    const initials = getInitials(displayName ?? "نامعلوم");
    const avatarColor = getAvatarColor(displayName ?? "bruh");

    useEffect(() => {
        const replyComment = findCommentById(replyId, comments);
        console.log(replyComment)
        if (replyComment) setReply({
            id: replyComment.id,
            parent: replyComment.parent ?? undefined,

            user: {
                name: replyComment.user.name,
                username: replyComment.user.username,
                avatar: replyComment.user.avatar,
            },

            isAnonymous: replyComment.isAnonymous,

            time: replyComment.timestamp,
            text: replyComment.content,

            likes: replyComment.likes,
            dislikes: replyComment.dislikes,
            is_liked: replyComment.isLiked,
            is_disliked: replyComment.isDisliked,
        })


    }, [comments])

    const onLikeReply = async (commentId: number) => {
        const r = await likeComment(commentId);

        setComments(comments.map((c) => (c.id == reply?.id ? {
            ...c,
            isLiked: r.is_liked,
            isDisliked: r.is_disliked,
            likes: r.likes_count,
            dislikes: r.dislikes_count
        } : c)))
    };

    const onDislikeReply = async (commentId: number) => {
        const r = await dislikeComment(commentId);

        setComments(comments.map((c) => (c.id == reply?.id ? {
            ...c,
            isLiked: r.is_liked,
            isDisliked: r.is_disliked,
            likes: r.likes_count,
            dislikes: r.dislikes_count
        } : c)))
    };

    return (

        <div className="reply-item">

            <div className="reply-content">
                <div className="reply-header">
                    <div className="user-avatar small" style={{ backgroundColor: avatarColor }}>
                        {initials}
                    </div>
                    {reply &&
                        <div className="user-info">
                            <span className="author-name">{displayName}</span>
                            {reply.isAnonymous ? null : reply.user?.username ? <span className="reply-username">@{reply.user?.username}</span> : null}
                            <span className="comment-time">{timeAgoFa(reply.time)}</span>
                        </div>
                    }
                </div>
                {reply && <p className="reply-text">{reply.text}</p>}
            </div>

            <div className="reply-actions">
                <button className={`action-btn like-btn small ${reply?.is_liked ? "liked" : ""}`} onClick={() => reply?.id ? onLikeReply(reply?.id) : {}}>
                    <span className="action-icon">
                        <ThumbsUp size={14} fill={reply?.is_liked ? "currentColor" : "none"} />
                    </span>
                    <span className="action-count">{reply?.likes}</span>
                </button>

                <button className={`action-btn dislike-btn small ${reply?.is_disliked ? "disliked" : ""}`} onClick={() => reply?.id ? onDislikeReply(reply?.id) : {}}>
                    <span className="action-icon">
                        <ThumbsDown size={14} fill={reply?.is_disliked ? "currentColor" : "none"} />
                    </span>
                    <span className="action-count">{reply?.dislikes}</span>
                </button>
            </div>
        </div>
    );
};

// ---------- Comment Item ----------
const CommentItem: React.FC<{
    comment: Comment;
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    onReplySubmit: (parentCommentId: number, text: string) => Promise<void>;
    onLoadReplies: (commentId: number) => Promise<void>;
    postId: number | undefined
}> = ({ comment, comments, setComments, onReplySubmit, onLoadReplies, postId }) => {
    // console.log('CommentItem rendering:', comment.id, 'replies:', comment.replies.length);


    const onLike = async (commentId: number) => {
        const r = await likeComment(commentId);
        console.log(r)

        setComments(comments.map((c) => (c == comment ? {
            ...c,
            isLiked: r.is_liked,
            isDisliked: r.is_disliked,
            likes: r.likes_count,
            dislikes: r.dislikes_count
        } : c)))


    };

    const onDislike = async (commentId: number) => {
        const r = await dislikeComment(commentId);
        console.log(r)
        setComments(comments.map((c) => (c == comment ? {
            ...c,
            isLiked: r.is_liked,
            isDisliked: r.is_disliked,
            likes: r.likes_count,
            dislikes: r.dislikes_count
        } : c)))
    };

    const [showReplies, setShowReplies] = useState(false);
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);

    const displayName = comment.isAnonymous ? "ناشناس" : comment.user.name;
    const initials = getInitials(displayName);
    const avatarColor = getAvatarColor(displayName);

    const toggleReplies = async () => {
        console.log("toggling replies")
        const next = !showReplies;
        setShowReplies(next);

    };

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || submittingReply) return;


        setSubmittingReply(true);
        try {
            await onReplySubmit(comment.id, replyText.trim());
            setReplyText("");
            setReplyOpen(false);
            setShowReplies(true);
        } finally {
            setSubmittingReply(false);
        }
    };



    return (
        <div className={`comment ${(comment.replies.length) > 0 ? "has-replies" : ""}`}>
            <div className="comment-header">
                <div className="comment-user-avatar" style={{ backgroundColor: avatarColor }}>
                    {initials}
                </div>

                <div className="user-info">
                    <div className="comment-author-row">
                        <span className="author-name">{displayName}</span>
                        {comment.isAnonymous ? null : comment.user.username ? <span className="comment-username">@{comment.user.username}</span> : null}
                        <span className="comment-time">{timeAgoFa(comment.timestamp)}</span>
                    </div>
                </div>
            </div>

            <p className="comment-content">{comment.content}</p>

            <div className="comment-actions">
                <div className="action-group">
                    <button className={`action-btn like-btn ${comment.isLiked ? "liked" : ""}`} onClick={() => onLike(comment.id)}>
                        <span className="action-icon">
                            <ThumbsUp size={18} fill={comment.isLiked ? "currentColor" : "none"} />
                        </span>
                        <span className="action-count">{comment.likes}</span>
                    </button>

                    <button className={`action-btn dislike-btn ${comment.isDisliked ? "disliked" : ""}`} onClick={() => onDislike(comment.id)}>
                        <span className="action-icon">
                            <ThumbsDown size={18} fill={comment.isDisliked ? "currentColor" : "none"} />
                        </span>
                        <span className="action-count">{comment.dislikes}</span>
                    </button>

                    <button className="action-btn reply-btn" onClick={() => setReplyOpen((p) => !p)}>
                        <span className="action-icon">
                            <MessageCircle size={18} />
                        </span>
                        <span className="action-text">پاسخ</span>
                    </button>
                </div>

                {(comment.replies.length) > 0 && (
                    <button className="action-btn view-replies-btn" onClick={toggleReplies}>
                        <span className="action-icon">{showReplies ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                        <span className="action-text">{comment.replies.length} پاسخ</span>
                    </button>
                )}
            </div>

            {replyOpen && (
                <form className="reply-form" onSubmit={submitReply}>
                    <div className="reply-input-wrapper">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`پاسخ به ${displayName}...`}
                            className="reply-input"
                            rows={3}
                            required
                        />
                        <div className="reply-form-actions">
                            <button type="button" className="comment-cancel-btn small" onClick={() => setReplyOpen(false)}>
                                انصراف
                            </button>
                            <button type="submit" className="comment-submit-button small" disabled={!replyText.trim() || submittingReply}>
                                ارسال پاسخ
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {showReplies && (
                <div className="replies-list">
                    {loadingReplies ? <div className="replies-loading">در حال بارگذاری پاسخ‌ها...</div> : null}

                    {(comment.replies ?? []).map((r) => (
                        <div key={r} className="reply-wrapper">
                            <ReplyItem replyId={r} comments={comments} setComments={setComments} />
                        </div>
                    )).reverse()}
                </div>
            )}
        </div>
    );
};

// ---------- Main ----------
const Comments: React.FC<CommentsProps> = ({
    initialComments = [],
    comments: externalComments,
    setComments: externalSetComments,
    title = "نظرات",
    currentUserName = "اسب",
    post,
    postId,
    showComposer = true,
}) => {
    const [internalComments, internalSetComments] = useState<Comment[]>(initialComments);
    const comments = externalComments ?? internalComments;
    const setComments = externalSetComments ?? internalSetComments;

    const targetPostId = useMemo(() => postId ?? post?.id ?? -1, [postId, post]);

    const [sortConfig, setSortConfig] = useState<SortConfig>({
        option: 'date',
        order: 'desc'
    });
    const addComment = async (text: string) => {
        if (targetPostId < 0) return;

        var newComment = await createCommentOnPost(targetPostId, text);
        if (newComment.user.name == "") newComment.user.name = newComment.user.username || ""
        setComments((prev) => [...prev, newComment]);
    };

    const handleReplySubmit = async (parentCommentId: number, text: string) => {
        if (postId == undefined) return
        await createReplyOnComment(postId ?? 0, parentCommentId, text);
        setComments(await getCommentsForPost(postId))
    };

    function findCommentWithID(commentID: number | null) {
        if (commentID == null) return null;
        for (var i = 0; i < comments.length; i++) {
            if (comments[i].id == commentID) return comments[i]
        }
        return null;
    }




    // IMPORTANT: likeComment/dislikeComment return Post (frontend), not likes_count fields.
    const handleLike = async (commentId: number) => {
        const r = await likeComment(commentId);
        // if (postId) {
        //     setComments(
        //     );
        // }
    };

    const handleDislike = async (commentId: number) => {
        const r = await dislikeComment(commentId);
        // if (postId) setComments(
        //     await 
        // );
    };

    const handleSortChange = (config: SortConfig) => {
        setSortConfig(config);
        // Optional: Save to localStorage
        // localStorage.setItem('commentSortConfig', JSON.stringify(config));
    };

    const updatedCommentSort = () => {
        const newComments: Comment[] = [...comments]
        if (sortConfig.option == "likes" && sortConfig.order == "asc") (newComments.sort((a, b) => a.likes - b.likes))
        if (sortConfig.option == "date" && sortConfig.order == "asc") (newComments.sort((a, b) => b.likes - a.likes))
        if (sortConfig.option == "likes" && sortConfig.order == "desc") (newComments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
        if (sortConfig.option == "date" && sortConfig.order == "desc") (newComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))

        return newComments
    }




    return (
        <div className="comments-container">
            <div className="comments-card">
                {post ? <PostHeader
                    post={{
                        id: post.id ,
                    user: post.user ,
                    content: post.content ,
                    timestamp: post.timestamp ,
                    likes: post.likes ,
                    dislikes: post.dislikes ,
                    comments: post.comments,
                    isLiked: post.isLiked ,
                    isDisliked: post.isDisliked ,
                    category: post.category ,
                    media: post.media ,
                    tags: post.tags ,
                    attributes: post.attributes ,
                    }}
                    comments={comments}
                /> : null}

                <div className="comments-header simple">
                    <h2 className="comments-title">{title}</h2>
                </div>

                {showComposer ? <CommentComposer onSubmit={addComment} /> : null}

                {/* <SortButton
                    onSortChange={handleSortChange}
                    defaultOption={sortConfig.option}
                    defaultOrder={sortConfig.order}
                /> */}

                <div className="comments-list">
                    {comments.map((c) => (
                        c.parent == null &&
                        <CommentItem
                            key={c.id}
                            comment={c}
                            onReplySubmit={handleReplySubmit}
                            onLoadReplies={async (cid) => {
                            }}
                            comments={comments}
                            setComments={(val) => { setComments(val) }}
                            postId={postId}
                        />
                    )).reverse()}

                    {comments.length === 0 ? (
                        <div className="empty-state">
                            <h3>هنوز نظری ثبت نشده است</h3>
                            <p>اولین نفری باشید که نظر می‌دهد!</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Comments;
