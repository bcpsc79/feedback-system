import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { CATEGORY_LABELS, replies, reports, user, type Category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StaffReplyForm } from "./_components/staff-reply-form";
import { StatusSelector } from "./_components/status-selector";

type Props = { params: Promise<{ reportId: string }> };

export default async function StaffReportPage({ params }: Props) {
  const { reportId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/staff/sign-in");

  const [report] = await db
    .select({
      id: reports.id,
      category: reports.category,
      content: reports.content,
      status: reports.status,
      createdAt: reports.createdAt,
      assignedStaffId: reports.assignedStaffId,
      assignedStaffName: user.name,
    })
    .from(reports)
    .leftJoin(user, eq(reports.assignedStaffId, user.id))
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report) notFound();

  const threadReplies = await db
    .select({
      id: replies.id,
      senderType: replies.senderType,
      content: replies.content,
      createdAt: replies.createdAt,
      staffName: user.name,
    })
    .from(replies)
    .leftJoin(user, eq(replies.staffId, user.id))
    .where(eq(replies.reportId, reportId))
    .orderBy(replies.createdAt);

  const categoryLabel = CATEGORY_LABELS[report.category as Category] ?? report.category;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/staff/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All reports
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-sm text-foreground">{report.id}</span>
      </div>

      {/* Report details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base">{categoryLabel}</CardTitle>
              <CardDescription>
                Submitted {format(new Date(report.createdAt), "dd MMM yyyy, HH:mm")}
                {report.assignedStaffName && ` · Assigned to ${report.assignedStaffName}`}
              </CardDescription>
            </div>
            <StatusSelector reportId={report.id} currentStatus={report.status} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {report.content}
          </p>
        </CardContent>
      </Card>

      {/* Anonymity reminder */}
      <p className="text-xs text-muted-foreground bg-muted/30 border rounded-lg px-4 py-3">
        <strong>Anonymity reminder:</strong> No reporter name, email, or device information
        is stored. Reply thoughtfully. The reporter will see your response when they check in.
      </p>

      {/* Thread */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Conversation thread</h2>

        {threadReplies.length === 0 && (
          <p className="text-sm text-muted-foreground py-3">No messages yet.</p>
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
              {r.senderType === "staff"
                ? `Staff (${r.staffName ?? "unknown"})`
                : "Anonymous reporter"}{" "}
              · {format(new Date(r.createdAt), "dd MMM yyyy, HH:mm")}
            </p>
            <p className="text-foreground whitespace-pre-wrap">{r.content}</p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Staff reply form */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Reply to reporter</h2>
        <StaffReplyForm reportId={report.id} />
      </div>
    </div>
  );
}
