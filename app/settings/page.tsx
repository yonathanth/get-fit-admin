"use client";

import { useEffect, useState } from "react";

/**
 * Site-wide settings shown on the public website. Keys must match
 * get-fit-gym/lib/settings-shared.ts (GymSettingsMap). An empty field means
 * "use the website's built-in default".
 */
type Field = {
  key: string;
  label: string;
  placeholder?: string;
  help?: string;
  type?: "text" | "url" | "email" | "number";
  wide?: boolean;
};

const GROUPS: { title: string; icon: string; fields: Field[] }[] = [
  {
    title: "Contact & Location",
    icon: "location_on",
    fields: [
      { key: "gym_name", label: "Facility name", placeholder: "Get Fit Gym" },
      { key: "location_address", label: "Address", placeholder: "CMC Michael, Addis Ababa, Ethiopia" },
      { key: "phone_primary", label: "Primary phone", placeholder: "0911-415-862" },
      { key: "phone_secondary", label: "Secondary phone", placeholder: "0992 222 224", help: "Leave empty to show only one number." },
      { key: "email_address", label: "Email", placeholder: "info@example.com", type: "email", wide: true },
    ],
  },
  {
    title: "Opening Hours",
    icon: "schedule",
    fields: [
      { key: "operating_hours", label: "Opening hours (shown on the Contact page)", placeholder: "5:00 AM - 10:00 PM / Monday - Sunday", wide: true },
    ],
  },
  {
    title: "Social Links",
    icon: "share",
    fields: [
      { key: "tiktok_url", label: "TikTok", type: "url", placeholder: "https://www.tiktok.com/@..." },
      { key: "facebook_url", label: "Facebook", type: "url", placeholder: "https://www.facebook.com/..." },
      { key: "linkedin_url", label: "LinkedIn", type: "url", placeholder: "https://www.linkedin.com/..." },
      { key: "youtube_url", label: "YouTube", type: "url", placeholder: "https://youtube.com/@..." },
    ],
  },
  {
    title: "Video Tour & Popup",
    icon: "play_circle",
    fields: [
      {
        key: "video_tour_url",
        label: "Video tour (Mux playback ID or player link)",
        placeholder: "xEmaKZoDggTHIm3kNryHGS3yJ5aeI1A6yvPVMg901bJk",
        help: "Paste the public Playback ID from Mux, or the https://player.mux.com/... link from its embed code.",
        wide: true,
      },
      {
        key: "popup_delay_seconds",
        label: "Website popup delay (seconds)",
        type: "number",
        placeholder: "10",
        help: "How long after a visitor arrives the website popup appears. Manage popups under Website Popups.",
      },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.fields.map((f) => f.key));

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      } catch (e) {
        console.error(e);
        setError("Could not load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setError("");
    try {
      // Only send the keys this page manages
      const payload = Object.fromEntries(ALL_KEYS.map((k) => [k, (settings[k] ?? "").trim()]));
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });
      if (!res.ok) throw new Error();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setError("Saving failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-impact text-white uppercase tracking-tight italic">
            Facility <span className="text-primary">Settings</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Contact details, opening hours, social links and the video tour shown on the public website
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-inter font-semibold">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Settings saved — live on the website</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-inter font-semibold">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-secondary">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-inter">Loading facility settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 font-inter">
          {GROUPS.map((group) => (
            <div key={group.title} className="p-6 sm:p-8 rounded-2xl bg-surface border border-white/5 space-y-5">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="material-symbols-outlined text-primary text-xl">{group.icon}</span>
                <span>{group.title}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {group.fields.map((f) => (
                  <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                    <label htmlFor={`s-${f.key}`} className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                      {f.label}
                    </label>
                    <input
                      id={`s-${f.key}`}
                      type={f.type ?? "text"}
                      min={f.type === "number" ? 0 : undefined}
                      value={settings[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                    />
                    {f.help && <p className="mt-1.5 text-[11px] text-white/40 leading-relaxed">{f.help}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-white text-black font-inter font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
