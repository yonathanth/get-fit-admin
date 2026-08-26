import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalClients,
      pendingClients,
      activePrograms,
      totalTeam,
      totalMemberships,
      upcomingEventsCount,
      featuredPopupEvent,
      totalBlogs,
      recentClients,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "PENDING" } }),
      prisma.program.count({ where: { status: "ACTIVE" } }),
      prisma.teamMember.count({ where: { isActive: true } }),
      prisma.membershipPlan.count({ where: { isActive: true } }),
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
      prisma.client.findMany({
        take: 5,
        orderBy: { registeredAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalClients,
        pendingClients,
        activePrograms,
        totalTeam,
        totalMemberships,
        upcomingEventsCount,
        totalBlogs,
      },
      featuredPopupEvent,
      recentClients,
    });
  } catch (error: any) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
