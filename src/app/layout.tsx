import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import QueryProvider from "../providers/QueryProvider";

export const metadata = {
  title: "neddit",
  description: "A  G Reddit clone",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
    >
      <body className="min-h-screen pt-12  bg-slate-50 antialiased">
        <QueryProvider>
          {/* @ts-expect-error server component */}
          <Navbar />
          {authModal}
          <div className="container max-w-7xl mx-auto h-full pt-12">
            {children}
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
