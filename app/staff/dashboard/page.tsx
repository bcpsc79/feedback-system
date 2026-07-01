import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { CATEGORY_LABELS, reports, user, type Category } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StaffDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/staff/sign-in");

  const rows = await db
    .select({
      id: reports.id,
      category: reports.category,
      status: reports.status,
      createdAt: reports.createdAt,
      assignedStaffName: user.name,
    })
    .from(reports)
    .leftJoin(user, eq(reports.assignedStaffId, user.id))
    .orderBy(desc(reports.createdAt));

  const statusColors: Record<string, string> = {
    new: "bg-[#e8f0d8] text-[#283618] border-[#606c38]/30",
    in_review: "bg-[#fef3e2] text-[#bc6c25] border-[#dda15e]/40",
    resolved: "bg-[#d4e0b8] text-[#283618] border-[#606c38]/50",
  };

  const statusLabels: Record<string, string> = {
    new: "New",
    in_review: "In review",
    resolved: "Resolved",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">All Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rows.length} report{rows.length !== 1 ? "s" : ""} total · No reporter identity is stored or displayed.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No reports yet.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Case ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Submitted</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assigned to</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((report, i) => (
                <tr
                  key={report.id}
                  className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {report.id}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {CATEGORY_LABELS[report.category as Category] ?? report.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[report.status] ?? ""}`}>
                      {statusLabels[report.status] ?? report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(report.createdAt), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {report.assignedStaffName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/staff/dashboard/${report.id}`}
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
