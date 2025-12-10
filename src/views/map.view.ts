/**
 * Map View
 * Shows full USA map with location pins and sorted location list
 */

import type { Location } from "../models/location.model.ts";
import { renderUSAMap } from "../components/usa-map.component.ts";
import { renderLayout } from "./layout.ts";

/**
 * Render individual location in list
 */
function renderLocationItem(location: Location): string {
  const dateStr = location.visitedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <li>
      <strong>${location.isCurrent ? "📍 " : ""}${location.city}, ${location.stateCode}</strong>
      <br>
      <em>${location.state}</em>
      <br>
      Visited: ${dateStr}
      ${location.notes ? `<br><small>${location.notes}</small>` : ""}
    </li>
  `;
}

/**
 * Render map page content
 */
function renderMapContent(locations: Location[]): string {
  const currentLocation = locations.find((loc) => loc.isCurrent);

  return `
    <h1>Ministry Journey Map</h1>

    ${
    currentLocation
      ? `<p><strong>📍 Current location:</strong> ${currentLocation.city}, ${currentLocation.state}</p>`
      : `<p><em>Currently traveling...</em></p>`
  }

    <section>
      <h2>USA Map</h2>
      ${renderUSAMap(locations, "full", true)}
    </section>

    <section>
      <h2>Locations Visited (${locations.length})</h2>

      ${
    locations.length === 0
      ? `<p>No locations recorded yet. Check back soon as we continue our ministry journey!</p>`
      : `
        <p>
          <em>
            Listed by most recent visit first.
            ${currentLocation ? "Current location marked with 📍" : ""}
          </em>
        </p>
        <ol reversed>
          ${locations.map(renderLocationItem).join("")}
        </ol>
      `
  }
    </section>

    <p>
      <a href="/">← Back to Homepage</a>
    </p>
  `;
}

/**
 * Render full map page
 */
export function renderMapPage(locations: Location[]): string {
  return renderLayout({
    title: "Ministry Journey Map - Two Witness Project",
    content: renderMapContent(locations),
    activePage: "map",
  });
}
