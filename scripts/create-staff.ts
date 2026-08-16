/**
 * Creates a staff user directly via the running Next.js server.
 * Usage: npx tsx scripts/create-staff.ts <email> <password> <name>
 */

async function main() {
  const [, , email, password, name = "Staff"] = process.argv;

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-staff.ts <email> <password> [name]");
    process.exit(1);
  }

  const res = await fetch("http://localhost:3000/api/auth/sign-up/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to create user:", errorText);
    process.exit(1);
  }

  console.log(`✓ Staff account created: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err?.message ?? err);
  process.exit(1);
});
