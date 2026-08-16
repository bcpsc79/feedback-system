"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
} from "@mui/material";
import { CATEGORY_LABELS } from "@/db/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from 'next/image';
import { CldUploadWidget } from "next-cloudinary";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [string, string][];

export default function ReportPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      toast.error("একটি বিষয় বেছে নাও।");
      return;
    }
    if (content.trim().length < 10) {
      toast.error("ঘটনাটি অন্তত ১০ অক্ষরে লিখে বোঝাও।");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No cookies, no credentials — purely anonymous
        body: JSON.stringify({ category, content: content.trim(), imageIds }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "জমা দেওয়া যায়নি। আবার চেষ্টা করো।");
        return;
      }

      const { caseId, passphrase } = await res.json();
      router.push(
        `/confirmation?caseId=${encodeURIComponent(caseId)}&passphrase=${encodeURIComponent(passphrase)}&category=${encodeURIComponent(category)}`,
      );
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করো।");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
    <header className="border-b px-8 py-4 flex items-center justify-between">
      <Link 
        href="/" 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Image
          src="/logo.jpg"
          alt="BCPSC Logo"
          width={37}
          height={37}
          className="object-contain rounded-md"
          priority
        />
      </Link>
      
<Link
  href="/check-in"
  className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors shadow-sm"
>
  রিপোর্টের খবর দেখো
</Link>

    </header>


      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              নাম না জানিয়ে রিপোর্ট করো
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
              তোমার রিপোর্ট সম্পূর্ণ গোপন থাকবে। কোনো অ্যাকাউন্ট, নাম বা
              যোগাযোগের তথ্য লাগবে না এবং রাখা হবে না। জমা দেওয়ার পর তুমি একটি
              ব্যক্তিগত <strong>কেস আইডি</strong> ও <strong>পাসফ্রেজ</strong>{" "}
              পাবে, যাতে পরে উত্তর দেখতে পারো।
            </p>
          </div>

          <Card>
            <CardHeader
              title={
                <Typography variant="h6" className="text-base" align="center">
                  রিপোর্টের বিস্তারিত
                </Typography>
              }
              subheader={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  যতটা পারো পরিষ্কারভাবে ঘটনাটি লিখো। দায়িত্বপ্রাপ্ত স্টাফ
                  গোপনভাবেই দেখে উত্তর দেবেন।
                </Typography>
              }
            />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <FormControl fullWidth size="small">
                    <InputLabel id="category-label">বিষয়</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      value={category}
                      label="বিষয়"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="" disabled>
                        <em>একটি বিষয় বেছে নাও...</em>
                      </MenuItem>
                      {CATEGORIES.map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="space-y-2">
                  <TextField
                    fullWidth
                    id="content"
                    label="ঘটনার বর্ণনা"
                    placeholder="কি ঘটেছে, কখন ঘটেছে, কোথায় ঘটেছে লিখো। নিজের নাম বা যোগাযোগের তথ্য দিও না। রিপোর্টটি গোপন থাকবে।"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    rows={6}
                    inputProps={{ maxLength: 5000 }}
                    required
                    size="small"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.length}/5000
                  </p>
                </div>

                <div className="space-y-2">
                  <InputLabel className="text-sm font-medium">ছবি যোগ করো (সর্বোচ্চ ৬টি)</InputLabel>
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50/50">
                    <CldUploadWidget 
                      uploadPreset="ml_default" 
                      options={{
                        multiple: true,
                        maxFiles: 6,
                      }}
                      onSuccess={(result: { info?: string | { public_id?: string } }) => {
                        const info = typeof result?.info === 'object' ? result.info : null;
                        if (info?.public_id) {
                          setImageIds(prev => {
                            // Don't add duplicates and respect max 6
                            if (prev.includes(info.public_id!) || prev.length >= 6) return prev;
                            return [...prev, info.public_id!];
                          });
                          toast.success("ছবি সফলভাবে আপলোড হয়েছে");
                        }
                      }}
                    >
                      {({ open }) => {
                        return (
                          <div className="flex flex-col items-center gap-3 w-full">
                            {imageIds.length > 0 ? (
                              <div className="flex flex-col w-full gap-2">
                                {imageIds.map((id, index) => (
                                  <div key={id} className="flex items-center justify-between w-full bg-white p-3 rounded-md border shadow-sm">
                                    <span className="text-sm text-green-700 font-medium">Image {index + 1}</span>
                                    <Button 
                                      variant="outlined" 
                                      color="error" 
                                      size="small"
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        setImageIds(prev => prev.filter(i => i !== id));
                                        try {
                                          await fetch("/api/delete-image", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ publicId: id }),
                                          });
                                          toast.success("ছবি মুছে ফেলা হয়েছে");
                                        } catch (err) {
                                          console.error("Failed to delete image:", err);
                                        }
                                      }}
                                    >
                                      মুছে ফেলুন
                                    </Button>
                                  </div>
                                ))}
                                {imageIds.length < 6 && (
                                  <Button 
                                    variant="text" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      open();
                                    }}
                                  >
                                    আরও ছবি আপলোড করুন
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Button 
                                variant="outlined" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  open();
                                }}
                              >
                                ছবি আপলোড করুন
                              </Button>
                            )}
                          </div>
                        );
                      }}
                    </CldUploadWidget>
                  </div>
                </div>

                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  disabled={submitting}
                >
                  {submitting ? "জমা হচ্ছে..." : "রিপোর্ট জমা দাও"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            আগে রিপোর্ট জমা দিয়েছ?{" "}
            <Link href="/check-in" className="underline hover:text-foreground">
              কেস আইডি দিয়ে খবর দেখো
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
