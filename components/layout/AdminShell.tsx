"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; username: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Do not render shell on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  const getPageTitle = () => {
    if (pathname === "/") return "Executive Dashboard";
    if (pathname.startsWith("/clients")) return "Registered Clients";
    if (pathname.startsWith("/programs")) return "Programs Management";
    if (pathname.startsWith("/team")) return "Team Members & Coaches";
    if (pathname.startsWith("/events")) return "Upcoming Events";
    if (pathname.startsWith("/popups")) return "Website Popups";
    if (pathname.startsWith("/community")) return "Community & Past Showcases";
    if (pathname.startsWith("/blog")) return "Blog Posts & Articles";
    if (pathname.startsWith("/inquiries")) return "Contact Inquiries";
    if (pathname.startsWith("/settings")) return "Gym Facility Settings";
    return "Admin Portal";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f3f3f3] flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle()}
          user={user}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
