import { promises as fs } from "fs";
import path from "path";

const file = path.join(process.cwd(), ".data", "store.json");

export interface Disk {
  classes: Record<string, { code: string; name: string; board: string; classLevel: number; subject: string }>;
  benches: Record<string, Record<string, Record<string, unknown>>>;
  frozen: Record<string, boolean>;
}

const empty: Disk = { classes: {}, benches: {}, frozen: {} };

export async function readDisk(): Promise<Disk> {
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8")) as Disk;
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

export async function writeDisk(disk: Disk): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(disk));
}

export function classCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}
