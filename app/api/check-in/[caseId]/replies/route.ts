import { db } from "@/db/drizzle";
import { replies, reports } from "@/db/schema";
import { verifyReporterToken } from "@/lib/reporter-token";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789", 21);

const schema = z.object({
  content: z.string().min(1).max(3000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("reporter_token")?.value ?? "";
  if (!verifyReporterToken(token, caseId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Confirm the report exists
  const report = await db
    .select({ id: reports.id })
    .from(reports)
    .where(eq(reports.id, caseId))
    .limit(1);

  if (!report.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Content required (max 3000 chars)" }, { status: 422 });
  }

  // Reporter replies carry no identity fields whatsoever — staffId is null.
  await db.insert(replies).values({
    id: nanoid(),
    reportId: caseId,
    senderType: "reporter",
    content: parsed.data.content,
    staffId: null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
