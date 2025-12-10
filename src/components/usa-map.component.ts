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
 * Simplified USA map path with state borders
 * This is a lightweight representation focusing on mainland USA
 * For a production app, you'd want more detailed state paths
 */
const USA_MAP_PATH = `
  M 50,100 L 200,80 L 350,90 L 500,100 L 650,90 L 800,100 L 900,120
  L 920,200 L 910,300 L 900,400 L 880,500 L 800,550 L 650,560 L 500,550
  L 350,540 L 200,530 L 100,500 L 60,400 L 50,300 Z
`;

/**
 * State border paths (simplified for lightweight rendering)
 * Format: "State Abbr": "SVG Path"
 */
const STATE_BORDERS: Record<string, string> = {
  // West Coast
  CA: "M 100,200 L 150,150 L 120,350 L 90,400 Z",
  OR: "M 100,100 L 150,100 L 150,150 L 100,150 Z",
  WA: "M 100,50 L 150,50 L 150,100 L 100,100 Z",

  // Southwest
  AZ: "M 180,350 L 250,350 L 250,420 L 180,420 Z",
  NM: "M 250,350 L 320,350 L 320,420 L 250,420 Z",
  TX: "M 320,350 L 480,350 L 480,520 L 320,480 Z",

  // Mountain States
  CO: "M 320,250 L 400,250 L 400,320 L 320,320 Z",
  WY: "M 320,180 L 400,180 L 400,250 L 320,250 Z",
  MT: "M 320,80 L 450,80 L 450,180 L 320,180 Z",
  ID: "M 200,100 L 280,100 L 280,200 L 200,200 Z",
  UT: "M 200,200 L 280,200 L 280,300 L 200,300 Z",
  NV: "M 120,150 L 200,150 L 200,300 L 120,300 Z",

  // Midwest
  ND: "M 450,80 L 550,80 L 550,140 L 450,140 Z",
  SD: "M 450,140 L 550,140 L 550,200 L 450,200 Z",
  NE: "M 450,200 L 550,200 L 550,260 L 450,260 Z",
  KS: "M 450,260 L 550,260 L 550,320 L 450,320 Z",
  OK: "M 450,320 L 550,320 L 550,380 L 450,380 Z",

  // Great Lakes
  MN: "M 550,80 L 630,80 L 630,180 L 550,180 Z",
  IA: "M 550,180 L 630,180 L 630,240 L 550,240 Z",
  MO: "M 550,240 L 630,240 L 630,330 L 550,330 Z",
  WI: "M 630,100 L 690,100 L 690,200 L 630,200 Z",
  IL: "M 630,200 L 690,200 L 690,330 L 630,330 Z",
  MI: "M 690,100 L 740,100 L 740,220 L 690,220 Z",
  IN: "M 690,220 L 740,220 L 740,320 L 690,320 Z",
  OH: "M 740,220 L 790,220 L 790,320 L 740,320 Z",

  // South
  AR: "M 550,330 L 630,330 L 630,400 L 550,400 Z",
  LA: "M 550,400 L 630,400 L 630,480 L 550,480 Z",
  MS: "M 630,360 L 680,360 L 680,480 L 630,480 Z",
  AL: "M 680,360 L 730,360 L 730,480 L 680,480 Z",
  TN: "M 630,310 L 760,310 L 760,360 L 630,360 Z",
  KY: "M 690,280 L 790,280 L 790,310 L 690,310 Z",

  // Southeast
  FL: "M 750,420 L 820,420 L 850,520 L 750,500 Z",
  GA: "M 730,360 L 800,360 L 800,460 L 730,460 Z",
  SC: "M 800,360 L 850,360 L 850,410 L 800,410 Z",
  NC: "M 790,310 L 870,310 L 870,360 L 790,360 Z",
  VA: "M 790,270 L 870,270 L 870,310 L 790,310 Z",
  WV: "M 790,240 L 830,240 L 830,280 L 790,280 Z",

  // Northeast
  PA: "M 790,200 L 860,200 L 860,250 L 790,250 Z",
  NY: "M 790,150 L 870,150 L 870,200 L 790,200 Z",
  VT: "M 870,130 L 895,130 L 895,170 L 870,170 Z",
  NH: "M 895,120 L 915,120 L 915,160 L 895,160 Z",
  ME: "M 900,80 L 940,80 L 940,150 L 900,150 Z",
  MA: "M 885,160 L 920,160 L 920,180 L 885,180 Z",
  CT: "M 870,180 L 900,180 L 900,200 L 870,200 Z",
  RI: "M 900,175 L 915,175 L 915,185 L 900,185 Z",
  NJ: "M 860,200 L 880,200 L 880,235 L 860,235 Z",
  DE: "M 860,235 L 875,235 L 875,255 L 860,255 Z",
  MD: "M 840,240 L 880,240 L 880,265 L 840,265 Z",
  DC: "M 850,255 L 855,255 L 855,260 L 850,260 Z",
};

/**
 * Render a location pin on the map
 */
function renderPin(
  location: Location,
  isCurrent: boolean,
  size: MapSize
): string {
  const { x, y } = coordsToSVG(location.latitude, location.longitude);

  // Pin size based on map size and current status
  const pinRadius = isCurrent
    ? (size === "mini" ? 6 : size === "small" ? 8 : 10)
    : (size === "mini" ? 3 : size === "small" ? 4 : 5);

  return `
    <circle
      cx="${x}"
      cy="${y}"
      r="${pinRadius}"
      fill="black"
      stroke="${isCurrent ? 'black' : 'none'}"
      stroke-width="${isCurrent ? '2' : '0'}"
    >
      <title>${isCurrent ? '📍 ' : ''}${location.city}, ${location.stateCode}</title>
    </circle>
  `;
}

/**
 * Render USA map with locations
 */
export function renderUSAMap(
  locations: Location[],
  size: MapSize = "full",
  showStateBorders: boolean = true
): string {
  const dims = MAP_DIMENSIONS[size];

  return `
    <svg
      width="${dims.width}"
      height="${dims.height}"
      viewBox="${dims.viewBox}"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Map of United States showing ministry locations"
    >
      <title>Two Witness Project Journey Map</title>

      <!-- State borders (optional) -->
      ${showStateBorders ? `
        ${Object.entries(STATE_BORDERS).map(([state, path]) => `
          <path
            d="${path}"
            fill="none"
            stroke="black"
            stroke-width="1"
          >
            <title>${state}</title>
          </path>
        `).join('')}
      ` : ''}

      <!-- Location pins -->
      ${locations.map(location => renderPin(location, location.isCurrent, size)).join('')}
    </svg>
  `;
}

/**
 * Render a simple current location indicator (no full map)
 * For homepage use
 */
export function renderCurrentLocationBadge(location: Location | null): string {
  if (!location) {
    return `<p><strong>Current location:</strong> Traveling...</p>`;
  }

  return `
    <p>
      <strong>📍 Currently in:</strong>
      <a href="/map">${location.city}, ${location.state}</a>
    </p>
  `;
}
