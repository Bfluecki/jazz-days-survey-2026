import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

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

  return NextResponse.json(parsed);
}
