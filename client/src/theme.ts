import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

export const prospectaTheme = defineTheme({
  name: "prospecta",
  extends: neutralTheme,
  typography: {
    scale: { base: 15, ratio: 1.18 },
    body: { family: "Manrope", fallbacks: "ui-sans-serif, system-ui, sans-serif" },
    heading: { family: "Manrope", fallbacks: "ui-sans-serif, system-ui, sans-serif", weight: "bold", weights: { 1: "bold", 2: "bold", 3: "semibold" } },
    code: { family: "IBM Plex Mono", fallbacks: "ui-monospace, SFMono-Regular, monospace" },
  },
  radius: { base: 5, multiplier: 1.05 },
  motion: { fast: 160, medium: 300, slow: 700, ratio: 0.78, character: "crisp" },
  tokens: {
    "--color-accent": ["#10BFAF", "#20D9C4"],
    "--color-on-accent": ["#062E2A", "#062E2A"],
    "--color-background-body": ["#F6F8FA", "#0D1117"],
    "--color-background-surface": ["#FFFFFF", "#141B24"],
    "--color-text-primary": ["#0D1726", "#F3F7FA"],
    "--color-text-secondary": ["#627084", "#9BAABA"],
    "--color-border": ["#E4EAF0", "#26313E"],
    "--focus-outline-color": "var(--color-accent)",
  },
});
