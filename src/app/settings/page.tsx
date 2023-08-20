import { getAuthSession } from "@/actions/getSession";
import UserNameForm from "@/components/UserNameForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings",
};

const Settingspage = async () => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/sign-in");
  }
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="grid items-center gap-8">
        <h1 className="font-bold text-3xl md:text-4xl">Settings</h1>
      </div>
      <div className="grid gap-10">
        <UserNameForm
          user={{ id: session.user.id, username: session.user.username || "" }}
        />
      </div>
    </div>
  );
};

export default Settingspage;
