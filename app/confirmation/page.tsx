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
        `Case ID: ${caseId}\nPassphrase: ${passphrase}`
      );
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please select and copy manually.");
    }
  }

  if (!caseId || !passphrase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No report data found.</p>
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
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-green-900 text-sm">
                Your report has been submitted
              </p>
              <p className="text-green-800 text-sm mt-0.5">
                A staff member will review it and may reply. Use the
                credentials below to check back.
              </p>
            </div>
          </div>

          {/* Urgency notice */}
          {isUrgent && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">
                  This may need urgent attention
                </p>
                <p className="text-amber-800 mt-1">
                  If you or someone else is in immediate danger, please call{" "}
                  <strong>999</strong> (emergency) or reach out now:
                </p>
                <ul className="mt-2 space-y-1 text-amber-800">
                  <li>
                    Crisis line:{" "}
                    <strong>{URGENCY_RESOURCES.phone}</strong> (call or text)
                  </li>
                  {URGENCY_RESOURCES.counselorContact && (
                    <li>
                      School counselor:{" "}
                      <strong>{URGENCY_RESOURCES.counselorContact}</strong>
                    </li>
                  )}
                  <li>
                    Childline: <strong>0800 1111</strong> (free, 24/7)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Credentials card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Save your access credentials
              </CardTitle>
              <CardDescription>
                These are shown <strong>only once</strong>. Write them down or
                copy them somewhere safe. You will need both to check back on
                your report.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Case ID
                </p>
                <p className="font-mono text-xl font-semibold tracking-widest text-foreground">
                  {caseId}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Passphrase
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
                {copied ? "Copied!" : "Copy Case ID + Passphrase"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Your privacy:</strong> No
                names, email addresses, IP addresses, or device information were
                stored with this report.
              </p>
              <p>
                To see staff replies, visit{" "}
                <Link
                  href="/check-in"
                  className="underline text-foreground hover:text-primary"
                >
                  safereport/check-in
                </Link>{" "}
                and enter your Case ID and passphrase.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/check-in">Go to check-in</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">Submit another report</Link>
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
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
