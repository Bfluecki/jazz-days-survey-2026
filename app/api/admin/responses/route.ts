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
  const category = req.nextUrl.searchParams.get("category");

  if (id) {
    db.prepare("DELETE FROM responses WHERE id = ?").run(id);
    logAdminAction("delete_response", `id=${id}`, getActor(req));
    return NextResponse.json({ ok: true });
  }

  if (category) {
    const result = db.prepare("DELETE FROM responses WHERE category = ?").run(category);
    logAdminAction("delete_category", `category=${category}, count=${result.changes}`, getActor(req));
    return NextResponse.json({ ok: true, deleted: result.changes });
  }

  if (req.nextUrl.searchParams.get("all") === "true") {
    const result = db.prepare("DELETE FROM responses").run();
    logAdminAction("delete_all", `count=${result.changes}`, getActor(req));
    return NextResponse.json({ ok: true, deleted: result.changes });
  }

  return NextResponse.json({ error: "id, category oder all fehlt" }, { status: 400 });
}
