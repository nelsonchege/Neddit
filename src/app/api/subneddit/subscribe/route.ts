import { getAuthSession } from "@/actions/getSession";
import prisma from "@/lib/db";
import { SubnedditSubscriptionValidator } from "@/lib/validators/subneddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { subnedditId } = SubnedditSubscriptionValidator.parse(body);

    const checkSubscription = await prisma.subscription.findFirst({
      where: {
        subnedditId,
        userId: session.user.id,
      },
    });

    if (checkSubscription) {
      return new Response("You are already subscribed to this subneddit.", {
        status: 400,
      });
    }

    await prisma.subscription.create({
      data: {
        subnedditId,
        userId: session.user.id,
      },
    });

    return new Response(subnedditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Invalid data passed", { status: 500 });
  }
}
