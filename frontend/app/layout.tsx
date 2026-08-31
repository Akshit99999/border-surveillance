import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BorderLens — Intelligent Border Video Analytics",
  description: "Next-generation stark tactical surveillance command terminal and human accountability guard duty system for border security.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#131313] text-[#e5e2e1] min-h-screen antialiased selection:bg-white selection:text-black font-sans">
        {children}
      </body>
    </html>
  );
}
