import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import prisma from "@/lib/db";
import SubnedditFeed from "./SubnedditFeed";
import { getAuthSession } from "@/actions/getSession";

const GeneralFeed = async () => {
  const session = await getAuthSession();

  const followedCommunities = await prisma.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subneddit: true,
    },
  });
  const posts = await prisma.post.findMany({
    where: {
      subneddit: {
        name: {
          in: followedCommunities.map(({ subneddit }) => subneddit.id),
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subneddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  return <SubnedditFeed initialPosts={posts} />;
};

export default GeneralFeed;
