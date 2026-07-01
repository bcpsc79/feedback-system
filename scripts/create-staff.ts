/**
 * Creates a staff user directly in the database (no running server needed).
 * Usage: npx tsx scripts/create-staff.ts <email> <password> <name>
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { auth } from "../lib/auth";

async function main() {
  const [, , email, password, name = "Staff"] = process.argv;

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-staff.ts <email> <password> [name]");
    process.exit(1);
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  if (!result?.user) {
    console.error("Failed to create user:", result);
    process.exit(1);
  }

  console.log(`✓ Staff account created: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err?.message ?? err);
  process.exit(1);
});
