"use client";

import React, { useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { Comment, CommentVote, User } from "@prisma/client";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { formatTimeToNow } from "@/lib/utils";
import CommentsVote from "./CommentsVote";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { useCustomeToast } from "@/hooks/use-custome-toast";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

type PostCommentProps = {
  comment: ExtendedComment;
  currentVote: CommentVote | undefined;
  voteAmt: number;
  postId: string;
};

const PostComment = ({
  comment,
  currentVote,
  voteAmt,
  postId,
}: PostCommentProps) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const [isReplying, setIsReplying] = useState<Boolean>(false);
  const [input, setInput] = useState<string>("");
  const { data: session } = useSession();
  const router = useRouter();
  const { loginToast } = useCustomeToast();

  const { mutate: CreateComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };
      const { data } = await axios.patch(
        `/api/subneddit/post/comment`,
        payload
      );
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something Went wrong,plase try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
      return toast({
        title: "Subscribed",
        description: `You have susessfully commented`,
        variant: "default",
      });
    },
  });
  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>
      <div className="flex gap-3 items-center flex-wrap">
        <CommentsVote
          commentId={comment.id}
          initialVoteAmt={voteAmt}
          initialVote={currentVote}
        />
        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
            setIsReplying((prev) => !prev);
          }}
          variant="ghost"
          size={"xs"}
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="what are your thoughts?"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={() =>
                    CreateComment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    })
                  }
                  isLoading={isLoading}
                  disabled={input.length === 0}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
