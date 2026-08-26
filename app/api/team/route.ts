import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const team = await prisma.teamMember.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ team });
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, category = "MANAGEMENT", bio, fullBio, imageUrl, specializations, certifications, experienceYears, experienceText, email, phone, instagram, facebook, linkedin, tiktok, displayOrder, isActive } = body;

    if (!name || !role || !bio || !imageUrl) {
      return NextResponse.json({ error: "Name, role, bio, and image are required" }, { status: 400 });
    }

    const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) + "-" + Date.now().toString().slice(-4);

    const specsArray = Array.isArray(specializations)
      ? specializations
      : typeof specializations === "string"
      ? specializations.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const certsArray = Array.isArray(certifications)
      ? certifications
      : typeof certifications === "string"
      ? certifications.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const member = await prisma.teamMember.create({
      data: {
        slug: body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        name,
        role,
        category: category || "MANAGEMENT",
        bio,
        fullBio: fullBio || bio,
        imageUrl,
        specializations: specsArray,
        certifications: certsArray,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : 5,
        experienceText: experienceText || `${experienceYears || 5}+ Years`,
        email,
        phone,
        instagram,
        facebook,
        linkedin,
        tiktok,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error("Team POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create team member" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Team Member ID is required" }, { status: 400 });
    }

    if (data.experienceYears) data.experienceYears = parseInt(data.experienceYears, 10);
    if (data.displayOrder) data.displayOrder = parseInt(data.displayOrder, 10);
    if (data.specializations && typeof data.specializations === "string") {
      data.specializations = data.specializations.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (data.certifications && typeof data.certifications === "string") {
      data.certifications = data.certifications.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error("Team PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Team Member ID is required" }, { status: 400 });
    }

    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Team member deleted" });
  } catch (error) {
    console.error("Team DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
