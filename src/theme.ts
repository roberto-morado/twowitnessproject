import { getDB } from "./db.ts";
import { ColorTheme, generateColorTheme } from "./colors.ts";

const THEME_KEY = ["settings", "theme"];
const DEFAULT_COLOR = "#667eea"; // Default purple color

export interface ThemeSettings {
  baseColor: string;
  theme: ColorTheme;
}

/**
 * Get the current theme from database
 * Returns default theme if none exists
 */
export async function getTheme(): Promise<ThemeSettings> {
  const db = getDB();
  const result = await db.get<ThemeSettings>(THEME_KEY);

  if (result.value) {
    return result.value;
  }

  // Return default theme
  return {
    baseColor: DEFAULT_COLOR,
    theme: generateColorTheme(DEFAULT_COLOR),
  };
}

/**
 * Save a new theme to the database
 */
export async function saveTheme(baseColor: string): Promise<ThemeSettings> {
  const db = getDB();

  // Ensure color starts with #
  if (!baseColor.startsWith("#")) {
    baseColor = "#" + baseColor;
  }

  const theme = generateColorTheme(baseColor);
  const themeSettings: ThemeSettings = {
    baseColor,
    theme,
  };

  await db.set(THEME_KEY, themeSettings);
  return themeSettings;
}
