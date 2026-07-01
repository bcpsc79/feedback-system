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
      toast.error("Please enter both your Case ID and passphrase.");
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
        toast.error("Incorrect Case ID or passphrase. Please try again.");
        return;
      }
      if (!res.ok) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      const { caseId: confirmedId } = await res.json();
      router.push(`/check-in/${confirmedId}`);
    } catch {
      toast.error("Network error. Please try again.");
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
              Check in on your report
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter the Case ID and passphrase you received when you submitted your report.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report access</CardTitle>
              <CardDescription>
                Your credentials were shown once after submission. No account is required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caseId">Case ID</Label>
                  <Input
                    id="caseId"
                    placeholder="e.g. A3K7M2PQ5N"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value.toUpperCase())}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <Input
                    id="passphrase"
                    placeholder="e.g. tiger maple frost noble"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value.toLowerCase())}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying…" : "Access my report"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Haven&apos;t submitted a report yet?{" "}
            <Link href="/" className="underline hover:text-foreground">
              Submit anonymously
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
