import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/db/drizzle";
import { CATEGORY_LABELS, replies, reports, type Category } from "@/db/schema";
import { verifyReporterToken } from "@/lib/reporter-token";
import { format } from "date-fns";
import { MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ReporterReplyForm } from "./_components/reporter-reply-form";

type Props = { params: Promise<{ caseId: string }> };

export default async function ReporterThreadPage({ params }: Props) {
  const { caseId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("reporter_token")?.value ?? "";

  if (!verifyReporterToken(token, caseId)) {
    redirect(`/check-in?error=session_expired`);
  }

  const [report] = await db
    .select({
      id: reports.id,
      category: reports.category,
      content: reports.content,
      status: reports.status,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(eq(reports.id, caseId))
    .limit(1);

  if (!report) notFound();

  const threadReplies = await db
    .select({
      id: replies.id,
      senderType: replies.senderType,
      content: replies.content,
      createdAt: replies.createdAt,
    })
    .from(replies)
    .where(eq(replies.reportId, caseId))
    .orderBy(replies.createdAt);

  const categoryLabel =
    CATEGORY_LABELS[report.category as Category] ?? report.category;

  const statusLabel: Record<string, string> = {
    new: "New — awaiting review",
    in_review: "Under review",
    resolved: "Resolved",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
            SafeReport
          </Link>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Case {report.id}
        </span>
      </header>

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full space-y-5">
        {/* Report summary */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base">{categoryLabel}</CardTitle>
                <CardDescription className="mt-1">
                  Submitted {format(new Date(report.createdAt), "dd MMM yyyy")}
                </CardDescription>
              </div>
              <StatusBadge status={report.status} label={statusLabel[report.status] ?? report.status} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {report.content}
            </p>
          </CardContent>
        </Card>

        {/* Thread */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">
              Conversation thread
            </h2>
          </div>

          {threadReplies.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No replies yet. Check back later.
            </p>
          )}

          {threadReplies.map((r) => (
            <div
              key={r.id}
              className={`rounded-lg border p-4 text-sm space-y-1 ${
                r.senderType === "staff"
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/30"
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {r.senderType === "staff" ? "Staff response" : "Your message"} ·{" "}
                {format(new Date(r.createdAt), "dd MMM yyyy, HH:mm")}
              </p>
              <p className="text-foreground whitespace-pre-wrap">{r.content}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Reporter reply form */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Add a message</h2>
          <ReporterReplyForm caseId={caseId} />
        </div>

        <p className="text-xs text-muted-foreground text-center pb-4">
          This session expires when you close your browser.{" "}
          <Link href="/check-in" className="underline hover:text-foreground">
            Check in again
          </Link>{" "}
          anytime with your Case ID and passphrase.
        </p>
      </main>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    new: "bg-[#e8f0d8] text-[#283618] border-[#606c38]/30",
    in_review: "bg-[#fef3e2] text-[#bc6c25] border-[#dda15e]/40",
    resolved: "bg-[#d4e0b8] text-[#283618] border-[#606c38]/50",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colors[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {label}
    </span>
  );
}
