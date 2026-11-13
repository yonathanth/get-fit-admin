"use client";

import { useEffect, useState } from "react";

/** Converts the form's text areas to the arrays stored in the database. */
function toEventPayload(form: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { paragraphsText, galleryText, createdAt, updatedAt, ...rest } = form;
  return {
    ...rest,
    dateString: String(form.dateString ?? "").trim() || null,
    paragraphs: String(paragraphsText ?? "").split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean),
    galleryUrls: String(galleryText ?? "").split("\n").map((u: string) => u.trim()).filter(Boolean),
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    eventDate: new Date().toISOString().slice(0, 10),
    timeString: "9:00 AM - 1:00 PM",
    location: "Get Fit Gym Arena",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
    totalSpots: 60,
    remainingSpots: 60,
    isPopupFeatured: false,
    status: "UPCOMING",
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTogglePopup = async (eventId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/events/toggle-popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          isPopupFeatured: !currentStatus,
        }),
      });

      if (res.ok) {
        fetchEvents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = formData.id ? "PATCH" : "POST";
      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toEventPayload(formData)),
      });

      if (res.ok) {
        setShowModal(false);
        fetchEvents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchEvents();
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
            Upcoming Events & <span className="text-primary">Popup Selector</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Manage scheduled events. For discounts, announcements and scheduling, use Website Popups.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: "",
              slug: "",
              eventDate: new Date().toISOString().slice(0, 10),
              timeString: "9:00 AM - 1:00 PM",
              location: "Get Fit Gym Main Arena",
              description: "",
              imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
              totalSpots: 60,
              remainingSpots: 60,
              isPopupFeatured: false,
              status: "UPCOMING",
            });
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
        >
          Add Event
        </button>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="py-20 text-center text-secondary">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-inter">Loading scheduled events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
          No upcoming events scheduled yet. Click &quot;Add Event&quot; above to create one.
        </div>
      ) : (
        <div className="space-y-4 font-inter">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-5 sm:p-6 rounded-2xl bg-surface border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                event.isPopupFeatured
                  ? "border-primary/50"
                  : "border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
                <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-black flex-shrink-0">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  {event.isPopupFeatured && (
                    <div className="absolute top-2 left-2 bg-primary text-black font-bold text-[9px] px-2 py-0.5 rounded uppercase">
                      Popup Active
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                      {event.title}
                    </h3>
                    <span className="text-xs text-secondary font-medium">
                      • {new Date(event.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-secondary line-clamp-2 max-w-xl leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-secondary pt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                      <span>{event.timeString}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      <span>{event.location}</span>
                    </span>
                    <span className="text-primary font-semibold">
                      {event.remainingSpots} / {event.totalSpots} spots remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Popup Feature Toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                {/* Popup Featured Switch */}
                <button
                  onClick={() => handleTogglePopup(event.id, event.isPopupFeatured)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase transition-all cursor-pointer ${
                    event.isPopupFeatured
                      ? "bg-primary text-black font-bold"
                      : "bg-white/5 hover:bg-white/10 text-secondary border border-white/5"
                  }`}
                  title="Toggle whether this event appears in the 10-second visitor popup modal"
                >
                  <span className={`material-symbols-outlined text-base ${event.isPopupFeatured ? "text-black" : "text-primary"}`}>
                    {event.isPopupFeatured ? "star" : "star_outline"}
                  </span>
                  <span>{event.isPopupFeatured ? "Featured in Modal" : "Set as Popup Event"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setFormData({
                        ...event,
                        eventDate: new Date(event.eventDate).toISOString().slice(0, 10),
                        dateString: event.dateString ?? "",
                        paragraphsText: (event.paragraphs || []).join("\n\n"),
                        galleryText: (event.galleryUrls || []).join("\n"),
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-colors"
                    title="Edit Event"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete Event"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {formData.id ? "Edit Upcoming Event" : "Schedule New Event"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Health, Fitness & Nutrition Seminar"
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Time String *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.timeString}
                    onChange={(e) => setFormData({ ...formData, timeString: e.target.value })}
                    placeholder="9:00 AM - 1:00 PM"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Location Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Get Fit Gym Arena"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Total Spots Available
                  </label>
                  <input
                    type="number"
                    value={formData.totalSpots}
                    onChange={(e) => setFormData({ ...formData, totalSpots: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Banner Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Event Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the seminar agenda..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Event page article <span className="normal-case tracking-normal text-white/40">(optional, blank line between paragraphs)</span>
                </label>
                <textarea
                  rows={6}
                  value={formData.paragraphsText ?? ""}
                  onChange={(e) => setFormData({ ...formData, paragraphsText: e.target.value })}
                  placeholder={"First paragraph shown on the event's page...\n\nSecond paragraph..."}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-y"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Gallery image URLs <span className="normal-case tracking-normal text-white/40">(optional, one per line)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.galleryText ?? ""}
                  onChange={(e) => setFormData({ ...formData, galleryText: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-y font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Custom date text <span className="normal-case tracking-normal text-white/40">(optional, overrides the date shown on the site)</span>
                </label>
                <input
                  type="text"
                  value={formData.dateString ?? ""}
                  onChange={(e) => setFormData({ ...formData, dateString: e.target.value })}
                  placeholder="e.g. Every Saturday in May"
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0A0A] border border-white/5">
                <input
                  type="checkbox"
                  id="isPopupFeatured"
                  checked={formData.isPopupFeatured}
                  onChange={(e) => setFormData({ ...formData, isPopupFeatured: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="isPopupFeatured" className="text-white text-xs font-semibold cursor-pointer">
                  Feature this event in the 10-second public website popup modal
                </label>
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
                  {formData.id ? "Update Event" : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
