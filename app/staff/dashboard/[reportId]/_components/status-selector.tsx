"use client";

import { Select, MenuItem, FormControl } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const OPTIONS = [
  { value: "new", label: "নতুন" },
  { value: "in_review", label: "পর্যালোচনায়" },
  { value: "resolved", label: "সমাধান হয়েছে" },
];

export function StatusSelector({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(value: string) {
    setStatus(value);
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      if (!res.ok) {
        toast.error("স্ট্যাটাস বদলানো যায়নি।");
        setStatus(currentStatus);
        return;
      }
      toast.success("স্ট্যাটাস আপডেট হয়েছে।");
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে।");
      setStatus(currentStatus);
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormControl size="small" sx={{ width: 160 }} disabled={saving}>
      <Select
        value={status}
        onChange={(e) => handleChange(e.target.value as string)}
        sx={{ fontSize: '0.75rem', height: 32 }}
      >
        {OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.75rem' }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
