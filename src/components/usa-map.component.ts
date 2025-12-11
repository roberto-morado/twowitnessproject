/**
 * USA Map Component
 * Renders an SVG map of the United States with location pins
 * Lightweight, semantic, zero-CSS approach
 */

import type { Location } from "../models/location.model.ts";

/**
 * Map size options
 */
export type MapSize = "full" | "small" | "mini";

/**
 * Map dimensions based on size
 */
const MAP_DIMENSIONS = {
  full: { width: 960, height: 600, viewBox: "0 0 960 600" },
  small: { width: 480, height: 300, viewBox: "0 0 960 600" },
  mini: { width: 320, height: 200, viewBox: "0 0 960 600" },
};

/**
 * Convert geographic coordinates to SVG coordinates
 * USA bounding box: ~24°N to 49°N latitude, ~-125°W to ~-66°W longitude
 */
function coordsToSVG(lat: number, lon: number): { x: number; y: number } {
  // Map geographic bounds to SVG viewBox (0,0) to (960,600)
  const minLat = 24;
  const maxLat = 49;
  const minLon = -125;
  const maxLon = -66;

  // Convert lon/lat to x/y (inverted because SVG y increases downward)
  const x = ((lon - minLon) / (maxLon - minLon)) * 960;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 600;

  return { x, y };
}

/**
 * Simplified USA outline path (mainland contiguous 48 states)
 * Approximated outline for a clean, professional look
 */
const USA_OUTLINE = `
  M 50,200
  L 80,150 L 100,120 L 140,80 L 180,60 L 220,50 L 260,55 L 300,60
  L 350,70 L 400,75 L 450,65 L 500,60 L 550,55 L 600,50 L 650,55
  L 700,65 L 750,75 L 800,90 L 850,110 L 880,130 L 900,150
  L 910,180 L 915,220 L 910,260 L 900,300 L 895,340 L 890,380
  L 880,420 L 870,450 L 860,480 L 840,510 L 810,530 L 770,545
  L 720,555 L 670,560 L 620,558 L 570,555 L 520,550 L 470,545
  L 420,540 L 370,535 L 320,528 L 270,520 L 220,510 L 180,495
  L 150,475 L 130,450 L 115,420 L 105,390 L 95,360 L 85,330
  L 75,300 L 68,270 L 62,240 L 55,210
  Z
`;

/**
 * Render a location pin on the map
 */
function renderPin(location: Location, isCurrent: boolean): string {
  const { x, y } = coordsToSVG(location.latitude, location.longitude);
  const radius = isCurrent ? 8 : 5;
  const fill = isCurrent ? "#dc2626" : "#2563eb";

  return `
    <circle
      cx="${x}"
      cy="${y}"
      r="${radius}"
      fill="${fill}"
      stroke="#fff"
      stroke-width="2"
    >
      <title>${location.city}, ${location.stateCode}</title>
    </circle>
  `;
}

/**
 * Render USA map with location pins
 */
export function renderUSAMap(
  locations: Location[],
  size: MapSize = "full",
  showOutline: boolean = true
): string {
  const dims = MAP_DIMENSIONS[size];

  // Max width based on size, but always responsive
  const maxWidth = size === "full" ? "960px" : size === "small" ? "480px" : "320px";

  return `
    <svg
      viewBox="${dims.viewBox}"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Map of United States showing ministry locations"
      style="width: 100%; max-width: ${maxWidth}; height: auto;"
    >
      ${showOutline ? `
        <path
          d="${USA_OUTLINE}"
          fill="none"
          stroke="#9ca3af"
          stroke-width="2"
          stroke-linejoin="round"
        />
      ` : ""}

      ${locations.map((location) =>
        renderPin(location, location.isCurrent)
      ).join("")}
    </svg>
  `;
}

/**
 * Render current location badge for homepage
 */
export function renderCurrentLocationBadge(location: Location | null): string {
  if (!location) {
    return "<p><em>Currently traveling...</em></p>";
  }

  return `<p><strong>📍 Currently in:</strong> ${location.city}, ${location.state}</p>`;
}
