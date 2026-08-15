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
      toast.error("একটি বিষয় বেছে নাও।");
      return;
    }
    if (content.trim().length < 10) {
      toast.error("ঘটনাটি অন্তত ১০ অক্ষরে লিখে বোঝাও।");
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
        toast.error(data.error ?? "জমা দেওয়া যায়নি। আবার চেষ্টা করো।");
        return;
      }

      const { caseId, passphrase } = await res.json();
      router.push(
        `/confirmation?caseId=${encodeURIComponent(caseId)}&passphrase=${encodeURIComponent(passphrase)}&category=${encodeURIComponent(category)}`
      );
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করো।");
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
          রিপোর্টের খবর দেখো
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              নাম না জানিয়ে রিপোর্ট করো
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              তোমার রিপোর্ট সম্পূর্ণ গোপন থাকবে। কোনো অ্যাকাউন্ট, নাম বা
              যোগাযোগের তথ্য লাগবে না এবং রাখা হবে না। জমা দেওয়ার পর তুমি একটি
              ব্যক্তিগত <strong>কেস আইডি</strong> ও <strong>পাসফ্রেজ</strong>{" "}
              পাবে, যাতে পরে উত্তর দেখতে পারো।
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">রিপোর্টের বিস্তারিত</CardTitle>
              <CardDescription>
                যতটা পারো পরিষ্কারভাবে ঘটনাটি লিখো। দায়িত্বপ্রাপ্ত স্টাফ
                গোপনভাবেই দেখে উত্তর দেবেন।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="category">বিষয়</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="একটি বিষয় বেছে নাও..." />
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
                  <Label htmlFor="content">ঘটনার বর্ণনা</Label>
                  <Textarea
                    id="content"
                    placeholder="কি ঘটেছে, কখন ঘটেছে, কোথায় ঘটেছে লিখো। নিজের নাম বা যোগাযোগের তথ্য দিও না। রিপোর্টটি গোপন থাকবে।"
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
                  {submitting ? "জমা হচ্ছে..." : "রিপোর্ট জমা দাও"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            আগে রিপোর্ট জমা দিয়েছ?{" "}
            <Link href="/check-in" className="underline hover:text-foreground">
              কেস আইডি দিয়ে খবর দেখো
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
