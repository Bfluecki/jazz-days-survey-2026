import { NextRequest, NextResponse } from "next/server";
import db, { logAdminAction } from "@/lib/db";
import { getActor } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  const rows = category
    ? db.prepare("SELECT * FROM responses WHERE category = ? ORDER BY created_at DESC").all(category)
    : db.prepare("SELECT * FROM responses ORDER BY created_at DESC").all();

  const parsed = (rows as Record<string, unknown>[]).map((r) => ({
    ...r,
    anonymous: !!r.anonymous,
    answers: JSON.parse(r.answers as string),
  }));

  logAdminAction("view_responses", category ? `category=${category}` : "alle", getActor(req));

  return NextResponse.json(parsed);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  }

  db.prepare("DELETE FROM responses WHERE id = ?").run(id);
  logAdminAction("delete_response", `id=${id}`, getActor(req));

  return NextResponse.json({ ok: true });
}
