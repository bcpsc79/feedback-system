"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ReporterReplyForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/check-in/${caseId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.status === 401) {
        toast.error("Session expired. Please check in again.");
        router.push("/check-in");
        return;
      }
      if (!res.ok) {
        toast.error("Failed to send. Please try again.");
        return;
      }
      setContent("");
      toast.success("Message sent.");
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
        placeholder="Add information or ask a question. Do not include your name or contact details."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={3000}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground text-right">{content.length}/3000</p>
      <Button type="submit" disabled={submitting || !content.trim()}>
        {submitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
