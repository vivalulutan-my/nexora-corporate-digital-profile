export const CARD_THEMES = {
  corporate: {
    label: "Corporate",
    banner: "bg-gradient-to-br from-[#1e3a8a] to-[#0b1638]",
    accent: "text-blue-800 dark:text-blue-400",
    button: "bg-blue-900 hover:bg-blue-800",
  },
  basic: {
    label: "Basic",
    banner: "bg-gradient-to-br from-zinc-200 to-zinc-400 dark:from-zinc-700 dark:to-zinc-900",
    accent: "text-zinc-700 dark:text-zinc-300",
    button: "bg-zinc-800 hover:bg-zinc-700",
  },
  sunset: {
    label: "Sunset",
    banner: "bg-gradient-to-br from-orange-500 to-pink-600",
    accent: "text-orange-600 dark:text-orange-400",
    button: "bg-orange-600 hover:bg-orange-500",
  },
  ocean: {
    label: "Ocean",
    banner: "bg-gradient-to-br from-cyan-500 to-teal-800",
    accent: "text-teal-700 dark:text-teal-400",
    button: "bg-teal-700 hover:bg-teal-600",
  },
} as const;

export type CardThemeKey = keyof typeof CARD_THEMES;

export function getTheme(key: string | null | undefined) {
  return CARD_THEMES[(key as CardThemeKey) ?? "corporate"] ?? CARD_THEMES.corporate;
}
