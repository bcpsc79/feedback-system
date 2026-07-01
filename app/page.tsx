"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS } from "@/db/schema";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [string, string][];

export default function ReportPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    if (content.trim().length < 10) {
      toast.error("Please describe the situation in at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No cookies, no credentials — purely anonymous
        body: JSON.stringify({ category, content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Submission failed. Please try again.");
        return;
      }

      const { caseId, passphrase } = await res.json();
      router.push(
        `/confirmation?caseId=${encodeURIComponent(caseId)}&passphrase=${encodeURIComponent(passphrase)}&category=${encodeURIComponent(category)}`
      );
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">SafeReport</span>
        </div>
        <Link
          href="/check-in"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Check in on a report
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Submit an anonymous report
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your report is completely anonymous. No account, name, or contact
              information is required or stored. You will receive a private{" "}
              <strong>Case ID</strong> and <strong>passphrase</strong> so you
              can check back for a response.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report details</CardTitle>
              <CardDescription>
                Describe the situation as clearly as you can. Staff will review
                and respond anonymously.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select a category…" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Description</Label>
                  <Textarea
                    id="content"
                    placeholder="Describe what happened, when, and where. Do not include your own name or contact details — your report is anonymous."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    maxLength={5000}
                    className="resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.length}/5000
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit report"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Already submitted a report?{" "}
            <Link href="/check-in" className="underline hover:text-foreground">
              Check in with your Case ID
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
