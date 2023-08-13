import { getAuthSession } from "@/actions/getSession";
import { CACHE_AFTER_UPVOTES } from "@/config";
import prisma from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidation } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("unauthorized", { status: 401 });
    }
    const body = await req.json();

    const { postId, voteType } = PostVoteValidation.parse(body);

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response("Post not Found", { status: 404 });
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await prisma.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        });
        return new Response("Removed vote");
      }

      await prisma.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      const voteAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP") return acc + 1;
        if (vote.type === "DOWN") return acc - 1;
        return acc;
      }, 0);

      if (voteAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorUsername: post.author.username!,
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: voteType,
          createdAt: post.createdAt,
        };
        await redis.hset(`post:${postId}`, cachePayload);
      }

      return new Response("vote added");
    }

    await prisma.vote.create({
      data: {
        userId: session.user.id,
        postId: post.id,
        type: voteType,
      },
    });

    const voteAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc;
    }, 0);

    if (voteAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        authorUsername: post.author.username!,
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currentVote: voteType,
        createdAt: post.createdAt,
      };
      await redis.hset(`post:${postId}`, cachePayload);
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }
    return new Response(
      "Could not vote on the post at this time,please try again later",
      { status: 500 }
    );
  }
}
