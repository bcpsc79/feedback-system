import { db } from "@/db/drizzle";
import { CATEGORIES, type Category, reports } from "@/db/schema";
import { generateCaseId, generatePassphrase, hashPassphrase } from "@/lib/passphrase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const categoryEnum = [...CATEGORIES] as [Category, ...Category[]];

const schema = z.object({
  category: z.enum(categoryEnum),
  content: z.string().min(10, "Please describe the incident in at least 10 characters.").max(5000),
});

export async function POST(req: NextRequest) {
  // Strict anonymity: we explicitly do NOT read or log req.ip, headers["x-forwarded-for"],
  // user-agent, or any other fingerprinting metadata.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { category, content } = parsed.data;
  const caseId = generateCaseId();
  const passphrase = generatePassphrase();
  const passphraseHash = await hashPassphrase(passphrase);

  await db.insert(reports).values({
    id: caseId,
    category,
    content,
    passphraseHash,
    status: "new",
  });

  // Return the plaintext passphrase exactly ONCE. It is never stored.
  return NextResponse.json({ caseId, passphrase }, { status: 201 });
}
