import { getAuthSession } from "@/actions/getSession";
import prisma from "@/lib/db";
import { SubnedditValidator } from "@/lib/validators/subneddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unathorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = SubnedditValidator.parse(body);

    const subnedditCheck = await prisma.subneddit.findFirst({
      where: {
        name,
      },
    });

    if (subnedditCheck) {
      return new Response("Subneddit exists", { status: 409 });
    }

    const subneddit = await prisma.subneddit.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        subnedditId: subneddit.id,
      },
    });

    return new Response(subneddit.name);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("could not create subneddit", { status: 500 });
  }
}
