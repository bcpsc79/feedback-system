"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function StaffReplyForm({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/reports/${reportId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) {
        toast.error("Failed to send reply. Please try again.");
        return;
      }
      setContent("");
      toast.success("Reply sent.");
      router.refresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Write a response to the reporter. This will be visible to them when they check in with their Case ID."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        maxLength={3000}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground text-right">{content.length}/3000</p>
      <Button type="submit" disabled={submitting || !content.trim()}>
        {submitting ? "Sending…" : "Send reply"}
      </Button>
    </form>
  );
}
