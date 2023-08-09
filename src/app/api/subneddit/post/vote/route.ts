import { getAuthSession } from "@/actions/getSession";
import { CACHE_AFTER_UPVOTES } from "@/config";
import prisma from "@/lib/db";
import { PostVoteValidation } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("unauthorized", { status: 401 });
    }
    const body = req.json();

    const { postId, voteType } = PostVoteValidation.parse(body);

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    const post = prisma.post.findUnique({
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

      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP") return acc + 1;
        if (vote.type === "DOWN") return acc - 1;
        return acc;
      }, 0);

      //   if (votesAmt >= CACHE_AFTER_UPVOTES) {
      //     const cachePayload:CachedPost ={
      //         id: post.id,
      //         title: post.tit,
      //         authorUserbane: "",
      //         content: "",
      //         currentVote: null,
      //         createdAt: undefined
      //     }
      //   }
      return new Response("vote added");
    }
  } catch (error) {}
}
