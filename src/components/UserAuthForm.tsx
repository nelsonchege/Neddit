"use client";

import { cn } from "@/lib/utils";
import React, { useCallback, useState } from "react";
import { Button } from "./ui/Button";
import { signIn } from "next-auth/react";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm = ({ className, ...props }: UserAuthFormProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);

    try {
      // throw new Error("error");
      await signIn("google");
    } catch (error) {
      toast({
        title: "something went wrong",
        description: "There was an error while loggin with google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button
        onClick={loginWithGoogle}
        isLoading={isLoading}
        size={"sm"}
        className="w-full"
      >
        {isLoading ? null : <Icons.google className="h-4 w-4 mr-2 " />}
        Google
      </Button>
    </div>
  );
};

export default UserAuthForm;
