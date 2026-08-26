import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Memberships GET error:", error);
    return NextResponse.json({ error: "Failed to fetch membership plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, tier, subtitle, price1Month, price3Months, price6Months, price1Year, isPopular, features, displayOrder, isActive } = body;

    if (!name || !price1Month || !price1Year) {
      return NextResponse.json({ error: "Plan name and prices are required" }, { status: 400 });
    }

    const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) + "-" + Date.now().toString().slice(-4);

    const featuresArray = Array.isArray(features)
      ? features
      : typeof features === "string"
      ? features.split("\n").map((f: string) => f.trim()).filter(Boolean)
      : [];

    const plan = await prisma.membershipPlan.create({
      data: {
        slug,
        name,
        category: category || "REGULAR",
        tier: tier || "SINGLE",
        subtitle: subtitle || "",
        price1Month,
        price3Months: price3Months || price1Month,
        price6Months: price6Months || price1Month,
        price1Year,
        isPopular: !!isPopular,
        features: featuresArray,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Memberships POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create membership plan" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Membership Plan ID is required" }, { status: 400 });
    }

    if (data.displayOrder) data.displayOrder = parseInt(data.displayOrder, 10);
    if (data.features && typeof data.features === "string") {
      data.features = data.features.split("\n").map((f: string) => f.trim()).filter(Boolean);
    }

    const plan = await prisma.membershipPlan.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Memberships PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update membership plan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Membership Plan ID is required" }, { status: 400 });
    }

    await prisma.membershipPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Memberships DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete membership plan" }, { status: 500 });
  }
}
