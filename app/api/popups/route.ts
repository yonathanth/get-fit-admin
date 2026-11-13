import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TYPES = ["EVENT", "DISCOUNT", "ANNOUNCEMENT"] as const;

const str = (v: unknown) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s || null;
};
const date = (v: unknown) => {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Whitelists and normalises the fields the form may send. */
function toData(body: Record<string, unknown>) {
  const type = TYPES.includes(body.type as (typeof TYPES)[number]) ? (body.type as string) : "ANNOUNCEMENT";
  return {
    type,
    title: str(body.title) ?? "",
    message: str(body.message) ?? "",
    imageUrl: str(body.imageUrl),
    badge: str(body.badge),
    promoCode: type === "DISCOUNT" ? str(body.promoCode) : null,
    ctaLabel: str(body.ctaLabel),
    ctaUrl: str(body.ctaUrl),
    eventId: type === "EVENT" ? str(body.eventId) : null,
    startsAt: date(body.startsAt),
    endsAt: date(body.endsAt),
    isActive: Boolean(body.isActive),
  };
}

/** Only one popup is live at a time: activating one switches the others off. */
async function deactivateOthers(exceptId?: string) {
  await prisma.sitePopup.updateMany({
    where: { isActive: true, ...(exceptId && { id: { not: exceptId } }) },
    data: { isActive: false },
  });
}

export async function GET() {
  try {
    const popups = await prisma.sitePopup.findMany({ orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }] });
    return NextResponse.json({ popups });
  } catch (error) {
    console.error("Popups GET error:", error);
    return NextResponse.json({ error: "Failed to fetch popups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = toData(await req.json());
    if (!data.title || !data.message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }
    if (data.type === "EVENT" && !data.eventId) {
      return NextResponse.json({ error: "Choose the event to promote" }, { status: 400 });
    }
    if (data.isActive) await deactivateOthers();
    const popup = await prisma.sitePopup.create({ data });
    return NextResponse.json({ success: true, popup });
  } catch (error) {
    console.error("Popups POST error:", error);
    return NextResponse.json({ error: "Failed to create popup" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = str(body.id);
    if (!id) return NextResponse.json({ error: "Popup ID is required" }, { status: 400 });

    // Quick toggle from the list: { id, isActive }
    if (Object.keys(body).every((k) => k === "id" || k === "isActive")) {
      if (body.isActive) await deactivateOthers(id);
      const popup = await prisma.sitePopup.update({ where: { id }, data: { isActive: Boolean(body.isActive) } });
      return NextResponse.json({ success: true, popup });
    }

    const data = toData(body);
    if (!data.title || !data.message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }
    if (data.type === "EVENT" && !data.eventId) {
      return NextResponse.json({ error: "Choose the event to promote" }, { status: 400 });
    }
    if (data.isActive) await deactivateOthers(id);
    const popup = await prisma.sitePopup.update({ where: { id }, data });
    return NextResponse.json({ success: true, popup });
  } catch (error) {
    console.error("Popups PATCH error:", error);
    return NextResponse.json({ error: "Failed to update popup" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Popup ID is required" }, { status: 400 });
    await prisma.sitePopup.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Popups DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete popup" }, { status: 500 });
  }
}
