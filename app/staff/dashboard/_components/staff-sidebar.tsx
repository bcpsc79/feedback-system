"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  userName: string;
  userEmail: string;
}

const navItems = [
  { label: "সব রিপোর্ট", href: "/staff/dashboard", icon: HomeIcon },
];

export function StaffSidebar({ userName, userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/staff/sign-in") },
    });
  }

  return (
<div className="hidden min-[1024px]:flex w-64 h-full flex-col bg-sidebar  overflow-hidden">
  {/* Centered Brand Container */}
  <div className="flex h-14 items-center justify-center border-b border-sidebar-border">
    <span className="font-semibold text-xl text-sidebar-foreground">
      BCPSC
    </span>
  </div>

      <nav className="flex flex-col h-full justify-between">
        <div className="p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href ||
                  (item.href !== "/staff/dashboard" &&
                    pathname.startsWith(item.href))
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {userEmail}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogoutIcon className="h-4 w-4" />
            সাইন আউট
          </button>
        </div>
      </nav>
    </div>
  );
}
