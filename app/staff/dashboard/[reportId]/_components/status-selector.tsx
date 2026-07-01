"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
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
        toast.error("Could not update status.");
        setStatus(currentStatus);
        return;
      }
      toast.success("Status updated.");
      router.refresh();
    } catch {
      toast.error("Network error.");
      setStatus(currentStatus);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger className="w-36 text-xs h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
