import { createHmac } from "crypto";

// Short-lived signed token proving the bearer successfully verified a case's passphrase.
// Contains only the caseId — no reporter identity whatsoever.
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s) throw new Error("BETTER_AUTH_SECRET is not set");
  return s;
}

export function signReporterToken(caseId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ caseId, exp: Date.now() + TTL_MS })
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyReporterToken(
  token: string,
  expectedCaseId: string
): boolean {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  if (sig !== expectedSig) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.caseId === expectedCaseId && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}
