import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
