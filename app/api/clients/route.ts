import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const program = searchParams.get("program");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status as ClientStatus;
    }

    if (program && program !== "ALL") {
      where.preferredProgram = program;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { registeredAt: "desc" },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, age, emergencyContact, preferredProgram, membershipTier, notes, status } = body;

    if (!name || !email || !phone || !preferredProgram) {
      return NextResponse.json({ error: "Name, email, phone, and preferred program are required" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        age: age ? parseInt(age, 10) : null,
        emergencyContact,
        preferredProgram,
        membershipTier: membershipTier || "Standard",
        status: status || "CONFIRMED",
        notes,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("Clients POST error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    if (data.age) data.age = parseInt(data.age, 10);

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("Clients PATCH error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clients DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
