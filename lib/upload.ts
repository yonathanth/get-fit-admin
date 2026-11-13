// Browser-side image upload: shrink (longest edge 1600px, WebP) then store via /api/uploads.
const MAX_EDGE = 1600;
const QUALITY = 0.82;

async function compress(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file; // keep animation
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  return blob && blob.size < file.size ? blob : file;
}

/** Uploads one image and returns its public path (e.g. /api/media/abc123). */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  const blob = await compress(file);
  const body = new FormData();
  body.append("file", blob, file.name.replace(/\.[^.]+$/, "") + (blob.type === "image/webp" ? ".webp" : ""));
  const res = await fetch("/api/uploads", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}
