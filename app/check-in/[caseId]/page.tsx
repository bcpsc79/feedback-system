import { Card, CardContent, CardHeader, Typography, Divider } from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import { db } from "@/db/drizzle";
import { CATEGORY_LABELS, replies, reports, type Category } from "@/db/schema";
import { verifyReporterToken } from "@/lib/reporter-token";
import { format } from "date-fns";
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
    new: "নতুন, এখনো দেখা হয়নি",
    in_review: "পর্যালোচনায় আছে",
    resolved: "সমাধান হয়েছে",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
            BCPSC Report System
          </Link>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          কেস {report.id}
        </span>
      </header>

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full space-y-5">
        {/* Report summary */}
        <Card>
          <CardHeader
            title={<Typography variant="h6" component="div" className="text-base font-semibold">{categoryLabel}</Typography>}
            subheader={<Typography variant="body2" className="mt-1">জমা হয়েছে {format(new Date(report.createdAt), "dd/MM/yyyy")}</Typography>}
            action={<StatusBadge status={report.status} label={statusLabel[report.status] ?? report.status} />}
          />
          <CardContent>
            <Typography variant="body2" className="whitespace-pre-wrap">
              {report.content}
            </Typography>
          </CardContent>
        </Card>

        {/* Thread */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">
              কথোপকথন
            </h2>
          </div>

          {threadReplies.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              এখনো কোনো উত্তর নেই। পরে আবার দেখে নিও।
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
                {r.senderType === "staff" ? "স্টাফের উত্তর" : "তোমার বার্তা"} ·{" "}
                {format(new Date(r.createdAt), "dd/MM/yyyy, HH:mm")}
              </p>
              <p className="text-foreground whitespace-pre-wrap">{r.content}</p>
            </div>
          ))}
        </div>

        <Divider />

        {/* Reporter reply form */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">বার্তা যোগ করো</h2>
          <ReporterReplyForm caseId={caseId} />
        </div>

        <p className="text-xs text-muted-foreground text-center pb-4">
          ব্রাউজার বন্ধ করলে এই সেশন শেষ হয়ে যাবে।{" "}
          <Link href="/check-in" className="underline hover:text-foreground">
            আবার খবর দেখো
          </Link>{" "}
          যেকোনো সময় কেস আইডি ও পাসফ্রেজ দিয়ে।
        </p>
      </main>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    new: "bg-secondary text-secondary-foreground border-warning/50",
    in_review: "bg-sidebar-primary/10 text-accent border-sidebar-primary/30",
    resolved: "bg-success/10 text-success border-success/30",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colors[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {label}
    </span>
  );
}
