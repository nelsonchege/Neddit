"use client";

import { useCustomeToast } from "@/hooks/use-custome-toast";
import { usePrevious } from "@mantine/hooks";
import { Vote, VoteType } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { type } from "os";
import { PostVoteRequest } from "@/lib/validators/vote";

type PostVoteClientProps = {
  postId: string;
  initialVoteAmt: number;
  initialVote?: Pick<Vote, "type"> | null;
};

const PostVoteClient = ({
  postId,
  initialVoteAmt,
  initialVote,
}: PostVoteClientProps) => {
  const { loginToast } = useCustomeToast();
  const [voteAmt, setVoteAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const {} = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };
    },
  });

  return (
    <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
      <Button size={"sm"} variant={"ghost"} aria-label="upvote">
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-lg text-zinc-900">
        {voteAmt}
      </p>

      <Button size={"sm"} variant={"ghost"} aria-label="upvote">
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "Down",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
