"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    gym_name: "Get Fit Gym",
    location: "CMC Michael, Addis Ababa, Ethiopia",
    primary_phone: "+251 900 000 000",
    secondary_phone: "+251 911 111 111",
    email: "info@getfitgym.com",
    hours_weekday: "5:00 AM - 10:00 PM",
    hours_weekend: "6:00 AM - 9:00 PM",
    video_tour_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    popup_delay_seconds: "10",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
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
            Configure public facility contact details, operating schedules, and video assets
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-inter font-semibold">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Settings saved successfully</span>
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
          {/* Facility Contact Info Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-white/5 space-y-5">
            <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              <span>Contact & Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Facility Name
                </label>
                <input
                  type="text"
                  value={settings.gym_name || ""}
                  onChange={(e) => setSettings({ ...settings, gym_name: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Facility Street Address
                </label>
                <input
                  type="text"
                  value={settings.location || ""}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Primary Phone
                </label>
                <input
                  type="text"
                  value={settings.primary_phone || ""}
                  onChange={(e) => setSettings({ ...settings, primary_phone: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Secondary Phone
                </label>
                <input
                  type="text"
                  value={settings.secondary_phone || ""}
                  onChange={(e) => setSettings({ ...settings, secondary_phone: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Support & Info Email
                </label>
                <input
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-white/5 space-y-5">
            <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-xl">schedule</span>
              <span>Operating Hours</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Monday - Friday Hours
                </label>
                <input
                  type="text"
                  value={settings.hours_weekday || ""}
                  onChange={(e) => setSettings({ ...settings, hours_weekday: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Saturday - Sunday Hours
                </label>
                <input
                  type="text"
                  value={settings.hours_weekend || ""}
                  onChange={(e) => setSettings({ ...settings, hours_weekend: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Media & Modal Controls Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-white/5 space-y-5">
            <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-xl">videocam</span>
              <span>Media & Modal Configuration</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Hero Video Tour MP4 URL
                </label>
                <input
                  type="url"
                  value={settings.video_tour_url || ""}
                  onChange={(e) => setSettings({ ...settings, video_tour_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Public Website Popup Modal Delay (Seconds)
                </label>
                <input
                  type="number"
                  value={settings.popup_delay_seconds || "10"}
                  onChange={(e) => setSettings({ ...settings, popup_delay_seconds: e.target.value })}
                  className="w-full sm:w-48 bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save All Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
