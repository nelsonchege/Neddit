import { getAuthSession } from "@/actions/getSession";
import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { notFound } from "next/navigation";

type LayoutProps = {
  children: React.ReactNode;
  params: { subneddit: string };
};

const Layout = async ({ children, params: { subneddit } }: LayoutProps) => {
  const session = await getAuthSession();
  const subneddit_ = await prisma.subneddit.findFirst({
    where: { name: subneddit },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await prisma.subscription.findFirst({
        where: {
          subneddit: {
            name: subneddit,
          },
          user: {
            id: session.user.id,
          },
        },
      });
  const isSubscribed = !!subscription;

  if (!subneddit_) return notFound();

  const memberCount = await prisma.subscription.count({
    where: {
      subneddit: {
        name: subneddit,
      },
    },
  });
  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-12">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <ul className="flex flex-col col-span-2 space-y-6">{children}</ul>
          <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
            <div className="px-6 py-4">
              <p className="font-semibold py-3">About r/{subneddit_.name}</p>
            </div>
            <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Created</dt>
                <dt className="text-gray-700">
                  <time dateTime={subneddit_?.createdAt.toDateString()}>
                    {format(subneddit_.createdAt, "MMMM d, yyyy")}
                  </time>
                </dt>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Members</dt>
                <dt className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dt>
              </div>
              {subneddit_.creatorId === session?.user?.id ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">You created this community</dt>
                </div>
              ) : null}
              {subneddit_.creatorId !== session?.user?.id ? (
                <SubscribeLeaveToggle
                  isSubscribed={isSubscribed}
                  subnedditId={subneddit_.id}
                  subredditName={subneddit_.name}
                />
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
