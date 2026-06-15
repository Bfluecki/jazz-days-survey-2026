import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const rows = db.prepare("SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 200").all();
  return NextResponse.json(rows);
}
