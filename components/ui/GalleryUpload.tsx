"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";

interface GalleryUploadProps {
  /** Image links, one per line (the format the forms already store). */
  value: string;
  onChange: (value: string) => void;
}

const toList = (v: string) =>
  String(v ?? "")
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

/** Thumbnail grid: add several photos at once, remove or reorder them. */
export default function GalleryUpload({ value, onChange }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showText, setShowText] = useState(false);
  const urls = toList(value);

  const addFiles = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setError("");
    setPending((n) => n + list.length);
    const added: string[] = [];
    // Upload one at a time so a slow connection isn't flooded
    for (const file of list) {
      try {
        added.push(await uploadImage(file));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Some photos failed to upload");
      } finally {
        setPending((n) => n - 1);
      }
    }
    if (added.length) onChange([...toList(value), ...added].join("\n"));
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (i: number) => onChange(urls.filter((_, idx) => idx !== i).join("\n"));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= urls.length) return;
    const next = [...urls];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.join("\n"));
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`grid grid-cols-3 sm:grid-cols-4 gap-2 rounded-xl border border-dashed p-2 transition-colors ${
          dragging ? "border-primary bg-primary/10" : "border-white/15 bg-[#0A0A0A]"
        }`}
      >
        {urls.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg bg-black">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded bg-black/70 p-0.5 text-white disabled:opacity-30"
                  title="Move left"
                >
                  <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === urls.length - 1}
                  className="rounded bg-black/70 p-0.5 text-white disabled:opacity-30"
                  title="Move right"
                >
                  <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded bg-red-500/80 p-0.5 text-white"
                title="Remove photo"
              >
                <span className="material-symbols-outlined text-sm leading-none">close</span>
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: pending }).map((_, i) => (
          <div key={`pending-${i}`} className="flex aspect-square items-center justify-center rounded-lg bg-white/5">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-white/10 text-white/60 transition-colors hover:border-primary/60 hover:text-white cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl text-primary">add_photo_alternate</span>
          <span className="text-[10px] font-semibold">Add photos</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/40">
        <span>{urls.length ? `${urls.length} photo${urls.length > 1 ? "s" : ""} · drag photos in to add` : "Select or drop several photos at once"}</span>
        <button type="button" onClick={() => setShowText((s) => !s)} className="hover:text-white">
          {showText ? "Hide links" : "Edit as links"}
        </button>
      </div>
      {showText && (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="One image link per line"
          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary resize-y font-mono text-[11px]"
        />
      )}
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </div>
  );
}
