import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import prisma from "@/lib/db";
import SubnedditFeed from "./SubnedditFeed";

const CustomFeed = async () => {
  const posts = await prisma.post.findMany({
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

export default CustomFeed;
