"use client";

import { useCustomeToast } from "@/hooks/use-custome-toast";
import { usePrevious } from "@mantine/hooks";
import React, { useCallback, useState } from "react";
import { Button } from "./ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CommentVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { CommentVote, VoteType } from "@prisma/client";
import { toast } from "@/hooks/use-toast";

type CommentsVoteProps = {
  commentId: string;
  initialVoteAmt: number;
  initialVote?: Pick<CommentVote, "type"> | null;
};

const CommentsVote = ({
  commentId,
  initialVoteAmt,
  initialVote,
}: CommentsVoteProps) => {
  const { loginToast } = useCustomeToast();
  const [voteAmt, setVoteAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  const { mutate: castVote, isLoading } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType: type,
      };

      await axios.patch("/api/subneddit/post/comment/vote", payload);
    },
    onError: (error, voteType) => {
      if (voteType === "UP") setVoteAmt((prev) => prev - 1);
      else setVoteAmt((prev) => prev + 1);

      setCurrentVote(prevVote);

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went Wrong",
        description: "Your vote was not registered,please try again.",
        variant: "destructive",
      });
    },
    onMutate: (type) => {
      if (currentVote?.type === type) {
        setCurrentVote(undefined);
        if (type === "UP") setVoteAmt((prev) => prev - 1);
        else setVoteAmt((prev) => prev + 1);
      } else {
        setCurrentVote({ type });
        if (type === "UP") setVoteAmt((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setVoteAmt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });
  const handleClick = useCallback(
    (vote_casted: VoteType) => {
      castVote(vote_casted);
    },
    [castVote]
  );
  return (
    <div className="flex gap-1">
      <Button
        disabled={isLoading}
        size={"sm"}
        variant={"ghost"}
        aria-label="upvote"
        onClick={() => handleClick(VoteType.UP)}
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-lg text-zinc-900">
        {voteAmt}
      </p>

      <Button
        disabled={isLoading}
        size={"sm"}
        variant={"ghost"}
        aria-label="upvote"
        onClick={() => handleClick(VoteType.DOWN)}
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentsVote;
