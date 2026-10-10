import { readDisk, writeDisk } from "@/lib/disk";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const code = (new URL(request.url).searchParams.get("code") || "").toUpperCase();
  const disk = await readDisk();
  const benches = Object.values(disk.benches[code] || {});
  return NextResponse.json({ frozen: Boolean(disk.frozen[code]), benches });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { classCode?: string; bench?: string; freeze?: boolean; runId?: string };
  const code = (body.classCode || "").toUpperCase();
  if (!code) return NextResponse.json({ error: "Missing class code" }, { status: 400 });
  const disk = await readDisk();
  if (typeof body.freeze === "boolean") {
    disk.frozen[code] = body.freeze;
  } else if (body.bench) {
    disk.benches[code] = disk.benches[code] || {};
    disk.benches[code][body.bench] = body as unknown as Record<string, unknown>;
  }
  await writeDisk(disk);
  return NextResponse.json({ ok: true, frozen: Boolean(disk.frozen[code]) });
}
