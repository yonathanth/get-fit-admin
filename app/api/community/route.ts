import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const showcases = await prisma.communityShowcase.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ showcases });
  } catch (error) {
    console.error("Community GET error:", error);
    return NextResponse.json({ error: "Failed to fetch community showcases" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, eventDate, category, description, coverImageUrl, galleryUrls, highlights, location, attendees, paragraphs } = body;

    if (!title || !eventDate || !description || !coverImageUrl) {
      return NextResponse.json({ error: "Title, event date, description, and cover image are required" }, { status: 400 });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const galleryArray = Array.isArray(galleryUrls)
      ? galleryUrls
      : typeof galleryUrls === "string"
      ? galleryUrls.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const highlightsArray = Array.isArray(highlights)
      ? highlights
      : typeof highlights === "string"
      ? highlights.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const showcase = await prisma.communityShowcase.create({
      data: {
        title,
        slug: generatedSlug,
        eventDate,
        category: category || "Community",
        description,
        coverImageUrl,
        galleryUrls: galleryArray,
        highlights: highlightsArray,
        location: location || "Full Facility Arena",
        attendees: Number.parseInt(String(attendees ?? ""), 10) || 50,
        paragraphs: toParagraphs(paragraphs),
      },
    });

    return NextResponse.json({ success: true, showcase });
  } catch (error) {
    console.error("Community POST error:", error);
    return NextResponse.json({ error: "Failed to create community showcase" }, { status: 500 });
  }
}

/** Article text: blank line between paragraphs. Accepts an array or a string. */
function toParagraphs(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((p) => p.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Showcase ID is required" }, { status: 400 });
    }

    // Text areas arrive as strings (possibly empty) and are stored as arrays
    if (typeof data.galleryUrls === "string") {
      data.galleryUrls = data.galleryUrls.split("\n").map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof data.highlights === "string") {
      data.highlights = data.highlights.split("\n").map((s: string) => s.trim()).filter(Boolean);
    }
    if ("paragraphs" in data) data.paragraphs = toParagraphs(data.paragraphs);
    if ("attendees" in data) data.attendees = Number.parseInt(String(data.attendees ?? ""), 10) || 0;
    delete data.createdAt;
    delete data.updatedAt;

    const showcase = await prisma.communityShowcase.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, showcase });
  } catch (error) {
    console.error("Community PATCH error:", error);
    return NextResponse.json({ error: "Failed to update community showcase" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Showcase ID is required" }, { status: 400 });
    }

    await prisma.communityShowcase.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Community DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete community showcase" }, { status: 500 });
  }
}
