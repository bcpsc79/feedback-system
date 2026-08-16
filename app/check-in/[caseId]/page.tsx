import { db } from "@/db/drizzle";
import { CATEGORY_LABELS, replies, reports, type Category } from "@/db/schema";
import { verifyReporterToken } from "@/lib/reporter-token";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ReporterThreadUI } from "./_components/reporter-thread-ui";

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
    <ReporterThreadUI
      caseId={caseId}
      categoryLabel={categoryLabel}
      status={report.status}
      statusLabel={statusLabel[report.status] ?? report.status}
      reportCreatedAt={report.createdAt}
      reportContent={report.content}
      threadReplies={threadReplies}
    />
  );
}
