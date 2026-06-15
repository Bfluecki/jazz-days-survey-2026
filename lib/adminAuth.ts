import { NextRequest } from "next/server";

export function getActor(req: NextRequest): string {
  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [user] = decoded.split(":");
      if (user) return user;
    }
  }
  return "unknown";
}
