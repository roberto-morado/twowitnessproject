export interface ColorTheme {
  primary: string;    // Base color selected by admin
  secondary: string;  // Analogous color for smooth gradients (30° offset)
  accent: string;     // Darker, saturated version for text/buttons (stays in color family)
}

/**
 * Convert hex color to HSL
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate a complete color theme from a single base color
 * Simple 3-color system for harmonious, coherent theming
 */
export function generateColorTheme(baseColor: string): ColorTheme {
  const hsl = hexToHSL(baseColor);

  // Primary: the base color
  const primary = baseColor;

  // Secondary: analogous color (30° offset) for smooth, harmonious gradient
  const secondaryHue = (hsl.h + 30) % 360;
  const secondary = hslToHex(secondaryHue, hsl.s, hsl.l);

  // Accent: darker, more saturated version of primary for text/buttons
  // Stays in same color family for coherence, but dark enough for contrast on white
  const accent = hslToHex(
    hsl.h,
    Math.min(hsl.s + 20, 90),
    Math.min(hsl.l * 0.4, 30)
  );

  return {
    primary,
    secondary,
    accent,
  };
}

/**
 * Generate CSS variables string from theme
 */
export function generateThemeCSS(theme: ColorTheme): string {
  return `
    :root {
      --color-primary: ${theme.primary};
      --color-secondary: ${theme.secondary};
      --color-accent: ${theme.accent};
    }
  `.trim();
}
