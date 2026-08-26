"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/stats");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-inter text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats, featuredPopupEvent, recentClients = [], recentInquiries = [] } = data || {};

  const statCards = [
    {
      title: "Registered Clients",
      value: stats?.totalClients || 0,
      subValue: `${stats?.pendingClients || 0} Pending Confirmation`,
      icon: "group",
      href: "/clients",
    },
    {
      title: "Active Programs",
      value: stats?.activePrograms || 0,
      subValue: "Curated Fitness Schedules",
      icon: "fitness_center",
      href: "/programs",
    },
    {
      title: "Coaching Staff",
      value: stats?.totalTeam || 0,
      subValue: "Certified Specialists",
      icon: "badge",
      href: "/team",
    },
    {
      title: "Upcoming Events",
      value: stats?.upcomingEventsCount || 0,
      subValue: "1 Live Popup Featured",
      icon: "event",
      href: "/events",
    },
    {
      title: "Published Articles",
      value: stats?.totalBlogs || 0,
      subValue: "Fitness & Nutrition Guides",
      icon: "article",
      href: "/blog",
    },
    {
      title: "Contact Inquiries",
      value: stats?.unreadInquiries || 0,
      subValue: "Unread Website Submissions",
      icon: "mail",
      href: "/inquiries",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-impact text-white uppercase tracking-tight italic">
            Dashboard <span className="text-primary">Overview</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Real-time management controls synchronized with database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-surface border border-white/5 hover:border-primary/40 text-secondary hover:text-white transition-all cursor-pointer"
            title="Refresh Data"
          >
            <span className={`material-symbols-outlined text-lg ${refreshing ? "animate-spin text-primary" : ""}`}>
              sync
            </span>
          </button>

          <Link
            href="/clients"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
          >
            Add Client
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="p-5 sm:p-6 rounded-2xl bg-surface border border-white/5 hover:border-primary/30 transition-all duration-300 shine-hover block group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-inter font-semibold text-secondary uppercase tracking-wider">
                {card.title}
              </span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-xl">
                  {card.icon}
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-impact text-white tracking-tight">
                {card.value}
              </span>
              <span className="material-symbols-outlined text-zinc-600 group-hover:text-primary text-lg transition-colors">
                arrow_outward
              </span>
            </div>
            <p className="text-xs font-inter text-secondary mt-1.5">
              {card.subValue}
            </p>
          </Link>
        ))}
      </div>

      {/* Active Popup Event Controller Card (Clean & Minimalist, No Sparkle Tag) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-primary/30 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-inter font-bold text-primary tracking-widest uppercase block">
              Active Popup Modal Event
            </span>
            <h3 className="text-2xl sm:text-3xl font-impact text-white uppercase tracking-tight italic">
              {featuredPopupEvent?.title || "No event currently selected for popup"}
            </h3>
            {featuredPopupEvent && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-inter text-secondary pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                  <span>{featuredPopupEvent.timeString}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span>{featuredPopupEvent.location}</span>
                </span>
                <span className="text-primary font-semibold">
                  {featuredPopupEvent.remainingSpots} Spots Remaining
                </span>
              </div>
            )}
          </div>

          <Link
            href="/events"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary text-white font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
          >
            Change Popup Event
          </Link>
        </div>
      </div>

      {/* Two Columns: Recent Registrations & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="p-6 rounded-2xl bg-surface border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-impact text-white uppercase tracking-tight">
                Recent Registrations
              </h3>
              <p className="text-xs font-inter text-secondary">Latest clients registered on website</p>
            </div>
            <Link href="/clients" className="text-xs font-inter text-primary hover:underline font-semibold">
              View All
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <p className="text-xs font-inter text-secondary text-center py-6">No registrations recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentClients.map((client: any) => (
                <div
                  key={client.id}
                  className="p-3.5 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between gap-3 hover:border-primary/20 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-inter font-semibold text-white truncate">
                      {client.name}
                    </div>
                    <div className="text-[11px] font-inter text-secondary truncate">
                      {client.preferredProgram} • {client.phone}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-inter font-bold uppercase ${
                      client.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : client.status === "CONFIRMED"
                        ? "bg-blue-500/10 text-blue-400"
                        : client.status === "CANCELLED"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="p-6 rounded-2xl bg-surface border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-impact text-white uppercase tracking-tight">
                Inbound Inquiries
              </h3>
              <p className="text-xs font-inter text-secondary">Messages submitted via contact page</p>
            </div>
            <Link href="/inquiries" className="text-xs font-inter text-primary hover:underline font-semibold">
              View All
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <p className="text-xs font-inter text-secondary text-center py-6">No contact messages recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {recentInquiries.map((inq: any) => (
                <div
                  key={inq.id}
                  className="p-3.5 rounded-xl bg-[#0a0a0a] border border-white/5 flex flex-col gap-1 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-inter font-semibold text-white truncate">
                      {inq.name}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-inter font-bold uppercase ${
                        inq.status === "UNREAD"
                          ? "bg-rose-500/10 text-rose-400 font-bold"
                          : "text-secondary"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs font-inter text-secondary line-clamp-1">
                    {inq.subject ? `${inq.subject} - ` : ""}{inq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
