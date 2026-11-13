import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.upcomingEvent.findMany({
      orderBy: [{ eventDate: "asc" }],
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Events GET error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, eventDate, timeString, location, description, imageUrl, totalSpots, isPopupFeatured, status, dateString, paragraphs, galleryUrls } = body;

    if (!title || !eventDate || !timeString || !description || !imageUrl) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // If marked as popup featured, unset all others first
    if (isPopupFeatured) {
      await prisma.upcomingEvent.updateMany({
        where: { isPopupFeatured: true },
        data: { isPopupFeatured: false },
      });
    }

    const event = await prisma.upcomingEvent.create({
      data: {
        title,
        slug: generatedSlug,
        eventDate: new Date(eventDate),
        timeString,
        location: location || "Get Fit Gym Arena",
        description,
        imageUrl,
        dateString: dateString || null,
        paragraphs: Array.isArray(paragraphs) ? paragraphs : [],
        galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
        totalSpots: totalSpots ? parseInt(totalSpots, 10) : 50,
        remainingSpots: totalSpots ? parseInt(totalSpots, 10) : 50,
        isPopupFeatured: Boolean(isPopupFeatured),
        status: status || "UPCOMING",
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Events POST error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (data.eventDate) data.eventDate = new Date(data.eventDate);
    if (data.totalSpots) data.totalSpots = parseInt(data.totalSpots, 10);
    if (data.remainingSpots) data.remainingSpots = parseInt(data.remainingSpots, 10);

    // If setting as popup featured, unset all other events
    if (data.isPopupFeatured) {
      await prisma.upcomingEvent.updateMany({
        where: { id: { not: id }, isPopupFeatured: true },
        data: { isPopupFeatured: false },
      });
    }

    const event = await prisma.upcomingEvent.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Events PATCH error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    await prisma.upcomingEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Events DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
