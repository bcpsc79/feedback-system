import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { CATEGORY_LABELS, replies, reports, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }

  const { id } = await params;

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
    .where(eq(reports.id, id))
    .limit(1);

  if (!report) {
    return NextResponse.json({ error: "রিপোর্ট পাওয়া যায়নি।" }, { status: 404 });
  }

  const threadReplies = await db
    .select({
      id: replies.id,
      senderType: replies.senderType,
      content: replies.content,
      createdAt: replies.createdAt,
      staffId: replies.staffId,
      staffName: user.name,
    })
    .from(replies)
    .leftJoin(user, eq(replies.staffId, user.id))
    .where(eq(replies.reportId, id))
    .orderBy(replies.createdAt);

  return NextResponse.json({
    ...report,
    categoryLabel: CATEGORY_LABELS[report.category as keyof typeof CATEGORY_LABELS] ?? report.category,
    replies: threadReplies,
  });
}
