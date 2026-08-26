"use client";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  user?: { name: string; username: string; role: string } | null;
}

export default function AdminHeader({
  onToggleSidebar,
  title,
  user,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg bg-surface border border-white/10 hover:border-primary/40 text-zinc-300 hover:text-white lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        {title && (
          <h1 className="text-xl sm:text-2xl font-impact text-white uppercase tracking-tight italic">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* User Profile Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {user?.name ? user.name.charAt(0) : "A"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-inter font-semibold text-white leading-tight">
              {user?.name || "Admin"}
            </div>
            <div className="text-[10px] font-inter text-zinc-500">
              @{user?.username || "admin"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
