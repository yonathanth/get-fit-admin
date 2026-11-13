"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/ui/ImageUpload";

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<"MANAGEMENT" | "TRAINER" | "ALL">("MANAGEMENT");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    role: "",
    category: "MANAGEMENT",
    bio: "",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    specializations: "",
    experienceYears: 5,
    email: "",
    phone: "",
    instagram: "",
    tiktok: "",
    isActive: true,
  });

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/team");
      const data = await res.json();
      setTeam(data.team || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = formData.id ? "PATCH" : "POST";
      const res = await fetch("/api/team", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchTeam();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchTeam();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTeam = team.filter((m) => {
    if (selectedCategory === "ALL") return true;
    return (m.category || "MANAGEMENT") === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-impact text-white uppercase tracking-tight italic">
            Staff & <span className="text-primary">Trainers</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Manage Management Leadership (About Us) and Personal Trainers (Register Page)
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: "",
              role: "",
              category: selectedCategory === "ALL" ? "MANAGEMENT" : selectedCategory,
              bio: "",
              imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
              specializations: "",
              experienceYears: 5,
              email: "",
              phone: "",
              instagram: "",
              tiktok: "",
              isActive: true,
            });
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
        >
          Add Staff Member
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <button
          onClick={() => setSelectedCategory("MANAGEMENT")}
          className={`px-4 py-2 rounded-xl text-xs font-inter font-bold uppercase transition-all cursor-pointer ${
            selectedCategory === "MANAGEMENT"
              ? "bg-primary text-black shadow-md"
              : "bg-surface border border-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          Management Team ({team.filter((m) => (m.category || "MANAGEMENT") === "MANAGEMENT").length})
        </button>
        <button
          onClick={() => setSelectedCategory("TRAINER")}
          className={`px-4 py-2 rounded-xl text-xs font-inter font-bold uppercase transition-all cursor-pointer ${
            selectedCategory === "TRAINER"
              ? "bg-primary text-black shadow-md"
              : "bg-surface border border-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          Personal Trainers ({team.filter((m) => m.category === "TRAINER").length})
        </button>
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-inter font-bold uppercase transition-all cursor-pointer ${
            selectedCategory === "ALL"
              ? "bg-primary text-black shadow-md"
              : "bg-surface border border-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          All Staff ({team.length})
        </button>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="py-20 text-center text-secondary">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-inter">Loading staff list...</p>
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
          No team members in this category yet. Click &quot;Add Staff Member&quot; above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-surface border border-white/5 overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-black">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-black/70 border border-white/10 text-primary">
                      {member.category === "TRAINER" ? "Personal Trainer" : "Management"}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        member.isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div>
                    <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-primary">
                      {member.role}
                    </p>
                  </div>

                  <p className="text-xs text-secondary line-clamp-3 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Specializations Tags */}
                  {member.specializations && member.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {member.specializations.map((spec: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-secondary"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 pt-3 border-t border-white/5 text-xs text-secondary">
                    {member.phone && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">call</span>
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">mail</span>
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-[#0c0c0c] border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-secondary">
                  {member.experienceYears} Years Exp
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setFormData({
                        ...member,
                        category: member.category || "MANAGEMENT",
                        specializations: Array.isArray(member.specializations)
                          ? member.specializations.join(", ")
                          : member.specializations || "",
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-surface border border-white/10 hover:border-primary/40 text-secondary hover:text-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-1.5 rounded-lg bg-surface border border-white/10 hover:border-rose-500/40 text-secondary hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {formData.id ? "Edit Staff Member" : "Add Staff Member"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 font-inter text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Teshome Abate"
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Role / Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Master Athletics Coach"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Team Category
                  </label>
                  <select
                    value={formData.category || "MANAGEMENT"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="MANAGEMENT">Management Leadership (About Us Page)</option>
                    <option value="TRAINER">Personal Trainer (Register Page Selection)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Experience Years
                  </label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary mb-1 uppercase font-semibold">
                  Photo
                </label>
                <ImageUpload required value={formData.imageUrl} onChange={(url) => setFormData({ ...formData, imageUrl: url })} hint="Portrait photo · resized automatically" />
              </div>

              <div>
                <label className="block text-secondary mb-1 uppercase font-semibold">
                  Short Bio Summary
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  placeholder="Summary of experience, credentials, and achievements..."
                />
              </div>

              <div>
                <label className="block text-secondary mb-1 uppercase font-semibold">
                  Specializations (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Muscle Building, Mobility, Nutrition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                    placeholder="0911-415-862"
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="coach@getfitgym.com"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Biography & Qualifications *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short bio detailing coaching background..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base uppercase tracking-wider"
                >
                  {formData.id ? "Update Member" : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
