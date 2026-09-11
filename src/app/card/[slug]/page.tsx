import Image from "next/image";
import { notFound } from "next/navigation";
import { getDb, sql } from "@/lib/db";
import InquiryForm from "./InquiryForm";

async function getEmployee(slug: string) {
  const db = await getDb();
  const result = await db
    .request()
    .input("slug", sql.NVarChar, slug)
    .query(`
      SELECT e.*, c.company_name AS tenant_name, c.company_bio, c.logo AS company_logo_url,
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
    { key: "social_facebook", label: "Facebook" },
    { key: "social_instagram", label: "Instagram" },
    { key: "social_tiktok", label: "TikTok" },
    { key: "social_twitter", label: "X" },
    { key: "social_linkedin", label: "LinkedIn" },
    { key: "social_youtube", label: "YouTube" },
    { key: "social_xiaohongshu", label: "Xiaohongshu" },
  ]
    .map((s) => ({
      ...s,
      url: employee[s.key] || employee[`company_${s.key}`],
    }))
    .filter((s) => s.url);

  const cardBackground = employee.card_background || employee.company_card_background;

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-100 px-4 py-8 dark:bg-zinc-900">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-zinc-950">
        <div className="relative h-32 bg-gradient-to-br from-[#1e3a8a] to-[#0b1638]">
          {cardBackground && (
            <Image src={cardBackground} alt="" fill className="object-cover" />
          )}
        </div>

        <div className="flex flex-col items-center px-6 pb-8">
          <div className="-mt-12 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-zinc-200 dark:border-zinc-950">
            {employee.profile_photo && (
              <Image
                src={employee.profile_photo}
                alt={employee.full_name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <h1 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {employee.full_name}
          </h1>
          {employee.job_title && (
            <p className="text-sm text-zinc-500">{employee.job_title}</p>
          )}
          <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
            {employee.tenant_name}
          </p>

          <div className="mt-6 grid grid-cols-4 gap-4">
            {employee.phone && (
              <ActionIcon href={`tel:${employee.phone}`} color="bg-blue-600" label="Call" icon="call" />
            )}
            {employee.phone && (
              <ActionIcon
                href={`https://wa.me/${employee.phone.replace(/\D/g, "")}`}
                color="bg-green-500"
                label="WhatsApp"
                icon="whatsapp"
              />
            )}
            {employee.email && (
              <ActionIcon href={`mailto:${employee.email}`} color="bg-amber-500" label="Email" icon="email" />
            )}
            <ActionIcon href={`/card/${slug}/vcard`} color="bg-zinc-700" label="Save Contact" icon="vcard" />
          </div>

          {employee.bio && (
            <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {employee.bio}
            </p>
          )}

          <InquiryForm employeeId={employee.id} companyId={employee.company_id} slug={slug} />

          {socials.length > 0 && (
            <div className="mt-6 flex gap-4">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {s.label.slice(0, 2)}
                </a>
              ))}
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

function ActionIcon({
  href,
  color,
  label,
  icon,
}: {
  href: string;
  color: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${color} text-white`}
      >
        <Glyph icon={icon} />
      </span>
      <span className="text-[10px] text-zinc-500">{label}</span>
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
