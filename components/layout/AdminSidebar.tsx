"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "Registered Clients", href: "/clients", icon: "group" },
    { name: "Programs CMS", href: "/programs", icon: "fitness_center" },
    { name: "Team Members", href: "/team", icon: "badge" },
    { name: "Upcoming Events", href: "/events", icon: "event" },
    { name: "Community & Past", href: "/community", icon: "auto_awesome" },
    { name: "Blog Posts", href: "/blog", icon: "article" },
    { name: "Inquiries", href: "/inquiries", icon: "mail" },
    { name: "Gym Settings", href: "/settings", icon: "settings" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#111111] border-r border-white/5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="block">
              <span className="font-impact text-3xl tracking-wider text-white uppercase block leading-none">
                GET <span className="text-primary">FIT</span>
              </span>
              <span className="text-[10px] uppercase font-inter tracking-widest text-white/40 block mt-1.5 font-semibold">
                Admin Portal
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-inter text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-primary text-black font-bold shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isActive ? "text-black font-bold" : "text-zinc-400"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Live Website Preview + Sign Out */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-inter text-xs font-semibold text-zinc-300 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg text-primary">
              open_in_new
            </span>
            <span>Live Website</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-inter text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
