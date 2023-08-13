import { getAuthSession } from "@/actions/getSession";
import prisma from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  if (session) {
    const followedCommunities = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subneddit: true,
      },
    });

    followedCommunitiesIds = followedCommunities.map(
      ({ subneddit }) => subneddit.id
    );
  }

  try {
    const { limit, page, subnedditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subnedditName: z.string().nullish().optional(),
      })
      .parse({
        subnedditName: url.searchParams.get("subnedditName"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    let whereClause = {};

    if (subnedditName) {
      whereClause = {
        subneddit: {
          name: subnedditName,
        },
      };
    } else if (session) {
      whereClause = {
        subneddit: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    }

    const posts = await prisma.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subneddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });
    return new Response(JSON.stringify(posts));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("could not fetch more data", { status: 500 });
  }
}
