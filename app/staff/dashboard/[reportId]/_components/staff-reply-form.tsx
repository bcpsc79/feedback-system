"use client";

import { Button, TextField, Typography, Box } from "@mui/material";
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
        toast.error("উত্তর পাঠানো যায়নি। আবার চেষ্টা করুন।");
        return;
      }
      setContent("");
      toast.success("উত্তর পাঠানো হয়েছে।");
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextField
        placeholder="রিপোর্টকারীকে উত্তর লিখুন। তারা কেস আইডি দিয়ে ঢুকলে এই উত্তর দেখতে পাবে।"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        multiline
        rows={5}
        inputProps={{ maxLength: 3000 }}
        fullWidth
      />
      <Typography variant="caption" color="text.secondary" align="right" display="block">
        {content.length}/3000
      </Typography>
      <Button 
        type="submit" 
        variant="contained" 
        disabled={submitting || !content.trim()}
      >
        {submitting ? "পাঠানো হচ্ছে..." : "উত্তর পাঠান"}
      </Button>
    </Box>
  );
}
