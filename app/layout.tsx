import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import "./globals.css";
 
export const metadata: Metadata = {
  title: "SafeReport | গোপন স্কুল সেফটি রিপোর্ট",
  description:
    "নাম না জানিয়ে নিরাপত্তা, ভালো থাকা বা আচরণ নিয়ে উদ্বেগ জানাও। কোনো অ্যাকাউন্ট, নাম বা যোগাযোগের তথ্য লাগবে না।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
