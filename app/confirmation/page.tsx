"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { URGENT_CATEGORIES, type Category } from "@/db/schema";
import { URGENCY_RESOURCES } from "@/lib/category-routing";
import {
  AlertTriangle,
  CheckCircle,
  ClipboardCopy,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function ConfirmationContent() {
  const params = useSearchParams();
  const caseId = params.get("caseId") ?? "";
  const passphrase = params.get("passphrase") ?? "";
  const category = (params.get("category") ?? "") as Category;

  const isUrgent = URGENT_CATEGORIES.includes(category);
  const [copied, setCopied] = useState(false);

  async function copyCredentials() {
    try {
      await navigator.clipboard.writeText(
        `কেস আইডি: ${caseId}\nপাসফ্রেজ: ${passphrase}`
      );
      setCopied(true);
      toast.success("কপি করা হয়েছে");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("কপি করা যায়নি। দয়া করে নিজে সিলেক্ট করে কপি করো।");
    }
  }

  if (!caseId || !passphrase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">রিপোর্টের তথ্য পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <span className="font-semibold text-foreground">SafeReport</span>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl space-y-5">
          {/* Success banner */}
          <div className="flex items-start gap-3 bg-primary/10 border border-primary/25 rounded-2xl p-4">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">
                তোমার রিপোর্ট জমা হয়েছে
              </p>
              <p className="text-muted-foreground text-sm mt-0.5">
                দায়িত্বপ্রাপ্ত স্টাফ এটি দেখবেন এবং উত্তর দিতে পারেন। পরে
                খবর দেখতে নিচের তথ্যগুলো ব্যবহার করো।
              </p>
            </div>
          </div>

          {/* Urgency notice */}
          {isUrgent && (
            <div className="flex items-start gap-3 bg-accent/15 border border-accent/35 rounded-2xl p-4">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  এটি জরুরি হতে পারে
                </p>
                <p className="text-muted-foreground mt-1">
                  তুমি বা অন্য কেউ তাৎক্ষণিক বিপদে থাকলে এখনই{" "}
                  <strong className="text-foreground">999</strong> (জরুরি সেবা) নম্বরে কল করো, অথবা যোগাযোগ করো:
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>
                    জরুরি সহায়তা:{" "}
                    <strong className="text-foreground">{URGENCY_RESOURCES.phone}</strong> (কল বা টেক্সট)
                  </li>
                  {URGENCY_RESOURCES.counselorContact && (
                    <li>
                      স্কুল কাউন্সেলর:{" "}
                      <strong className="text-foreground">{URGENCY_RESOURCES.counselorContact}</strong>
                    </li>
                  )}
                  <li>
                    Childline: <strong className="text-foreground">0800 1111</strong> (ফ্রি, ২৪/৭)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Credentials card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                রিপোর্ট দেখার তথ্য সংরক্ষণ করো
              </CardTitle>
              <CardDescription>
                এগুলো <strong>শুধু একবার</strong> দেখানো হয়। লিখে রাখো বা
                নিরাপদ কোথাও কপি করে রাখো। পরে রিপোর্টের খবর দেখতে দুটোই লাগবে।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  কেস আইডি
                </p>
                <p className="font-mono text-xl font-semibold tracking-widest text-foreground">
                  {caseId}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  পাসফ্রেজ
                </p>
                <p className="font-mono text-lg font-semibold text-foreground break-all">
                  {passphrase}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={copyCredentials}
              >
                <ClipboardCopy className="h-4 w-4 mr-2" />
                {copied ? "কপি হয়েছে!" : "কেস আইডি + পাসফ্রেজ কপি করো"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">তোমার গোপনীয়তা:</strong>{" "}
                এই রিপোর্টের সঙ্গে কোনো নাম, ইমেইল, IP address বা ডিভাইসের
                তথ্য রাখা হয়নি।
              </p>
              <p>
                স্টাফের উত্তর দেখতে{" "}
                <Link
                  href="/check-in"
                  className="underline text-foreground hover:text-primary"
                >
                  safereport/check-in
                </Link>{" "}
                এ গিয়ে কেস আইডি ও পাসফ্রেজ লিখো।
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/check-in">খবর দেখতে যাও</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">আরেকটি রিপোর্ট করো</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
