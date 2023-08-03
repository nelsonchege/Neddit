"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { SubnedditSubscriptionPayload } from "@/lib/validators/subneddit";
import axios, { AxiosError } from "axios";
import { useCustomeToast } from "@/hooks/use-custome-toast";
import { toast } from "@/hooks/use-toast";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

type SubscribeLeaveToggleProps = {
  isSubscribed: boolean;
  subnedditId: string;
  subredditName: string;
};

const SubscribeLeaveToggle = ({
  isSubscribed,
  subnedditId,
  subredditName,
}: SubscribeLeaveToggleProps) => {
  const { loginToast } = useCustomeToast();
  const router = useRouter();

  // for subscribbing to subneddit
  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubnedditSubscriptionPayload = {
        subnedditId,
      };

      const { data } = await axios.post("/api/subneddit/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something Went wrong,plase try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Subscribed",
        description: `You are now subscribed to r/${subredditName}`,
        variant: "default",
      });
    },
  });

  // for unsubscribbing to subneddit
  const { mutate: unSubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubnedditSubscriptionPayload = {
        subnedditId,
      };

      const { data } = await axios.post("/api/subneddit/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something Went wrong,plase try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Subscribed",
        description: `You are now unSubscribed from r/${subredditName}`,
        variant: "default",
      });
    },
  });
  return isSubscribed ? (
    <Button
      className="w-full mt-4 mb-6"
      isLoading={isUnsubLoading}
      onClick={() => unSubscribe()}
    >
      Leave Community
    </Button>
  ) : (
    <Button
      className="w-full mt-4 mb-6"
      isLoading={isSubLoading}
      onClick={() => subscribe()}
    >
      Join Community
    </Button>
  );
};

export default SubscribeLeaveToggle;
