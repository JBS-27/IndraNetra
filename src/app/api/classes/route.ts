import { classCode, readDisk, writeDisk } from "@/lib/disk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; board?: string; classLevel?: number; subject?: string };
  const disk = await readDisk();
  let code = classCode();
  while (disk.classes[code]) code = classCode();
  disk.classes[code] = {
    code,
    name: body.name || "Section",
    board: body.board || "CBSE",
    classLevel: body.classLevel || 12,
    subject: body.subject || "physics",
  };
  await writeDisk(disk);
  return NextResponse.json(disk.classes[code]);
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") || "";
  const disk = await readDisk();
  const found = disk.classes[code.toUpperCase()];
  if (!found) return NextResponse.json({ error: "No class with that code" }, { status: 404 });
  return NextResponse.json(found);
}
