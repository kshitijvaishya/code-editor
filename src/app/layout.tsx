import type { Metadata } from "next";
import "./globals.css";
import { initializeDatabase } from "@/lib/initDb";

// Initialize database indexes on server startup
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}

export const metadata: Metadata = {
  title: "Code Compiler",
  description: "Online code compiler supporting C, C++, Python, Java, and JavaScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
