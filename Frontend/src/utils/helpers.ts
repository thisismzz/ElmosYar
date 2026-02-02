import { Comment } from "../types/discussion_comments";

export const countReplyComments = (comments: Comment[]) => {
    var result = 0
    // comments.forEach((c) => {if (c.parent != null) result++;}) //! temp fix
    return result
}