import PostEditor from "@/components/PostEditor";
import { Button } from "@/components/ui/Button";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

type SubmitPostProps = {
  params: {
    subneddit: string;
  };
};

const SubmitPostPage = async ({ params }: SubmitPostProps) => {
  const { subneddit } = params;
  const subneddit_ = await prisma.subneddit.findFirst({
    where: {
      name: subneddit,
    },
  });

  if (!subneddit_) return notFound();
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            {" "}
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            {" "}
            in r/{subneddit}
          </p>
        </div>
      </div>

      {/* form */}
      <PostEditor subnedditId={subneddit_.id} />
      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form="subneddit-post-form">
          Post
        </Button>
      </div>
    </div>
  );
};

export default SubmitPostPage;
