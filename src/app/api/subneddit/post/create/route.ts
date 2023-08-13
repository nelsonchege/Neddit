import { getAuthSession } from "@/actions/getSession";
import prisma from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { subnedditId, title, content } = PostValidator.parse(body);

    const checkSubscription = await prisma.subscription.findFirst({
      where: {
        subnedditId,
        userId: session.user.id,
      },
    });

    if (!checkSubscription) {
      return new Response("Please Subscribe to this subneddit first .", {
        status: 400,
      });
    }

    await prisma.post.create({
      data: {
        subnedditId,
        title,
        content,
        authorId: session.user.id,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response(
      "Could not post to subneddit at this time,please try again later",
      { status: 500 }
    );
  }
}
