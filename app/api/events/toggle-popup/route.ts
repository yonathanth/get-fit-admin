import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, isPopupFeatured } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (isPopupFeatured) {
      // Unset all others first
      await prisma.upcomingEvent.updateMany({
        where: { isPopupFeatured: true },
        data: { isPopupFeatured: false },
      });

      // Set this one
      const updated = await prisma.upcomingEvent.update({
        where: { id: eventId },
        data: { isPopupFeatured: true },
      });

      return NextResponse.json({ success: true, event: updated });
    } else {
      // Unset this one
      const updated = await prisma.upcomingEvent.update({
        where: { id: eventId },
        data: { isPopupFeatured: false },
      });

      return NextResponse.json({ success: true, event: updated });
    }
  } catch (error) {
    console.error("Toggle popup error:", error);
    return NextResponse.json({ error: "Failed to toggle popup feature" }, { status: 500 });
  }
}
