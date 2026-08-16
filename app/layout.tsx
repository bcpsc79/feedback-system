import { Toaster } from "sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BCPSC Report System | গোপন স্কুল সেফটি রিপোর্ট",
  description:
    "নাম না জানিয়ে নিরাপত্তা, ভালো থাকা বা আচরণ নিয়ে উদ্বেগ জানাও। কোনো অ্যাকাউন্ট, নাম বা যোগাযোগের তথ্য লাগবে না।",
};

import { Anek_Bangla } from "next/font/google";

const anekBangla = Anek_Bangla({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-anek-bangla",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${anekBangla.className} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster toastOptions={{ style: { fontFamily: anekBangla.style.fontFamily } }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
