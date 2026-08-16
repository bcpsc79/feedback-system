"use client";

import { Card, CardContent, CardHeader, Typography, Divider } from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import { format } from "date-fns";
import Link from "next/link";
import { ReporterReplyForm } from "./reporter-reply-form";

type ThreadUIProps = {
  caseId: string;
  categoryLabel: string;
  status: string;
  statusLabel: string;
  reportCreatedAt: Date | string;
  reportContent: string;
  threadReplies: {
    id: string;
    senderType: string;
    content: string;
    createdAt: Date | string;
  }[];
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    new: "bg-secondary text-secondary-foreground border-warning/50",
    in_review: "bg-sidebar-primary/10 text-accent border-sidebar-primary/30",
    resolved: "bg-success/10 text-success border-success/30",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colors[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {label}
    </span>
  );
}

export function ReporterThreadUI({
  caseId,
  categoryLabel,
  status,
  statusLabel,
  reportCreatedAt,
  reportContent,
  threadReplies,
}: ThreadUIProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">
            BCPSC Report System
          </Link>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          কেস {caseId}
        </span>
      </header>

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full space-y-5">
        <Card>
          <CardHeader
            title={<Typography variant="h6" component="div" className="text-base font-semibold">{categoryLabel}</Typography>}
            subheader={<Typography variant="body2" className="mt-1">জমা হয়েছে {format(new Date(reportCreatedAt), "dd/MM/yyyy")}</Typography>}
            action={<StatusBadge status={status} label={statusLabel} />}
          />
          <CardContent>
            <Typography variant="body2" className="whitespace-pre-wrap">
              {reportContent}
            </Typography>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">
              কথোপকথন
            </h2>
          </div>

          {threadReplies.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              এখনো কোনো উত্তর নেই। পরে আবার দেখে নিও।
            </p>
          )}

          {threadReplies.map((r) => (
            <div
              key={r.id}
              className={`rounded-lg border p-4 text-sm space-y-1 ${
                r.senderType === "staff"
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/30"
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {r.senderType === "staff" ? "স্টাফের উত্তর" : "তোমার বার্তা"} ·{" "}
                {format(new Date(r.createdAt), "dd/MM/yyyy, HH:mm")}
              </p>
              <p className="text-foreground whitespace-pre-wrap">{r.content}</p>
            </div>
          ))}
        </div>

        <Divider />

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">বার্তা যোগ করো</h2>
          <ReporterReplyForm caseId={caseId} />
        </div>

        <p className="text-xs text-muted-foreground text-center pb-4">
          ব্রাউজার বন্ধ করলে এই সেশন শেষ হয়ে যাবে।{" "}
          <Link href="/check-in" className="underline hover:text-foreground">
            আবার খবর দেখো
          </Link>{" "}
          যেকোনো সময় কেস আইডি ও পাসফ্রেজ দিয়ে।
        </p>
      </main>
    </div>
  );
}
