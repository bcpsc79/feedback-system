"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CheckInPage() {
  const router = useRouter();
  const [caseId, setCaseId] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!caseId.trim() || !passphrase.trim()) {
      toast.error("কেস আইডি ও পাসফ্রেজ দুটোই লিখো।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: caseId.trim().toUpperCase(), passphrase: passphrase.trim() }),
      });

      if (res.status === 401) {
        toast.error("কেস আইডি বা পাসফ্রেজ ঠিক নয়। আবার চেষ্টা করো।");
        return;
      }
      if (!res.ok) {
        toast.error("কিছু সমস্যা হয়েছে। আবার চেষ্টা করো।");
        return;
      }

      const { caseId: confirmedId } = await res.json();
      router.push(`/check-in/${confirmedId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
            SafeReport
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              তোমার রিপোর্টের খবর দেখো
            </h1>
            <p className="text-muted-foreground text-sm">
              রিপোর্ট জমা দেওয়ার সময় পাওয়া কেস আইডি ও পাসফ্রেজ লিখো।
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">রিপোর্ট দেখার তথ্য</CardTitle>
              <CardDescription>
                এই তথ্যগুলো রিপোর্ট জমা দেওয়ার পর একবারই দেখানো হয়েছিল। কোনো
                অ্যাকাউন্ট লাগবে না।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caseId">কেস আইডি</Label>
                  <Input
                    id="caseId"
                    placeholder="যেমন A3K7M2PQ5N"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value.toUpperCase())}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passphrase">পাসফ্রেজ</Label>
                  <Input
                    id="passphrase"
                    placeholder="যেমন tiger maple frost noble"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value.toLowerCase())}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "যাচাই হচ্ছে..." : "আমার রিপোর্ট দেখাও"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            এখনো রিপোর্ট জমা দাওনি?{" "}
            <Link href="/" className="underline hover:text-foreground">
              নাম না জানিয়ে রিপোর্ট করো
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
