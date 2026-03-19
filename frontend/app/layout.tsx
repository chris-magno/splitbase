import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SplitBase — Split bills. Settle with ETH.",
  description:
    "No more 'I'll pay you back.' Create groups by Basename, log expenses, settle debts on Base.",
  openGraph: {
    title: "SplitBase",
    description: "Split bills with friends. Settle with ETH.",
    siteName: "SplitBase",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
