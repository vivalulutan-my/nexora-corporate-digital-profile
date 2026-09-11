import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb, sql } from "@/lib/db";
import { getTheme } from "@/lib/themes";
import InquiryForm from "./InquiryForm";
import LeadCaptureForm from "./LeadCaptureForm";

async function getEmployee(slug: string) {
  const db = await getDb();
  const result = await db
    .request()
    .input("slug", sql.NVarChar, slug)
    .query(`
      SELECT e.*, c.company_name AS tenant_name, c.company_bio, c.logo AS company_logo_url,
        c.website AS company_website,
        c.card_background AS company_card_background,
        c.social_facebook AS company_social_facebook,
        c.social_instagram AS company_social_instagram,
        c.social_twitter AS company_social_twitter,
        c.social_tiktok AS company_social_tiktok,
        c.social_youtube AS company_social_youtube,
        c.social_linkedin AS company_social_linkedin,
        c.social_xiaohongshu AS company_social_xiaohongshu
      FROM employees e
      JOIN companies c ON c.id = e.company_id
      WHERE e.card_slug = @slug AND e.status = 'active'
    `);
  return result.recordset[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const employee = await getEmployee(slug);
  if (!employee) return { title: "Card not found" };

  const title = `${employee.full_name} — ${employee.tenant_name}`;
  const description =
    employee.bio ||
    employee.company_bio ||
    `${employee.full_name}'s digital business card at ${employee.tenant_name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: employee.profile_photo ? [employee.profile_photo] : undefined,
    },
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const employee = await getEmployee(slug);
  if (!employee) notFound();

  const db = await getDb();
  await db
    .request()
    .input("employeeId", sql.Int, employee.id)
    .input("companyId", sql.Int, employee.company_id)
    .query(
      "INSERT INTO card_views (employee_id, company_id) VALUES (@employeeId, @companyId)"
    );

  const socials = [
    { key: "social_facebook", label: "Facebook", glyph: "f", color: "bg-zinc-800" },
    { key: "social_instagram", label: "Instagram", glyph: "\u{1F4F7}", color: "bg-zinc-800" },
    { key: "social_tiktok", label: "TikTok", glyph: "♪", color: "bg-zinc-800" },
    { key: "social_twitter", label: "X", glyph: "\u{1D54F}", color: "bg-zinc-800" },
    { key: "social_linkedin", label: "LinkedIn", glyph: "in", color: "bg-zinc-800" },
    { key: "social_youtube", label: "YouTube", glyph: "▶", color: "bg-zinc-800" },
    { key: "social_xiaohongshu", label: "Xiaohongshu", glyph: "\u{1F4D5}", color: "bg-zinc-800" },
  ]
    .map((s) => ({
      ...s,
      url: employee[s.key] || employee[`company_${s.key}`],
    }))
    .filter((s) => s.url);

  const website = employee.company_website;

  const cardBackground = employee.card_background || employee.company_card_background;
  const theme = getTheme(employee.card_theme);

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-100 px-4 py-8 dark:bg-zinc-900">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-zinc-950">
        <div className={`relative h-32 ${theme.banner}`}>
          {cardBackground && (
            <Image src={cardBackground} alt="" fill className="object-cover" />
          )}
        </div>

        <div className="flex flex-col items-center px-6 pb-8">
          <div className="-mt-10 flex w-full items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-zinc-200 dark:border-zinc-950">
              {employee.profile_photo && (
                <Image
                  src={employee.profile_photo}
                  alt={employee.full_name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-col pt-8">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {employee.full_name}
              </h1>
              {employee.job_title && (
                <p className="text-sm text-zinc-500">{employee.job_title}</p>
              )}
              <p className={`text-sm font-medium ${theme.accent}`}>
                {employee.tenant_name}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {employee.phone && (
              <ActionIcon
                href={`/card/${slug}/track/call?url=${encodeURIComponent(`tel:${employee.phone}`)}`}
                color="bg-blue-600"
                icon="call"
              />
            )}
            {employee.phone && (
              <ActionIcon
                href={`/card/${slug}/track/whatsapp?url=${encodeURIComponent(
                  `https://wa.me/${employee.phone.replace(/\D/g, "")}`
                )}`}
                color="bg-green-500"
                icon="whatsapp"
              />
            )}
            {employee.email && (
              <ActionIcon
                href={`/card/${slug}/track/email?url=${encodeURIComponent(`mailto:${employee.email}`)}`}
                color="bg-amber-500"
                icon="email"
              />
            )}
            <ActionIcon
              href={`/card/${slug}/track/vcard?url=${encodeURIComponent(`/card/${slug}/vcard`)}`}
              color={theme.button.split(" ")[0]}
              icon="vcard"
            />
            <LeadCaptureForm employeeId={employee.id} companyId={employee.company_id} />
            <InquiryForm
              employeeId={employee.id}
              companyId={employee.company_id}
              slug={slug}
              buttonClass={theme.button}
            />
          </div>

          {employee.bio && (
            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {employee.bio}
            </p>
          )}

          {(website || socials.length > 0) && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-base text-white hover:bg-teal-600"
                >
                  &#127760;
                </a>
              )}
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${s.color} text-sm font-semibold text-white hover:opacity-90`}
                >
                  {s.glyph}
                </a>
              ))}
            </div>
          )}

          {employee.qr_code_path && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <Image
                src={employee.qr_code_path}
                alt="Scan to share this card"
                width={112}
                height={112}
                className="rounded-lg border border-zinc-200 p-1.5 dark:border-zinc-800"
              />
              <p className="text-xs text-zinc-400">Scan to share this card</p>
            </div>
          )}

          {employee.company_bio && (
            <p className="mt-6 text-center text-xs text-zinc-400">
              {employee.company_bio}
            </p>
          )}

          {employee.company_logo_url ? (
            <Image
              src={employee.company_logo_url}
              alt={employee.tenant_name}
              width={120}
              height={32}
              className="mt-6 h-8 w-auto object-contain"
            />
          ) : (
            <p className="mt-6 text-xs font-semibold text-zinc-400">
              {employee.tenant_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const ICON_LABELS: Record<string, string> = {
  call: "Call",
  whatsapp: "WhatsApp",
  email: "Email",
  vcard: "Save Contact",
};

function ActionIcon({
  href,
  color,
  icon,
}: {
  href: string;
  color: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-label={ICON_LABELS[icon]}
      className={`flex aspect-square items-center justify-center rounded-2xl ${color} text-xl text-white`}
    >
      <Glyph icon={icon} />
    </a>
  );
}

function Glyph({ icon }: { icon: string }) {
  switch (icon) {
    case "call":
      return <span>&#128222;</span>;
    case "whatsapp":
      return <span>&#128172;</span>;
    case "email":
      return <span>&#9993;</span>;
    case "vcard":
      return <span>&#128100;</span>;
    default:
      return null;
  }
}
