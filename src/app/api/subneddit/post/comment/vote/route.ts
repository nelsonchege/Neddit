import { getAuthSession } from "@/actions/getSession";
import prisma from "@/lib/db";
import { CommentVoteValidation } from "@/lib/validators/vote";

import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("unauthorized", { status: 401 });
    }
    const body = await req.json();

    const { commentId, voteType } = CommentVoteValidation.parse(body);

    const existingVote = await prisma.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });
    if (existingVote) {
      if (existingVote.type === voteType) {
        await prisma.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        });
        return new Response("OK");
      } else {
        // if vote type is different, update the vote
        await prisma.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
          data: {
            type: voteType,
          },
        });
        return new Response("OK");
      }
    }
    // if no existing vote, create a new vote
    await prisma.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId,
      },
    });

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
