import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { surveys } from "@/lib/surveys";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { category, anonymous, name, email, extraField, answers } = body;

  if (!category || !Object.keys(surveys).includes(category)) {
    return NextResponse.json({ error: "Ungültige Kategorie" }, { status: 400 });
  }

  const stmt = db.prepare(`
    INSERT INTO responses (category, created_at, anonymous, name, email, extra_field, answers)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    surveys[category].category,
    new Date().toISOString(),
    anonymous ? 1 : 0,
    anonymous ? null : name || null,
    anonymous ? null : email || null,
    extraField || null,
    JSON.stringify(answers || {})
  );

  return NextResponse.json({ ok: true });
}
