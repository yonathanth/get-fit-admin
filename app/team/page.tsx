"use client";

import { useEffect, useState } from "react";

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    role: "",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-impact text-white uppercase tracking-tight italic">
            Coaches & <span className="text-primary">Staff</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Manage fitness trainers, nutrition specialists, and credentials
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: "",
              role: "",
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
          Add Coach / Staff
        </button>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="py-20 text-center text-secondary">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-inter">Loading coaching staff...</p>
        </div>
      ) : team.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
          No team members added yet. Click &quot;Add Coach / Staff&quot; above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter">
          {team.map((member) => (
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
                        specializations: Array.isArray(member.specializations)
                          ? member.specializations.join(", ")
                          : member.specializations,
                      });
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-colors"
                    title="Edit Member"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete Member"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {formData.id ? "Edit Team Member" : "Add New Coach / Specialist"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs font-inter">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Teshome Bekele"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Head Strength Coach"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Photo URL *
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
                  Specializations (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  placeholder="Olympic Lifting, Mobility, Hypertrophy"
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Experience Years
                  </label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 911 000 000"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
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
