"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/ui/ImageUpload";

export default function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<"classes" | "memberships">("classes");

  // Classes state
  const [programs, setPrograms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [showClassModal, setShowClassModal] = useState(false);
  const [classForm, setClassForm] = useState<any>({
    name: "",
    category: "Cardio & Fat Loss",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    schedule: "Mon, Wed, Fri (6:00 AM & 9:30 AM)",
    capacity: 25,
    instructor: "Teshome Abate",
    intensity: "Intermediate",
    price: null,
    status: "ACTIVE",
    displayOrder: 1,
  });

  // Memberships state
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [membershipForm, setMembershipForm] = useState<any>({
    name: "",
    category: "REGULAR",
    tier: "SINGLE",
    subtitle: "",
    price1Month: "",
    price3Months: "",
    price6Months: "",
    price1Year: "",
    isPopular: false,
    features: "",
    displayOrder: 1,
    isActive: true,
  });

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const res = await fetch("/api/programs");
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchMemberships = async () => {
    try {
      setLoadingMemberships(true);
      const res = await fetch("/api/memberships");
      const data = await res.json();
      setMemberships(data.plans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMemberships(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchMemberships();
  }, []);

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = classForm.id ? "PATCH" : "POST";
      const res = await fetch("/api/programs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classForm),
      });

      if (res.ok) {
        setShowClassModal(false);
        fetchPrograms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`/api/programs?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchPrograms();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = membershipForm.id ? "PATCH" : "POST";
      const res = await fetch("/api/memberships", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(membershipForm),
      });

      if (res.ok) {
        setShowMembershipModal(false);
        fetchMemberships();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMembership = async (id: string) => {
    if (!confirm("Are you sure you want to delete this membership plan?")) return;
    try {
      const res = await fetch(`/api/memberships?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchMemberships();
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
            Programs & <span className="text-primary">Memberships</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Manage group classes and pre-opening pricing tiers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "classes" ? (
            <button
              onClick={() => {
                setClassForm({
                  name: "",
                  category: "Cardio & Fat Loss",
                  description: "",
                  imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
                  schedule: "Mon, Wed, Fri (6:00 AM & 9:30 AM)",
                  capacity: 25,
                  instructor: "Teshome Abate",
                  intensity: "Intermediate",
                  price: null,
                  status: "ACTIVE",
                  displayOrder: programs.length + 1,
                });
                setShowClassModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
            >
              Add Group Class
            </button>
          ) : (
            <button
              onClick={() => {
                setMembershipForm({
                  name: "",
                  category: "REGULAR",
                  tier: "SINGLE",
                  subtitle: "",
                  price1Month: "",
                  price3Months: "",
                  price6Months: "",
                  price1Year: "",
                  isPopular: false,
                  features: "",
                  displayOrder: memberships.length + 1,
                  isActive: true,
                });
                setShowMembershipModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
            >
              Add Membership Plan
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveTab("classes")}
          className={`px-4 py-2 rounded-xl text-xs font-inter font-bold uppercase transition-all cursor-pointer ${
            activeTab === "classes"
              ? "bg-primary text-black shadow-md"
              : "bg-surface border border-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          Group Classes ({programs.length})
        </button>
        <button
          onClick={() => setActiveTab("memberships")}
          className={`px-4 py-2 rounded-xl text-xs font-inter font-bold uppercase transition-all cursor-pointer ${
            activeTab === "memberships"
              ? "bg-primary text-black shadow-md"
              : "bg-surface border border-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          Membership Pricing Tiers ({memberships.length})
        </button>
      </div>

      {/* Group Classes View */}
      {activeTab === "classes" && (
        <>
          {loadingPrograms ? (
            <div className="py-20 text-center text-secondary">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-inter">Loading group classes...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
              No classes created yet. Click &quot;Add Group Class&quot; above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="rounded-2xl bg-surface border border-white/5 overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-black">
                      <img
                        src={prog.imageUrl}
                        alt={prog.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-black/60 border border-white/10 text-primary">
                          {prog.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            prog.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-zinc-500/20 text-zinc-400"
                          }`}
                        >
                          {prog.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                          {prog.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-primary font-medium mt-1">
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span>Coach: {prog.instructor}</span>
                        </div>
                      </div>

                      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                        {prog.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-secondary">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">schedule</span>
                          <span>{prog.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">group</span>
                          <span>Capacity: {prog.capacity} members</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-[#0c0c0c] border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-secondary font-medium">
                      Order: #{prog.displayOrder}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setClassForm(prog);
                          setShowClassModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-surface border border-white/10 hover:border-primary/40 text-secondary hover:text-white transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteClass(prog.id)}
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
        </>
      )}

      {/* Membership Pricing Tiers View */}
      {activeTab === "memberships" && (
        <>
          {loadingMemberships ? (
            <div className="py-20 text-center text-secondary">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-inter">Loading membership plans...</p>
            </div>
          ) : memberships.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
              No membership plans added. Click &quot;Add Membership Plan&quot; above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter">
              {memberships.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative border ${
                    plan.isPopular
                      ? "bg-[#141313] border-primary shadow-[0_0_20px_rgba(217,151,43,0.15)]"
                      : "bg-surface border-white/5 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-black/60 border border-white/10 text-primary">
                        {plan.category} • {plan.tier}
                      </span>
                      {plan.isPopular && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary text-black">
                          Popular
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-impact text-white uppercase tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-secondary mt-1 line-clamp-2">
                      {plan.subtitle}
                    </p>

                    {/* Price Matrix Breakdown */}
                    <div className="mt-4 p-3.5 rounded-xl bg-[#0a0a0a] border border-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-secondary">1 Month:</span>
                        <span className="text-white font-bold">{plan.price1Month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">3 Months:</span>
                        <span className="text-white font-bold">{plan.price3Months}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">6 Months:</span>
                        <span className="text-white font-bold">{plan.price6Months}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-white/5">
                        <span className="text-primary font-semibold">1 Year:</span>
                        <span className="text-primary font-bold">{plan.price1Year}</span>
                      </div>
                    </div>

                    {/* Features Preview */}
                    {plan.features && plan.features.length > 0 && (
                      <ul className="mt-4 space-y-1.5 text-xs text-secondary">
                        {plan.features.slice(0, 4).map((f: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        plan.isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Hidden"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setMembershipForm({
                            ...plan,
                            features: Array.isArray(plan.features) ? plan.features.join("\n") : plan.features || "",
                          });
                          setShowMembershipModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-surface border border-white/10 hover:border-primary/40 text-secondary hover:text-white transition-colors cursor-pointer"
                        title="Edit Plan"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMembership(plan.id)}
                        className="p-1.5 rounded-lg bg-surface border border-white/10 hover:border-rose-500/40 text-secondary hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {classForm.id ? "Edit Group Class" : "Add Group Class"}
              </h3>
              <button
                onClick={() => setShowClassModal(false)}
                className="text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 font-inter text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Class Name
                  </label>
                  <input
                    type="text"
                    required
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. HIIT & Metabolic Training"
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={classForm.category}
                    onChange={(e) => setClassForm({ ...classForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Cardio & Fat Loss"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Instructor / Coach Name
                  </label>
                  <input
                    type="text"
                    required
                    value={classForm.instructor}
                    onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Teshome Abate"
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Schedule Slot
                  </label>
                  <input
                    type="text"
                    required
                    value={classForm.schedule}
                    onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                    placeholder="Mon, Wed, Fri (6:00 AM & 9:30 AM)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary mb-1 uppercase font-semibold">
                  Class Image
                </label>
                <ImageUpload required value={classForm.imageUrl} onChange={(url) => setClassForm({ ...classForm, imageUrl: url })} hint="Resized automatically" />
              </div>

              <div>
                <label className="block text-secondary mb-1 uppercase font-semibold">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  placeholder="Workout details, muscle groups targeted, benefits..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Status
                  </label>
                  <select
                    value={classForm.status}
                    onChange={(e) => setClassForm({ ...classForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-inter font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Membership Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {membershipForm.id ? "Edit Membership Plan" : "Add Membership Plan"}
              </h3>
              <button
                onClick={() => setShowMembershipModal(false)}
                className="text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMembership} className="space-y-4 font-inter text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={membershipForm.name}
                    onChange={(e) => setMembershipForm({ ...membershipForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. Gym With Spa (Single)"
                  />
                </div>

                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Category
                  </label>
                  <select
                    value={membershipForm.category}
                    onChange={(e) => setMembershipForm({ ...membershipForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="REGULAR">Regular (Any Time)</option>
                    <option value="HAPPY_HOUR">Happy Hour (20% Off)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Tier / Type
                  </label>
                  <select
                    value={membershipForm.tier}
                    onChange={(e) => setMembershipForm({ ...membershipForm, tier: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="SINGLE">Single Member</option>
                    <option value="COUPLE">Couple (2 Persons)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-secondary mb-1 uppercase font-semibold">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={membershipForm.displayOrder}
                    onChange={(e) => setMembershipForm({ ...membershipForm, displayOrder: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary mb-1 uppercase font-semibold">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={membershipForm.subtitle}
                  onChange={(e) => setMembershipForm({ ...membershipForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. All-inclusive training floor & luxury recovery center"
                />
              </div>

              {/* Exact Pre-Opening Pricing Matrix Input */}
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-3">
                <div className="text-xs font-bold text-primary uppercase">
                  Price Matrix (Official Discounted Rates)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-secondary uppercase font-semibold mb-1">
                      1 Month
                    </label>
                    <input
                      type="text"
                      required
                      value={membershipForm.price1Month}
                      onChange={(e) => setMembershipForm({ ...membershipForm, price1Month: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-surface border border-white/10 text-white text-xs"
                      placeholder="27,495 ETB"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary uppercase font-semibold mb-1">
                      3 Months
                    </label>
                    <input
                      type="text"
                      required
                      value={membershipForm.price3Months}
                      onChange={(e) => setMembershipForm({ ...membershipForm, price3Months: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-surface border border-white/10 text-white text-xs"
                      placeholder="38,844 ETB"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-secondary uppercase font-semibold mb-1">
                      6 Months
                    </label>
                    <input
                      type="text"
                      required
                      value={membershipForm.price6Months}
                      onChange={(e) => setMembershipForm({ ...membershipForm, price6Months: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-surface border border-white/10 text-white text-xs"
                      placeholder="54,600 ETB"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-primary uppercase font-semibold mb-1">
                      1 Year (40% Off)
                    </label>
                    <input
                      type="text"
                      required
                      value={membershipForm.price1Year}
                      onChange={(e) => setMembershipForm({ ...membershipForm, price1Year: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-surface border border-primary/50 text-white text-xs font-bold"
                      placeholder="77,200 ETB"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-secondary mb-1 uppercase font-semibold">
                  Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={membershipForm.features}
                  onChange={(e) => setMembershipForm({ ...membershipForm, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary"
                  placeholder="Full 1,050 m² arena access&#10;Unlimited 750 m² Spa & steam&#10;14 level-based classes"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={membershipForm.isPopular}
                    onChange={(e) => setMembershipForm({ ...membershipForm, isPopular: e.target.checked })}
                    className="rounded border-white/10 accent-primary"
                  />
                  <label htmlFor="isPopular" className="text-secondary font-medium cursor-pointer">
                    Highlight as Most Popular
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPlanActive"
                    checked={membershipForm.isActive}
                    onChange={(e) => setMembershipForm({ ...membershipForm, isActive: e.target.checked })}
                    className="rounded border-white/10 accent-primary"
                  />
                  <label htmlFor="isPlanActive" className="text-secondary font-medium cursor-pointer">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowMembershipModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-inter font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
                >
                  Save Membership Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
