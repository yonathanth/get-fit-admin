"use client";

import { useEffect, useState } from "react";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [replyNotes, setReplyNotes] = useState("");

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/inquiries?${params.toString()}`);
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, repliedNotes: notes }),
      });

      if (res.ok) {
        fetchInquiries();
        if (selectedInquiry?.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status, repliedNotes: notes });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/inquiries?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchInquiries();
        setSelectedInquiry(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-impact text-white uppercase tracking-tight italic">
            Contact <span className="text-primary">Inquiries</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Review inbound website contact form submissions and member questions
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 font-inter">
          {["ALL", "UNREAD", "READ", "REPLIED", "ARCHIVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-primary text-black"
                  : "bg-surface border border-white/5 text-secondary hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="py-20 text-center text-secondary">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-inter">Loading inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
          No inquiries found for this filter.
        </div>
      ) : (
        <div className="space-y-3 font-inter">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              onClick={() => {
                setSelectedInquiry(inq);
                setReplyNotes(inq.repliedNotes || "");
                if (inq.status === "UNREAD") {
                  handleUpdateStatus(inq.id, "READ");
                }
              }}
              className={`p-5 rounded-2xl bg-surface border transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/30 ${
                inq.status === "UNREAD"
                  ? "border-rose-500/30"
                  : "border-white/5"
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white text-xs">{inq.name}</span>
                  <span className="text-zinc-600 text-xs">•</span>
                  <span className="text-secondary text-xs">{inq.email}</span>
                  <span className="text-zinc-600 text-xs">•</span>
                  <span className="text-secondary text-xs">{inq.phone}</span>
                </div>

                <div className="text-xs text-white font-medium">
                  {inq.subject || "General Gym Inquiry"}
                </div>

                <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                  {inq.message}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    inq.status === "UNREAD"
                      ? "bg-rose-500/10 text-rose-400"
                      : inq.status === "REPLIED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : inq.status === "ARCHIVED"
                      ? "bg-zinc-500/10 text-zinc-400"
                      : "text-secondary"
                  }`}
                >
                  {inq.status}
                </span>

                <span className="text-[11px] text-secondary">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <div>
                <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">{selectedInquiry.name}</h3>
                <p className="text-xs font-inter text-secondary">Received {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-inter">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#0A0A0A] border border-white/5">
                <div>
                  <span className="text-secondary block mb-1">Phone Number</span>
                  <a href={`tel:${selectedInquiry.phone}`} className="text-primary font-semibold hover:underline block">
                    {selectedInquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-secondary block mb-1">Email Address</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-white hover:underline block truncate">
                    {selectedInquiry.email}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-secondary uppercase tracking-wider block font-semibold mb-1">
                  Subject: {selectedInquiry.subject || "General Inquiry"}
                </span>
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider font-semibold mb-1.5">
                  Internal Notes / Follow-up
                </label>
                <textarea
                  rows={3}
                  value={replyNotes}
                  onChange={(e) => setReplyNotes(e.target.value)}
                  placeholder="Record call summary or membership offer details..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedInquiry.id, "REPLIED", replyNotes)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    <span>Mark Replied</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedInquiry.id, "ARCHIVED", replyNotes)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-secondary font-semibold"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    title="Delete Message"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base uppercase tracking-wider"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
