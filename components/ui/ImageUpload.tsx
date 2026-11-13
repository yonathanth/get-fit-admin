"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  /** Shown when no image is chosen, e.g. the linked event's banner. */
  fallbackPreview?: string;
  hint?: string;
  /** Block form submit until an image is set. */
  required?: boolean;
}

export default function ImageUpload({ value, onChange, fallbackPreview, hint, required }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const upload = async (file?: File | null) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const preview = value || fallbackPreview || "";

  return (
    <div className="space-y-2">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors ${
          dragging ? "border-primary bg-primary/10" : "border-white/15 bg-[#0A0A0A] hover:border-primary/60"
        }`}
      >
        {preview && <img src={preview} alt="" className={`absolute inset-0 h-full w-full object-cover ${value ? "" : "opacity-40"}`} />}
        <div className="relative flex flex-col items-center gap-1 rounded-xl bg-black/60 px-4 py-3 text-center backdrop-blur-sm">
          {uploading ? (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-[11px] text-white/80">Uploading…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-2xl text-primary">{value ? "swap_horiz" : "add_photo_alternate"}</span>
              <span className="text-[11px] font-semibold text-white">{value ? "Replace image" : "Click or drop an image"}</span>
              {!value && hint && <span className="text-[10px] text-white/50">{hint}</span>}
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px]">
        <button type="button" onClick={() => setShowUrl((s) => !s)} className="text-white/40 hover:text-white">
          {showUrl ? "Hide link field" : "Or paste an image link"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-red-400 hover:text-red-300">
            Remove image
          </button>
        )}
      </div>
      {showUrl && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or /images/hero/dsc00690.webp"
          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
        />
      )}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={value}
          onChange={() => {}}
          onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("Please add an image")}
          onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
          className="sr-only"
        />
      )}
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </div>
  );
}
