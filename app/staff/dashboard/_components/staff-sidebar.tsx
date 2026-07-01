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
    <div className="hidden min-[1024px]:flex w-64 h-full flex-col bg-sidebar rounded-r-2xl overflow-hidden">
      <div className="flex h-14 items-center px-5 gap-2.5 border-b border-sidebar-border">
        <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
        <span className="font-semibold text-sm text-sidebar-foreground">SafeReport Staff</span>
      </div>

      <nav className="flex flex-col h-full justify-between">
        <div className="p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href || (item.href !== "/staff/dashboard" && pathname.startsWith(item.href))
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </nav>
    </div>
  );
}
