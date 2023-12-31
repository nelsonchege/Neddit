"use client";

import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import Post from "./Post";

type SubnedditFeedProps = {
  initialPosts: ExtendedPost[];
  subnedditName?: string;
};

const SubnedditFeed = ({ initialPosts, subnedditName }: SubnedditFeedProps) => {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  const { data: session } = useSession();
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subnedditName ? `&subnedditName=${subnedditName}` : "");
      const { data } = await axios.get(query);

      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;
  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const voteAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);
        const currentvote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );
        if (index == posts.length - 1) {
          return (
            <li key={index} ref={ref}>
              <Post
                subnedditName={post.subneddit.name}
                post={post}
                commentAmt={post.comments.length}
                votesAmt={voteAmt}
                currentVote={currentvote}
              />
            </li>
          );
        } else {
          return (
            <Post
              subnedditName={post.subneddit.name}
              key={index}
              post={post}
              commentAmt={post.comments.length}
              votesAmt={voteAmt}
              currentVote={currentvote}
            />
          );
        }
      })}
    </ul>
  );
};

export default SubnedditFeed;
