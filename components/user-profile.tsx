"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Menu,
  MenuItem,
  Typography,
  Divider,
  Avatar,
  CircularProgress,
  Box,
} from "@mui/material";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export default function UserProfile({ mini }: { mini?: boolean }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
    handleClose();
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/staff/sign-in") },
    });
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className={`flex gap-2 justify-start items-center w-full rounded ${mini ? "" : "px-4 pt-2 pb-3"} cursor-pointer`}
      >
        <Avatar sx={{ width: 40, height: 40 }}>
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            userInfo?.name?.charAt(0).toUpperCase() ?? "?"
          )}
        </Avatar>
        {!mini && (
          <Typography variant="body2" fontWeight="medium">
            {loading ? "লোড হচ্ছে..." : userInfo?.name ?? "স্টাফ"}
          </Typography>
        )}
      </div>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 192 },
        }}
      >
        <Box px={2} py={1.5}>
          <Typography variant="subtitle2" fontWeight="bold">
            {userInfo?.email ?? "স্টাফ"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleSignOut}>সাইন আউট</MenuItem>
      </Menu>
    </>
  );
}
