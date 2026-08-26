"use client";

import { useEffect, useState } from "react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState("ALL");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    age: "",
    emergencyContact: "",
    preferredProgram: "Strength & Power Training",
    membershipTier: "Standard",
    status: "CONFIRMED",
    notes: "",
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (programFilter !== "ALL") params.set("program", programFilter);

      const res = await fetch(`/api/clients?${params.toString()}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter, programFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: clientId, status: newStatus }),
      });
      if (res.ok) {
        fetchClients();
        if (selectedClient?.id === clientId) {
          setSelectedClient({ ...selectedClient, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this registered client?")) return;
    try {
      const res = await fetch(`/api/clients?id=${clientId}`, { method: "DELETE" });
      if (res.ok) {
        fetchClients();
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = formData.id ? "PATCH" : "POST";
      const res = await fetch("/api/clients", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          age: "",
          emergencyContact: "",
          preferredProgram: "Strength & Power Training",
          membershipTier: "Standard",
          status: "CONFIRMED",
          notes: "",
        });
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    if (clients.length === 0) return;
    const headers = ["Name,Email,Phone,Program,Tier,Status,RegisteredAt"];
    const rows = clients.map(
      (c) =>
        `"${c.name}","${c.email}","${c.phone}","${c.preferredProgram}","${c.membershipTier}","${c.status}","${new Date(c.registeredAt).toLocaleDateString()}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `get_fit_clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-impact text-white uppercase tracking-tight italic">
            Registered <span className="text-primary">Clients</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Manage membership registrations and onboarding status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-white/5 hover:border-primary/40 text-xs font-inter font-semibold text-secondary hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                phone: "",
                age: "",
                emergencyContact: "",
                preferredProgram: "Strength & Power Training",
                membershipTier: "Standard",
                status: "CONFIRMED",
                notes: "",
              });
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
          >
            Add Client
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <span className="material-symbols-outlined text-secondary text-base absolute left-3.5 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-inter text-white placeholder-secondary focus:outline-none focus:border-primary transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 font-inter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-white/5 rounded-xl py-2.5 px-3 text-xs text-secondary focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-white/5 rounded-xl py-2.5 px-3 text-xs text-secondary focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="ALL">All Programs</option>
            <option value="Strength & Power Training">Strength & Power Training</option>
            <option value="General Fitness & Conditioning">General Fitness</option>
            <option value="Adult Group Fitness">Adult Group Fitness</option>
            <option value="Kids & Teens Fitness">Kids & Teens Fitness</option>
            <option value="Zumba & Cardio Dance">Zumba & Dance</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-2xl bg-surface border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-inter">
            <thead className="bg-[#0c0c0c] text-secondary uppercase tracking-wider border-b border-white/5 font-semibold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Client Name</th>
                <th className="py-3.5 px-4 sm:px-6">Contact Info</th>
                <th className="py-3.5 px-4 sm:px-6">Program</th>
                <th className="py-3.5 px-4 sm:px-6">Tier</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6">Registered</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading clients...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary">
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="py-4 px-4 sm:px-6 font-semibold text-white">
                      {client.name}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div>{client.phone}</div>
                      <div className="text-[11px] text-secondary">{client.email}</div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-zinc-300">
                      {client.preferredProgram}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-secondary text-[11px]">
                        {client.membershipTier}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={client.status}
                        onChange={(e) => handleStatusChange(client.id, e.target.value)}
                        className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 bg-[#0A0A0A] border cursor-pointer focus:outline-none ${
                          client.status === "ACTIVE"
                            ? "text-emerald-400 border-emerald-500/30"
                            : client.status === "CONFIRMED"
                            ? "text-blue-400 border-blue-500/30"
                            : client.status === "CANCELLED"
                            ? "text-red-400 border-red-500/30"
                            : "text-amber-400 border-amber-500/30"
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-secondary text-[11px]">
                      {new Date(client.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setFormData(client);
                            setShowAddModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-colors"
                          title="Edit Client"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-secondary hover:text-red-400 transition-colors"
                          title="Delete Client"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {formData.id ? "Edit Client Profile" : "Register New Client"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 900 000 000"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age || ""}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 26"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact || ""}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Name & Phone"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Preferred Program
                </label>
                <select
                  value={formData.preferredProgram}
                  onChange={(e) => setFormData({ ...formData, preferredProgram: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Strength & Power Training">Strength & Power Training</option>
                  <option value="General Fitness & Conditioning">General Fitness & Conditioning</option>
                  <option value="Adult Group Fitness">Adult Group Fitness</option>
                  <option value="Kids & Teens Fitness">Kids & Teens Fitness</option>
                  <option value="Zumba & Cardio Dance">Zumba & Cardio Dance</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Membership Tier
                  </label>
                  <select
                    value={formData.membershipTier}
                    onChange={(e) => setFormData({ ...formData, membershipTier: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP Gold">VIP Gold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Trainer Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional trainer notes..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-secondary hover:text-white font-inter"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base uppercase tracking-wider"
                >
                  {formData.id ? "Update Client" : "Register Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-impact text-2xl">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">{selectedClient.name}</h3>
                  <p className="text-xs font-inter text-secondary">Registered {new Date(selectedClient.registeredAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-inter">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#0A0A0A] border border-white/5">
                <div>
                  <span className="text-secondary block mb-1">Phone</span>
                  <a href={`tel:${selectedClient.phone}`} className="text-primary hover:underline font-semibold block">
                    {selectedClient.phone}
                  </a>
                </div>
                <div>
                  <span className="text-secondary block mb-1">Email</span>
                  <a href={`mailto:${selectedClient.email}`} className="text-white hover:underline block truncate">
                    {selectedClient.email}
                  </a>
                </div>
                <div>
                  <span className="text-secondary block mb-1">Program</span>
                  <span className="text-white font-medium">{selectedClient.preferredProgram}</span>
                </div>
                <div>
                  <span className="text-secondary block mb-1">Tier</span>
                  <span className="text-white font-medium">{selectedClient.membershipTier}</span>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5">
                  <span className="text-secondary block mb-1 font-semibold">Trainer Notes</span>
                  <p className="text-zinc-300 leading-relaxed">{selectedClient.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormData(selectedClient);
                      setShowDetailModal(false);
                      setShowAddModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>Delete</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowDetailModal(false)}
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
