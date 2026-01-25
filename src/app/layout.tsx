import type { Metadata } from "next";
import "./globals.css";

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
