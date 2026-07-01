import { type Category } from "@/db/schema";

// Category → staff email mapping. Reads from env vars at runtime.
// Defaults are empty strings; the app works without email notification.
const ENV_MAP: Record<Category, string> = {
  bullying_harassment: process.env.CATEGORY_BULLYING_HARASSMENT_EMAIL ?? "",
  safety_hazard: process.env.CATEGORY_SAFETY_HAZARD_EMAIL ?? "",
  mental_health_concern: process.env.CATEGORY_MENTAL_HEALTH_CONCERN_EMAIL ?? "",
  abuse_exploitation: process.env.CATEGORY_ABUSE_EXPLOITATION_EMAIL ?? "",
  academic_dishonesty: process.env.CATEGORY_ACADEMIC_DISHONESTY_EMAIL ?? "",
  policy_complaint: process.env.CATEGORY_POLICY_COMPLAINT_EMAIL ?? "",
  other: process.env.CATEGORY_OTHER_EMAIL ?? "",
};

export function getRoutingEmail(category: Category): string {
  return ENV_MAP[category] ?? "";
}

export const URGENCY_RESOURCES = {
  phone: process.env.URGENCY_PHONE ?? "988",
  counselorContact: process.env.URGENCY_COUNSELOR_CONTACT ?? "",
};
