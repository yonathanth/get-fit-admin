"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@GetFit2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-impact text-white uppercase tracking-tight italic">
          Get Fit <span className="text-primary">Admin</span>
        </h1>
        <p className="text-xs font-inter text-secondary mt-1.5">
          Administrative control center
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-inter flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white font-inter text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter admin username"
            />
            <span className="material-symbols-outlined absolute left-3 top-3 text-zinc-500 text-lg">
              person
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white font-inter text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
            <span className="material-symbols-outlined absolute left-3 top-3 text-zinc-500 text-lg">
              lock
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-black font-inter font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In to Dashboard</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-sm font-inter">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
