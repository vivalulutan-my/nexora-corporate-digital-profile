import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveUpload(file: File, subfolder: string) {
  if (!file || file.size === 0) return null;

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${subfolder}/${filename}`;
}
