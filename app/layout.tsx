import type { Metadata } from "next";
import "./globals.css";
import AdminShell from "@/components/layout/AdminShell";

export const metadata: Metadata = {
  title: "Get Fit Gym - Admin Management Portal",
  description: "Executive portal for managing clients, programs, events, team members, and content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
