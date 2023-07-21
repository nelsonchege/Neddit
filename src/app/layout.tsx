import "@/styles/globals.css";

export const metadata = {
  title: "neddit",
  description: "A  G Reddit clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
