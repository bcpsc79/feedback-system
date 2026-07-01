import { db } from "@/db/drizzle";
import { reports } from "@/db/schema";
import { verifyPassphrase } from "@/lib/passphrase";
import { signReporterToken } from "@/lib/reporter-token";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  caseId: z.string().min(1),
  passphrase: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing case ID or passphrase" }, { status: 422 });
  }

  const { caseId, passphrase } = parsed.data;

  const report = await db
    .select({ passphraseHash: reports.passphraseHash })
    .from(reports)
    .where(eq(reports.id, caseId))
    .limit(1);

  // Use a constant-time failure message regardless of whether the case ID exists
  // to avoid leaking which case IDs are in the system.
  const valid = report.length > 0 && (await verifyPassphrase(passphrase, report[0].passphraseHash));

  if (!valid) {
    return NextResponse.json({ error: "Incorrect case ID or passphrase." }, { status: 401 });
  }

  const token = signReporterToken(caseId);

  const res = NextResponse.json({ ok: true, caseId });
  res.cookies.set("reporter_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Session cookie: expires when browser closes. No maxAge = no persistent storage.
  });
  return res;
}
