import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalClients,
      pendingClients,
      activePrograms,
      totalTeam,
      upcomingEventsCount,
      featuredPopupEvent,
      totalBlogs,
      unreadInquiries,
      recentClients,
      recentInquiries,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "PENDING" } }),
      prisma.program.count({ where: { status: "ACTIVE" } }),
      prisma.teamMember.count({ where: { isActive: true } }),
      prisma.upcomingEvent.count({ where: { status: "UPCOMING" } }),
      prisma.upcomingEvent.findFirst({
        where: { isPopupFeatured: true },
        select: {
          id: true,
          title: true,
          eventDate: true,
          timeString: true,
          location: true,
          imageUrl: true,
          remainingSpots: true,
        },
      }),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.inquiry.count({ where: { status: "UNREAD" } }),
      prisma.client.findMany({
        take: 5,
        orderBy: { registeredAt: "desc" },
      }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalClients,
        pendingClients,
        activePrograms,
        totalTeam,
        upcomingEventsCount,
        totalBlogs,
        unreadInquiries,
      },
      featuredPopupEvent,
      recentClients,
      recentInquiries,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
