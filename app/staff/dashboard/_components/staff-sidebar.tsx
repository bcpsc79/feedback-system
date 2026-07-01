"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { FileText, Home, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  userName: string;
  userEmail: string;
}

const navItems = [
  { label: "All Reports", href: "/staff/dashboard", icon: Home },
];

export function StaffSidebar({ userName, userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/staff/sign-in") } });
  }

  return (
    <div className="hidden min-[1024px]:flex w-64 border-r h-full flex-col bg-background">
      <div className="flex h-14 items-center border-b px-4 gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">SafeReport Staff</span>
      </div>

      <nav className="flex flex-col h-full justify-between">
        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href || (item.href !== "/staff/dashboard" && pathname.startsWith(item.href))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t space-y-3">
          <div className="px-3">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </nav>
    </div>
  );
}
