import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { CATEGORY_LABELS, replies, reports, user, type Category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { StaffReportUI } from "./_components/staff-report-ui";

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
    <StaffReportUI 
      report={report} 
      categoryLabel={categoryLabel} 
      threadReplies={threadReplies} 
    />
  );
}
