import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { StaffSidebar } from "./_components/staff-sidebar";

export default async function StaffDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/staff/sign-in");
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-background">
      <StaffSidebar userName={session.user.name} userEmail={session.user.email} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
