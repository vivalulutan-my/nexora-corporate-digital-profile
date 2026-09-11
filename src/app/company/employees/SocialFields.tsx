const SOCIAL_PLATFORMS: { key: string; label: string; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { key: "xiaohongshu", label: "Xiaohongshu", placeholder: "https://xiaohongshu.com/..." },
];

export default function SocialFields({
  defaultValues,
}: {
  defaultValues?: Record<string, string | null>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Social Links
      </span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOCIAL_PLATFORMS.map((p) => (
          <input
            key={p.key}
            name={`social_${p.key}`}
            placeholder={`${p.label} — ${p.placeholder}`}
            defaultValue={defaultValues?.[`social_${p.key}`] ?? ""}
            className="input"
          />
        ))}
      </div>
    </div>
  );
}
