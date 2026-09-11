import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getDb, sql } from "@/lib/db";

function mimeTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "PNG";
  if (ext === ".gif") return "GIF";
  return "JPEG";
}

async function encodeImage(publicPath: string | null | undefined) {
  if (!publicPath) return null;
  try {
    const absolutePath = path.join(process.cwd(), "public", publicPath);
    const data = await readFile(absolutePath);
    return { base64: data.toString("base64"), type: mimeTypeFor(publicPath) };
  } catch {
    return null;
  }
}

// vCard lines must be folded at 75 octets, with continuation lines
// starting with a single space, per RFC 2426.
function foldLine(line: string) {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 0) {
    chunks.push(rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return chunks.join("\r\n ");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = await getDb();
  const result = await db
    .request()
    .input("slug", sql.NVarChar, slug)
    .query(`
      SELECT e.full_name, e.job_title, e.email, e.phone, e.profile_photo,
        c.company_name, c.logo AS company_logo
      FROM employees e
      JOIN companies c ON c.id = e.company_id
      WHERE e.card_slug = @slug
    `);

  const employee = result.recordset[0];
  if (!employee) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [photo, logo] = await Promise.all([
    encodeImage(employee.profile_photo),
    encodeImage(employee.company_logo),
  ]);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${employee.full_name}`,
    `ORG:${employee.company_name}`,
    employee.job_title ? `TITLE:${employee.job_title}` : "",
    employee.phone ? `TEL:${employee.phone}` : "",
    employee.email ? `EMAIL:${employee.email}` : "",
    photo ? `PHOTO;ENCODING=b;TYPE=${photo.type}:${photo.base64}` : "",
    logo ? `LOGO;ENCODING=b;TYPE=${logo.type}:${logo.base64}` : "",
    "END:VCARD",
  ].filter(Boolean);

  const vcf = lines.map(foldLine).join("\r\n");

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard",
      "Content-Disposition": `attachment; filename="${slug}.vcf"`,
    },
  });
}
