import {
  boolean,
  pgTable,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Better Auth tables ────────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  // ipAddress and userAgent intentionally omitted — we do not log staff device metadata
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ── Report categories ─────────────────────────────────────────────────────────

export const CATEGORIES = [
  "bullying_harassment",
  "safety_hazard",
  "mental_health_concern",
  "abuse_exploitation",
  "academic_dishonesty",
  "policy_complaint",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  bullying_harassment: "Bullying / Harassment",
  safety_hazard: "Safety Hazard",
  mental_health_concern: "Mental Health Concern",
  abuse_exploitation: "Abuse / Exploitation",
  academic_dishonesty: "Academic Dishonesty",
  policy_complaint: "Policy Complaint",
  other: "Other",
};

// Categories that display an urgency notice on the confirmation screen
export const URGENT_CATEGORIES: Category[] = [
  "abuse_exploitation",
  "mental_health_concern",
];

// ── Report status ─────────────────────────────────────────────────────────────

export const reportStatusEnum = pgEnum("report_status", [
  "new",
  "in_review",
  "resolved",
]);

export type ReportStatus = "new" | "in_review" | "resolved";

// ── Reports table ─────────────────────────────────────────────────────────────
// ANONYMITY CONTRACT: no IP address, no reporter name, no device fingerprint,
// no email, no user agent — ever stored here.

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),             // nanoid — shown to reporter as their Case ID
  category: text("category").notNull(),
  content: text("content").notNull(),
  passphraseHash: text("passphrase_hash").notNull(), // scrypt hash; plaintext never stored
  status: reportStatusEnum("status").notNull().default("new"),
  assignedStaffId: text("assigned_staff_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Replies table ─────────────────────────────────────────────────────────────
// ANONYMITY CONTRACT: reporter replies carry no identity. Staff replies link
// only to a staff user ID (needed for attribution within the staff dashboard).

export const replies = pgTable("replies", {
  id: text("id").primaryKey(),             // nanoid
  reportId: text("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  senderType: text("sender_type").notNull(), // "staff" | "reporter"
  content: text("content").notNull(),
  staffId: text("staff_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Category routing table ────────────────────────────────────────────────────
// Maps each category slug to a staff email address for notification routing.
// Seeded via migration; can be updated in the staff dashboard (future).

export const categoryRouting = pgTable("category_routing", {
  category: text("category").primaryKey(),
  staffEmail: text("staff_email").notNull(),
});
