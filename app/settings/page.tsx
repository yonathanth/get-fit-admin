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

/** Color themes visitors can switch between on the website (get-fit-gym/lib/theme.ts). */
const THEME_OPTIONS = [
  {
    id: "dark",
    label: "Dark",
    help: "The standard look: black background, gold accents.",
    swatch: ["#0a0a0a", "#d9972b", "#ffffff"],
  },
  {
    id: "inverted",
    label: "Gold",
    help: "Gold background with black accents (dark theme with the colors swapped).",
    swatch: ["#d9972b", "#0a0a0a", "#e0a23e"],
  },
  {
    id: "light",
    label: "Light",
    help: "Warm white background, dark text, gold accents.",
    swatch: ["#faf7f2", "#b97b16", "#17140f"],
  },
];
const DEFAULT_THEMES = "dark,inverted,light";

GROUPS.push({
  title: "Search Engines",
  icon: "travel_explore",
  fields: [
    {
      key: "google_site_verification",
      label: "Google Search Console verification code",
      placeholder: "e.g. aBc123XyZ...",
      help: 'In Search Console choose "HTML tag" and paste only the content="..." value. Save, then click Verify in Search Console.',
      wide: true,
    },
    {
      key: "bing_site_verification",
      label: "Bing Webmaster Tools verification code",
      placeholder: "e.g. 1A2B3C4D...",
      help: 'In Bing Webmaster Tools choose "HTML Meta Tag" and paste only the content="..." value (or simply import the site from Google Search Console).',
      wide: true,
    },
  ],
});

const ALL_KEYS = [...GROUPS.flatMap((g) => g.fields.map((f) => f.key)), "website_themes"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  const enabledThemes = (settings.website_themes?.trim() || DEFAULT_THEMES).split(",").map((s) => s.trim());
  const toggleTheme = (id: string) => {
    const next = enabledThemes.includes(id) ? enabledThemes.filter((t) => t !== id) : [...enabledThemes, id];
    if (next.length === 0) return; // at least one theme must stay on
    // Keep the website's toggle order
    const ordered = THEME_OPTIONS.map((o) => o.id).filter((o) => next.includes(o));
    setSettings({ ...settings, website_themes: ordered.join(",") });
  };

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
            Contact details, opening hours, social links, the video tour and the color themes shown on the public website
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

          {/* Website themes */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-white/5 space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">palette</span>
                <span>Website Themes</span>
              </h3>
              <p className="mt-1 text-[11px] text-white/40 leading-relaxed">
                Choose which color themes visitors can switch between with the theme button in the website menu. Visitors
                start on Dark when it&apos;s on. With only one theme on, the button is hidden.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THEME_OPTIONS.map((o) => {
                const on = enabledThemes.includes(o.id);
                const last = on && enabledThemes.length === 1;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => toggleTheme(o.id)}
                    disabled={last}
                    title={last ? "At least one theme must stay on" : undefined}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      on ? "border-primary bg-primary/10" : "border-white/10 bg-[#0A0A0A] hover:border-white/25"
                    } ${last ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {/* Mini preview */}
                    <div
                      className="mb-3 h-14 rounded-lg border border-white/10 p-2 flex flex-col justify-between"
                      style={{ background: o.swatch[0] }}
                    >
                      <span className="block h-1.5 w-10 rounded-full" style={{ background: o.swatch[2] }} />
                      <span className="block h-3 w-14 rounded-full" style={{ background: o.swatch[1] }} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{o.label}</span>
                      <span
                        className={`material-symbols-outlined text-xl ${on ? "text-primary" : "text-white/25"}`}
                      >
                        {on ? "toggle_on" : "toggle_off"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/45 leading-relaxed">{o.help}</p>
                  </button>
                );
              })}
            </div>
          </div>

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
