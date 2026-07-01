"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export default function UserProfile({ mini }: { mini?: boolean }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    const result = await authClient.getSession();
    if (result.data?.user) {
      setUserInfo(result.data.user as UserInfo);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/staff/sign-in") },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={`flex gap-2 justify-start items-center w-full rounded ${mini ? "" : "px-4 pt-2 pb-3"} cursor-pointer`}>
          <Avatar>
            {loading ? (
              <div className="flex items-center justify-center w-full h-full">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <AvatarFallback>
                {userInfo?.name?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            )}
          </Avatar>
          {!mini && (
            <p className="font-medium text-sm">
              {loading ? "Loading…" : userInfo?.name ?? "Staff"}
            </p>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>{userInfo?.email ?? "Staff"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
