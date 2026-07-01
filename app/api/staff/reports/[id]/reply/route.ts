import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { replies, reports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789", 21);

const schema = z.object({
  content: z.string().min(1).max(3000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [report] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);

  if (!report) {
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

  await db.insert(replies).values({
    id: nanoid(),
    reportId: id,
    senderType: "staff",
    content: parsed.data.content,
    staffId: session.user.id,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
