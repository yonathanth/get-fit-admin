"use client";

import { useEffect, useState } from "react";
import GalleryUpload from "@/components/ui/GalleryUpload";
import ImageUpload from "@/components/ui/ImageUpload";

export default function CommunityPage() {
  const [showcases, setShowcases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    eventDate: "December 2025",
    category: "Member Celebration",
    description: "",
    coverImageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80",
    galleryUrls: "",
    highlights: "",
    location: "Full Facility Arena",
    attendees: 50,
    paragraphs: "",
  });

  const fetchShowcases = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/community");
      const data = await res.json();
      setShowcases(data.showcases || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, []);

  const handleSaveShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = formData.id ? "PATCH" : "POST";
      const res = await fetch("/api/community", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchShowcases();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteShowcase = async (id: string) => {
    if (!confirm("Are you sure you want to delete this past showcase?")) return;
    try {
      const res = await fetch(`/api/community?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchShowcases();
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
            Community & <span className="text-primary">Past Showcases</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Manage past gatherings, member milestones, and photo galleries (distinct from upcoming events)
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: "",
              slug: "",
              eventDate: "January 2026",
              category: "Community Gathering",
              description: "",
              coverImageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80",
              galleryUrls: "",
              highlights: "",
            });
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
        >
          New Past Showcase
        </button>
      </div>

      {/* Showcases Grid */}
      {loading ? (
        <div className="py-20 text-center text-secondary">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-inter">Loading community showcases...</p>
        </div>
      ) : showcases.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
          No past event showcases created yet. Click &quot;New Past Showcase&quot; above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-inter">
          {showcases.map((sc) => (
            <div
              key={sc.id}
              className="rounded-2xl bg-surface border border-white/5 overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-black">
                  <img
                    src={sc.coverImageUrl}
                    alt={sc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-primary uppercase">
                      {sc.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-0.5 rounded bg-black/60 text-[10px] font-semibold text-white">
                      {sc.eventDate}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                    {sc.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    {sc.description}
                  </p>

                  {sc.highlights && sc.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sc.highlights.map((h: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-secondary"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-[#0c0c0c] border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-secondary">
                  {sc.galleryUrls?.length || 0} Gallery Photos
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setFormData({
                        ...sc,
                        galleryUrls: Array.isArray(sc.galleryUrls) ? sc.galleryUrls.join("\n") : sc.galleryUrls,
                        highlights: Array.isArray(sc.highlights) ? sc.highlights.join("\n") : sc.highlights,
                        paragraphs: Array.isArray(sc.paragraphs) ? sc.paragraphs.join("\n\n") : sc.paragraphs ?? "",
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-colors"
                    title="Edit Showcase"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteShowcase(sc.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete Showcase"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Showcase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {formData.id ? "Edit Past Showcase" : "Create Past Showcase"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveShowcase} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Showcase Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Winter Member PR Showcase 2025"
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Event Date (Month & Year) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    placeholder="e.g. December 2025"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Member Celebration"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Cover Photo *
                </label>
                <ImageUpload required value={formData.coverImageUrl} onChange={(url) => setFormData({ ...formData, coverImageUrl: url })} hint="Wide photo · resized automatically" />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Event Story & Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Recap story describing the gathering..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location ?? ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Full Facility Arena"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Attendees
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.attendees ?? ""}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Showcase page article (optional, blank line between paragraphs)
                </label>
                <textarea
                  rows={5}
                  value={formData.paragraphs ?? ""}
                  onChange={(e) => setFormData({ ...formData, paragraphs: e.target.value })}
                  placeholder={"First paragraph...\n\nSecond paragraph..."}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-y"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Gallery Photos
                </label>
                <GalleryUpload value={formData.galleryUrls || ""} onChange={(v) => setFormData({ ...formData, galleryUrls: v })} />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Highlights & Stats (One bullet per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.highlights || ""}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="150+ Attendees&#10;12 Awards Presented"
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-secondary hover:text-white font-inter"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base uppercase tracking-wider"
                >
                  {formData.id ? "Update Showcase" : "Save Showcase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
