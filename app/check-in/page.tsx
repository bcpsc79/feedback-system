"use client";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

export default function CheckInPage() {
  const router = useRouter();
  const [caseId, setCaseId] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    const caseIdMatch = pastedText.match(/কেস আইডি:\s*(\S+)/);
    const passphraseMatch = pastedText.match(/পাসফ্রেজ:\s*(.+)/);

    if (caseIdMatch || passphraseMatch) {
      e.preventDefault();
      if (caseIdMatch) setCaseId(caseIdMatch[1].toUpperCase());
      if (passphraseMatch) setPassphrase(passphraseMatch[1].trim().toLowerCase());
      toast.success("তথ্য স্বয়ংক্রিয়ভাবে বসানো হয়েছে");
    }
  };

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
        body: JSON.stringify({
          caseId: caseId.trim().toUpperCase(),
          passphrase: passphrase.trim(),
        }),
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
      <header className="border-b px-8 py-4 flex items-center justify-between">
        {/* Brand & Logo Container */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.jpg"     // References public/logo.jpg automatically
            alt="BCPSC Logo"
            width={37}          // Adjust width as needed (32px = h-8)
            height={37}         // Adjust height as needed
            className="object-contain rounded-md" // Optional styling: smooths sharp image edges
            priority            // Ensures the navbar logo loads instantly without layout shifts
          />
        </div>
        
        <Link
          href="/"
          className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors shadow-sm"
        >
          নতুন রিপোর্ট করো
        </Link>
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

          <Card variant="outlined" className="bg-card text-card-foreground">
            <CardHeader
              title={
                <Typography
                  variant="h6"
                  className="text-base font-semibold"
                  align="center"
                >
                  রিপোর্ট দেখার তথ্য
                </Typography>
              }
              subheader={
                <Typography
                  variant="body2"
                  className="text-muted-foreground"
                  align="center"
                >
                  এই তথ্যগুলো রিপোর্ট জমা দেওয়ার পর একবারই দেখানো হয়েছিল। কোনো
                  অ্যাকাউন্ট লাগবে না।
                </Typography>
              }
            />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Typography
                    variant="subtitle2"
                    component="label"
                    htmlFor="caseId"
                    className="font-medium text-foreground"
                  >
                    কেস আইডি
                  </Typography>
                  <TextField
                    id="caseId"
                    placeholder="যেমন A3K7M2PQ5N"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value.toUpperCase())}
                    onPaste={handlePaste}
                    autoComplete="off"
                    inputProps={{
                      autoCorrect: "off",
                      spellCheck: false,
                      maxLength: 20,
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </div>

                <div className="space-y-2">
                  <Typography
                    variant="subtitle2"
                    component="label"
                    htmlFor="passphrase"
                    className="font-medium text-foreground"
                  >
                    পাসফ্রেজ
                  </Typography>
                  <TextField
                    id="passphrase"
                    placeholder="যেমন tiger maple frost noble"
                    value={passphrase}
                    onChange={(e) =>
                      setPassphrase(e.target.value.toLowerCase())
                    }
                    onPaste={handlePaste}
                    autoComplete="off"
                    inputProps={{
                      autoCorrect: "off",
                      spellCheck: false,
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </div>

                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  className="w-full normal-case bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
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
