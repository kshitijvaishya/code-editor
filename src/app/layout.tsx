import type { Metadata } from "next";
import "./globals.css";
import { initializeDatabase } from "@/lib/initDb";

// Initialize database indexes on server startup
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}

export const metadata: Metadata = {
  title: "DSA PLAYGROUND - 2K26 | TECHzHUT Coding Club",
  description: "Join us for an electrifying DSA Playground experience of creativity, problem-solving, and next-level coding!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
