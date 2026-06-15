import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { surveys } from "@/lib/surveys";

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = Array.isArray(val) ? val.join("; ") : String(val);
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const categorySlug = req.nextUrl.searchParams.get("category");
  const survey = categorySlug ? surveys[categorySlug] : null;

  const rows = (survey
    ? db.prepare("SELECT * FROM responses WHERE category = ? ORDER BY created_at DESC").all(survey.category)
    : db.prepare("SELECT * FROM responses ORDER BY created_at DESC").all()) as Record<string, unknown>[];

  const baseHeaders = ["ID", "Kategorie", "Datum/Uhrzeit", "Anonym", "Name", "E-Mail", "Zusatzfeld"];
  const questionHeaders = survey
    ? survey.questions.map((q) => `${q.id}: ${q.label}`)
    : ["Antworten (JSON)"];

  const headers = [...baseHeaders, ...questionHeaders];
  const lines = [headers.map(csvEscape).join(",")];

  for (const row of rows) {
    const answers = JSON.parse(row.answers as string) as Record<string, string | string[]>;
    const base = [
      row.id,
      row.category,
      row.created_at,
      row.anonymous ? "Ja" : "Nein",
      row.name || "",
      row.email || "",
      row.extra_field || "",
    ];
    const questionValues: (string | string[] | undefined)[] = survey
      ? survey.questions.map((q) => answers[q.id])
      : [JSON.stringify(answers)];

    lines.push([...base, ...questionValues].map(csvEscape).join(","));
  }

  const csv = "﻿" + lines.join("\r\n");
  const filename = survey ? `jazzdays2026_${survey.slug}.csv` : "jazzdays2026_alle.csv";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
