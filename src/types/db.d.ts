import { Comment, Subneddit, User, Vote } from "@prisma/client";

export type ExtendedPost = Post & {
  subneddit: Subneddit;
  votes: Vote[];
  auther: User;
  comments: Comment[];
};
