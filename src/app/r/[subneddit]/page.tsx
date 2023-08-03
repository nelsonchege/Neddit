import { getAuthSession } from "@/actions/getSession";
import MiniCreatePost from "@/components/MiniCreatePost";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

type SubnedditProps = {
  params: {
    subneddit: string;
  };
};

const subnedditPage = async ({ params }: SubnedditProps) => {
  const { subneddit: subaccount } = params;

  const session = await getAuthSession();

  const subneddit = await prisma.subneddit.findFirst({
    where: { name: subaccount },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subneddit: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!subneddit) return notFound();
  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        r/{subneddit.name}
      </h1>
      <MiniCreatePost session={session} />
    </>
  );
};

export default subnedditPage;
