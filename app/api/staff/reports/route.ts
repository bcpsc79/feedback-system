import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { CATEGORY_LABELS, reports, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "অনুমতি নেই।" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: reports.id,
      category: reports.category,
      status: reports.status,
      createdAt: reports.createdAt,
      assignedStaffId: reports.assignedStaffId,
      assignedStaffName: user.name,
    })
    .from(reports)
    .leftJoin(user, eq(reports.assignedStaffId, user.id))
    .orderBy(desc(reports.createdAt));

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      categoryLabel: CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] ?? r.category,
    }))
  );
}
