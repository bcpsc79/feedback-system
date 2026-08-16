"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
} from "@mui/material";
import { authClient } from "@/lib/auth-client";
import SecurityIcon from "@mui/icons-material/Security";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function StaffSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/staff/dashboard",
      });
      if (result.error) {
        toast.error(result.error.message ?? "ইমেইল বা পাসওয়ার্ড ঠিক নয়।");
      } else {
        router.push("/staff/dashboard");
      }
    } catch {
      toast.error("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center gap-2">
        <SecurityIcon className="text-primary" />
        <span className="font-semibold text-foreground">
          BCPSC Report System
        </span>
        <span className="text-muted-foreground text-sm">· স্টাফ অ্যাক্সেস</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader
              title={
                <Typography variant="h6" align="center">
                  স্টাফ সাইন ইন
                </Typography>
              }
              subheader={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  এই পোর্টাল শুধু অনুমোদিত স্টাফদের জন্য। রিপোর্টগুলো গোপন থাকে।
                  রিপোর্টকারীর পরিচয় কখনো রাখা হয় না।
                </Typography>
              }
            />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <TextField
                    id="email"
                    type="email"
                    label="ইমেইল"
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                </div>
                <div className="space-y-4">
                  <TextField
                    id="password"
                    type="password"
                    label="পাসওয়ার্ড"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "সাইন ইন হচ্ছে..." : "সাইন ইন"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
