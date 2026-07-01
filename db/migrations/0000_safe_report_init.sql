-- SafeReport initial schema
-- Replaces the starter-kit's original migration.
-- Run via: npm run db:migrate

CREATE TYPE "public"."report_status" AS ENUM('new', 'in_review', 'resolved');
--> statement-breakpoint

-- ── Better Auth tables ────────────────────────────────────────────────────────

CREATE TABLE "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "emailVerified" boolean DEFAULT false NOT NULL,
  "image" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint

CREATE TABLE "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL,
  CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint

CREATE TABLE "account" (
  "id" text PRIMARY KEY NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- ── Application tables ────────────────────────────────────────────────────────
-- ANONYMITY CONTRACT: reports and replies contain NO IP address, NO reporter
-- name, NO email, NO device fingerprint of any kind.

CREATE TABLE "reports" (
  "id" text PRIMARY KEY NOT NULL,          -- nanoid shown to reporter as Case ID
  "category" text NOT NULL,
  "content" text NOT NULL,
  "passphrase_hash" text NOT NULL,         -- scrypt hash; plaintext never stored
  "status" "report_status" DEFAULT 'new' NOT NULL,
  "assigned_staff_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "replies" (
  "id" text PRIMARY KEY NOT NULL,
  "report_id" text NOT NULL,
  "sender_type" text NOT NULL,             -- 'staff' | 'reporter'
  "content" text NOT NULL,
  "staff_id" text,                         -- NULL for reporter replies
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "category_routing" (
  "category" text PRIMARY KEY NOT NULL,
  "staff_email" text NOT NULL
);
--> statement-breakpoint

-- ── Foreign keys ──────────────────────────────────────────────────────────────

ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade;
--> statement-breakpoint

ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade;
--> statement-breakpoint

ALTER TABLE "reports" ADD CONSTRAINT "reports_assigned_staff_id_user_id_fk"
  FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."user"("id") ON DELETE set null;
--> statement-breakpoint

ALTER TABLE "replies" ADD CONSTRAINT "replies_report_id_reports_id_fk"
  FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade;
--> statement-breakpoint

ALTER TABLE "replies" ADD CONSTRAINT "replies_staff_id_user_id_fk"
  FOREIGN KEY ("staff_id") REFERENCES "public"."user"("id") ON DELETE set null;
--> statement-breakpoint

-- ── Default category routing ──────────────────────────────────────────────────
-- Update these values via SQL or the env vars in .env.local

INSERT INTO "category_routing" ("category", "staff_email") VALUES
  ('bullying_harassment',  'admin@school.edu'),
  ('safety_hazard',        'admin@school.edu'),
  ('mental_health_concern','counselor@school.edu'),
  ('abuse_exploitation',   'safeguarding@school.edu'),
  ('academic_dishonesty',  'principal@school.edu'),
  ('policy_complaint',     'admin@school.edu'),
  ('other',                'admin@school.edu')
ON CONFLICT ("category") DO NOTHING;
