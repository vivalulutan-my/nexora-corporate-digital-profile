import { CARD_THEMES } from "@/lib/themes";

export default function ThemePicker({
  defaultValue = "corporate",
}: {
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        Card Theme
      </span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(CARD_THEMES).map(([key, theme]) => (
          <label
            key={key}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-zinc-200 p-2 text-xs has-[:checked]:border-blue-600 has-[:checked]:ring-1 has-[:checked]:ring-blue-600 dark:border-zinc-800"
          >
            <input
              type="radio"
              name="cardTheme"
              value={key}
              defaultChecked={defaultValue === key}
              className="sr-only"
            />
            <span className={`h-8 w-full rounded ${theme.banner}`} />
            {theme.label}
          </label>
        ))}
      </div>
    </label>
  );
}
