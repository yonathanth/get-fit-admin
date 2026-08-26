"use client";

import { useEffect, useState } from "react";

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    category: "Fitness",
    excerpt: "",
    content: "",
    coverImageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80",
    authorName: "Teshome Bekele",
    authorRole: "Head Strength Coach",
    readTime: "5 min read",
    isPublished: true,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blog");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = formData.id ? "PATCH" : "POST";
      const res = await fetch("/api/blog", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPosts =
    categoryFilter === "ALL"
      ? posts
      : posts.filter((p) => p.category.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-impact text-white uppercase tracking-tight italic">
            Blog Posts & <span className="text-primary">Articles</span>
          </h2>
          <p className="text-xs sm:text-sm font-inter text-secondary mt-0.5">
            Publish training guides, nutrition insights, and health advice
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: "",
              slug: "",
              category: "Fitness",
              excerpt: "",
              content: "",
              coverImageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80",
              authorName: "Teshome Bekele",
              authorRole: "Head Strength Coach",
              readTime: "5 min read",
              isPublished: true,
            });
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-impact text-base tracking-wider uppercase transition-all cursor-pointer"
        >
          Write Article
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap pb-1 font-inter">
        {["ALL", "Fitness", "Nutrition", "Wellness", "Training", "Lifestyle", "Health"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === cat
                ? "bg-primary text-black"
                : "bg-surface border border-white/5 text-secondary hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="py-20 text-center text-secondary">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-inter">Loading articles...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center text-secondary text-xs font-inter">
          No blog posts found for this category. Click &quot;Write Article&quot; above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-inter">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl bg-surface border border-white/5 overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-black">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-primary uppercase">
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        post.isPublished
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="space-y-1 pt-3 border-t border-white/5 text-xs text-secondary">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">person</span>
                        <span className="text-white font-medium">{post.authorName}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-base">schedule</span>
                        <span>{post.readTime}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-[#0c0c0c] border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-secondary">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setFormData(post);
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-colors"
                    title="Edit Article"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete Article"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Article Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
              <h3 className="text-2xl font-impact text-white uppercase tracking-tight italic">
                {formData.id ? "Edit Article" : "Compose New Article"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Strength Training Basics for Beginners"
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Fitness">Fitness</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Training">Training</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="e.g. Teshome Bekele"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="5 min read"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Excerpt / Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief preview..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                  Article Body Content *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full article content text..."
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0A0A] border border-white/5">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="isPublished" className="text-white text-xs font-semibold cursor-pointer">
                  Publish article immediately to public website
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
                  {formData.id ? "Update Article" : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
