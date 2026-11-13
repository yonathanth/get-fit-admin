"use client";

import { useEffect, useState } from "react";

type PopupType = "EVENT" | "DISCOUNT" | "ANNOUNCEMENT";

interface Popup {
  id?: string;
  type: PopupType;
  title: string;
  message: string;
  imageUrl: string;
  badge: string;
  promoCode: string;
  ctaLabel: string;
  ctaUrl: string;
  eventId: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  updatedAt?: string;
}

interface EventOption {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  eventDate: string;
  status: string;
}

const TYPE_META: Record<PopupType, { label: string; icon: string; hint: string }> = {
  EVENT: { label: "Event", icon: "event", hint: "Promote an upcoming event with a Reserve button" },
  DISCOUNT: { label: "Discount", icon: "sell", hint: "Offer, badge and optional promo code" },
  ANNOUNCEMENT: { label: "Announcement", icon: "campaign", hint: "News, holiday hours, new classes…" },
};

const EMPTY: Popup = {
  type: "ANNOUNCEMENT",
  title: "",
  message: "",
  imageUrl: "",
  badge: "",
  promoCode: "",
  ctaLabel: "",
  ctaUrl: "",
  eventId: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

const inputCls =
  "w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary";
const labelCls = "block text-secondary uppercase tracking-wider mb-1.5 font-semibold";

/** ISO → value for <input type="date"> */
const toDateInput = (v?: string | null) => (v ? new Date(v).toISOString().slice(0, 10) : "");

function scheduleText(p: { startsAt?: string | null; endsAt?: string | null }) {
  const fmt = (v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (p.startsAt && p.endsAt) return `${fmt(p.startsAt)} → ${fmt(p.endsAt)}`;
  if (p.startsAt) return `From ${fmt(p.startsAt)}`;
  if (p.endsAt) return `Until ${fmt(p.endsAt)}`;
  return "No end date";
}

export default function PopupsPage() {
  const [popups, setPopups] = useState<(Popup & { id: string })[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Popup>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [delay, setDelay] = useState("10");
  const [delayState, setDelayState] = useState<"idle" | "saving" | "saved">("idle");

  const saveDelay = async () => {
    const n = Math.max(0, Math.round(Number(delay) || 0));
    setDelay(String(n));
    setDelayState("saving");
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { popup_delay_seconds: String(n) } }),
      });
      setDelayState("saved");
      setTimeout(() => setDelayState("idle"), 1800);
    } catch (e) {
      console.error(e);
      setDelayState("idle");
    }
  };

  const fetchPopups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/popups");
      const data = await res.json();
      setPopups(data.popups || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(console.error);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => d.settings?.popup_delay_seconds && setDelay(String(d.settings.popup_delay_seconds)))
      .catch(console.error);
  }, []);

  const eventById = (id?: string | null) => events.find((e) => e.id === id);

  const openNew = () => {
    setForm(EMPTY);
    setError("");
    setShowModal(true);
  };

  const openEdit = (p: Popup) => {
    const s = (v: unknown) => (typeof v === "string" ? v : "");
    setForm({
      ...p,
      imageUrl: s(p.imageUrl),
      badge: s(p.badge),
      promoCode: s(p.promoCode),
      ctaLabel: s(p.ctaLabel),
      ctaUrl: s(p.ctaUrl),
      eventId: s(p.eventId),
      startsAt: toDateInput(p.startsAt),
      endsAt: toDateInput(p.endsAt),
    });
    setError("");
    setShowModal(true);
  };

  // Choosing an event pre-fills the copy so it's one click to publish
  const pickEvent = (id: string) => {
    const ev = eventById(id);
    setForm((f) => ({
      ...f,
      eventId: id,
      title: f.title || ev?.title || "",
      message: f.message || ev?.description || "",
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/popups", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // end date is inclusive: keep the popup up until the end of that day
          endsAt: form.endsAt ? `${form.endsAt}T23:59:59` : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save the popup");
        return;
      }
      setShowModal(false);
      fetchPopups();
    } catch (err) {
      console.error(err);
      setError("Could not save the popup");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Popup & { id: string }) => {
    await fetch("/api/popups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    }).catch(console.error);
    fetchPopups();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this popup?")) return;
    await fetch(`/api/popups?id=${id}`, { method: "DELETE" }).catch(console.error);
    fetchPopups();
  };

  const isLive = (p: Popup) => {
    const now = Date.now();
    return (
      p.isActive &&
      (!p.startsAt || new Date(p.startsAt).getTime() <= now) &&
      (!p.endsAt || new Date(p.endsAt).getTime() >= now)
    );
  };

  const previewImage = (p: Popup) => p.imageUrl || (p.type === "EVENT" ? eventById(p.eventId)?.imageUrl : "") || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-impact text-white uppercase tracking-tight italic">
            Website <span className="text-primary">Popups</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Events, discounts and announcements shown to visitors. Only one popup is live at a time.
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
        >
          New Popup
        </button>
      </div>

      {/* Timing: how long after a visitor lands the popup appears (site setting) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-inter">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">timer</span>
          <div>
            <p className="text-sm text-white font-semibold">Show popup after</p>
            <p className="text-xs text-secondary">Seconds after a visitor opens the website. 0 shows it right away.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={600}
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveDelay()}
            className="w-24 bg-[#0A0A0A] border border-white/5 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-primary"
          />
          <span className="text-xs text-secondary">sec</span>
          <button
            onClick={saveDelay}
            disabled={delayState === "saving"}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60 cursor-pointer"
          >
            {delayState === "saving" ? "Saving…" : delayState === "saved" ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-secondary">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-inter">Loading popups...</p>
        </div>
      ) : popups.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
          No popups yet. Click &quot;New Popup&quot; to create an event promo, a discount or an announcement.
        </div>
      ) : (
        <div className="space-y-4 font-inter">
          {popups.map((p) => {
            const meta = TYPE_META[p.type] ?? TYPE_META.ANNOUNCEMENT;
            const img = previewImage(p);
            const live = isLive(p);
            return (
              <div
                key={p.id}
                className={`p-5 sm:p-6 rounded-2xl bg-surface border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  p.isActive ? "border-primary/50" : "border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto min-w-0">
                  <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-black flex-shrink-0 flex items-center justify-center">
                    {img ? (
                      <img src={img} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-primary/70">{meta.icon}</span>
                    )}
                    {p.badge && (
                      <div className="absolute bottom-2 right-2 bg-primary text-black font-bold text-[10px] px-2 py-0.5 rounded">
                        {p.badge}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>
                        {meta.label}
                      </span>
                      {live ? (
                        <span className="rounded-full bg-green-500/15 text-green-400 px-2.5 py-0.5 text-[10px] font-bold uppercase">Live now</span>
                      ) : p.isActive ? (
                        <span className="rounded-full bg-yellow-500/15 text-yellow-400 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                          Active · outside dates
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">{p.title}</h3>
                    <p className="text-xs text-secondary line-clamp-2 max-w-xl leading-relaxed">{p.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-secondary pt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-sm">date_range</span>
                        {scheduleText(p)}
                      </span>
                      {p.type === "EVENT" && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-sm">link</span>
                          {eventById(p.eventId)?.title ?? "Event not found"}
                        </span>
                      )}
                      {p.promoCode && (
                        <span className="font-mono text-primary font-semibold tracking-wider">{p.promoCode}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase transition-all cursor-pointer ${
                      p.isActive
                        ? "bg-primary text-black font-bold"
                        : "bg-white/5 hover:bg-white/10 text-secondary border border-white/5"
                    }`}
                    title="Show or hide this popup on the website"
                  >
                    <span className={`material-symbols-outlined text-base ${p.isActive ? "text-black" : "text-primary"}`}>
                      {p.isActive ? "toggle_on" : "toggle_off"}
                    </span>
                    <span>{p.isActive ? "Active" : "Activate"}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-colors"
                      title="Edit popup"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete popup"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {form.id ? "Edit Popup" : "New Popup"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-secondary hover:text-white">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-inter">
              {/* Type picker */}
              <div>
                <label className={labelCls}>Popup type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TYPE_META) as PopupType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors cursor-pointer ${
                        form.type === t
                          ? "border-primary bg-primary/10 text-white"
                          : "border-white/5 bg-[#0A0A0A] text-secondary hover:border-white/20"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl text-primary">{TYPE_META[t].icon}</span>
                      <span className="font-semibold uppercase tracking-wider text-[11px]">{TYPE_META[t].label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-white/40">{TYPE_META[form.type].hint}</p>
              </div>

              {form.type === "EVENT" && (
                <div>
                  <label className={labelCls}>Event to promote *</label>
                  <select
                    required
                    value={form.eventId}
                    onChange={(e) => pickEvent(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Choose an event…</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} · {new Date(ev.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {ev.status !== "UPCOMING" ? ` (${ev.status.toLowerCase()})` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-white/40">
                    Date, time, location and spots come from the event. It stops showing once the event is no longer upcoming.
                  </p>
                </div>
              )}

              <div>
                <label className={labelCls}>Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={
                    form.type === "DISCOUNT" ? "e.g. New Year Membership Offer" : form.type === "EVENT" ? "Event headline" : "e.g. Holiday opening hours"
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Message *</label>
                <textarea
                  rows={3}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="One or two short sentences visitors will read"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Badge <span className="normal-case tracking-normal text-white/40">(optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder={form.type === "DISCOUNT" ? "20% OFF" : "NEW"}
                    className={inputCls}
                  />
                </div>
                {form.type === "DISCOUNT" && (
                  <div>
                    <label className={labelCls}>
                      Promo code <span className="normal-case tracking-normal text-white/40">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.promoCode}
                      onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                      placeholder="GETFIT20"
                      className={`${inputCls} font-mono tracking-wider`}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  Image URL{" "}
                  <span className="normal-case tracking-normal text-white/40">
                    (optional{form.type === "EVENT" ? ", defaults to the event's banner" : ""})
                  </span>
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://… or /images/hero/dsc00690.webp"
                  className={inputCls}
                />
              </div>

              {form.type !== "EVENT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Button text</label>
                    <input
                      type="text"
                      value={form.ctaLabel}
                      onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                      placeholder={form.type === "DISCOUNT" ? "Claim offer" : "Learn more"}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Button link</label>
                    <input
                      type="text"
                      value={form.ctaUrl}
                      onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                      placeholder={form.type === "DISCOUNT" ? "/register" : "/programs"}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Show from <span className="normal-case tracking-normal text-white/40">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Show until <span className="normal-case tracking-normal text-white/40">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0A0A] border border-white/5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-white text-xs font-semibold cursor-pointer">
                  Show this popup on the website (turns off any other active popup)
                </label>
              </div>

              {error && <p className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400">{error}</p>}

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
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 text-black font-impact text-base uppercase tracking-wider"
                >
                  {saving ? "Saving…" : form.id ? "Update Popup" : "Save Popup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
