import { z } from "zod";

export const PostVoteValidation = z.object({
  postId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type PostVoteRequest = z.infer<typeof PostVoteValidation>;

export const CommentVoteValidation = z.object({
  commentId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type CommentVoteRequest = z.infer<typeof CommentVoteValidation>;
