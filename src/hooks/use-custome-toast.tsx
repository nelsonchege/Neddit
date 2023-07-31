import Link from "next/link";
import { toast } from "./use-toast";
import { buttonVariants } from "@/components/ui/Button";

export const useCustomeToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "You havent Logged In",
      description: "Please Login to continue",
      variant: "destructive",
      action: (
        <Link
          href={"/sign-in"}
          onClick={() => dismiss()}
          className={buttonVariants({ variant: "outline" })}
        >
          Login
        </Link>
      ),
    });
  };
  return { loginToast };
};
