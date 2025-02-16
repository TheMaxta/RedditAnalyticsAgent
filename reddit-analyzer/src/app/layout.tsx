import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reddit Analyzer",
  description: "Analyze Reddit posts using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background flex flex-col items-center">
          <div className="flex-1 w-full max-w-7xl px-4 py-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}