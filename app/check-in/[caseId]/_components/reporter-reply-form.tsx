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
        toast.error("সেশন শেষ হয়েছে। আবার কেস আইডি দিয়ে ঢুকো।");
        router.push("/check-in");
        return;
      }
      if (!res.ok) {
        toast.error("পাঠানো যায়নি। আবার চেষ্টা করো।");
        return;
      }
      setContent("");
      toast.success("বার্তা পাঠানো হয়েছে।");
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="আরও তথ্য লিখো বা প্রশ্ন করো। নিজের নাম বা যোগাযোগের তথ্য দিও না।"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={3000}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground text-right">{content.length}/3000</p>
      <Button type="submit" disabled={submitting || !content.trim()}>
        {submitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠাও"}
      </Button>
    </form>
  );
}
