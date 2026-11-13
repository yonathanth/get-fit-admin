import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/webp", "image/jpeg", "image/png", "image/gif"];

/** Stores an uploaded image (already resized in the browser) and returns its public path. */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Please upload a JPG, PNG, WebP or GIF image" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is too large (max 5 MB)" }, { status: 400 });

    const asset = await prisma.mediaAsset.create({
      data: { mimeType: file.type, size: file.size, data: Buffer.from(await file.arrayBuffer()) },
      select: { id: true },
    });
    // Relative path: works on the website and in the admin preview (both serve /api/media)
    return NextResponse.json({ success: true, url: `/api/media/${asset.id}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
