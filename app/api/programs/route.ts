import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ programs });
  } catch (error) {
    console.error("Programs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, description, imageUrl, schedule, capacity, instructor, intensity, price, status, displayOrder } = body;

    if (!name || !category || !description || !imageUrl || !schedule || !instructor) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const program = await prisma.program.create({
      data: {
        name,
        category,
        description,
        imageUrl,
        schedule,
        capacity: capacity ? parseInt(capacity, 10) : 25,
        instructor,
        intensity: intensity || "All Levels",
        price: price || "2,000 ETB / Month",
        status: status || "ACTIVE",
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
      },
    });

    return NextResponse.json({ success: true, program });
  } catch (error) {
    console.error("Programs POST error:", error);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
    }

    if (data.capacity) data.capacity = parseInt(data.capacity, 10);
    if (data.displayOrder) data.displayOrder = parseInt(data.displayOrder, 10);

    const program = await prisma.program.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, program });
  } catch (error) {
    console.error("Programs PATCH error:", error);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
    }

    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Programs DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
