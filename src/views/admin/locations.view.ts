/**
 * Admin Location Management View
 * Manage ministry journey locations
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import { escapeHtml } from "@utils/html.ts";
import type { Location } from "../../models/location.model.ts";
import { renderUSAMap } from "../../components/usa-map.component.ts";

export interface AdminLocationsViewData {
  locations: Location[];
  username: string;
  editingLocation?: Location | null;
}

export function renderAdminLocations(data: AdminLocationsViewData): string {
  const { locations, username, editingLocation } = data;

  const content = `
    <h1>📍 Location Management</h1>
    <p>
      Total: <strong>${locations.length}</strong> locations
      ${locations.find(l => l.isCurrent) ? ` | Current: <strong>${locations.find(l => l.isCurrent)!.city}, ${locations.find(l => l.isCurrent)!.stateCode}</strong>` : ""}
    </p>

    ${locations.length > 0 ? `
    <section>
      <h2>Journey Map Preview</h2>
      ${renderUSAMap(locations, "small", true)}
    </section>
    ` : ""}

    <!-- Add/Edit Location Form -->
    <section>
      <h2>${editingLocation ? "Edit Location" : "Add New Location"}</h2>

      <form method="POST" action="${editingLocation ? `/dashboard/locations/${editingLocation.id}/update` : "/dashboard/locations/create"}">
        <fieldset>
          <legend>Location Details</legend>

          <div>
            <label for="city">City: *</label>
            <input
              type="text"
              id="city"
              name="city"
              required
              value="${editingLocation ? escapeHtml(editingLocation.city) : ""}"
              placeholder="Phoenix"
            >
          </div>

          <div>
            <label for="state">State (full name): *</label>
            <input
              type="text"
              id="state"
              name="state"
              required
              value="${editingLocation ? escapeHtml(editingLocation.state) : ""}"
              placeholder="Arizona"
            >
          </div>

          <div>
            <label for="stateCode">State Code: *</label>
            <input
              type="text"
              id="stateCode"
              name="stateCode"
              required
              maxlength="2"
              pattern="[A-Z]{2}"
              value="${editingLocation ? escapeHtml(editingLocation.stateCode) : ""}"
              placeholder="AZ"
            >
            <small>Two-letter state abbreviation (e.g., AZ, CA, TX)</small>
          </div>

          <div>
            <label for="latitude">Latitude: *</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              required
              step="0.0001"
              min="24"
              max="49"
              value="${editingLocation ? editingLocation.latitude : ""}"
              placeholder="33.4484"
            >
            <small>Between 24 and 49 (USA mainland)</small>
          </div>

          <div>
            <label for="longitude">Longitude: *</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              required
              step="0.0001"
              min="-125"
              max="-66"
              value="${editingLocation ? editingLocation.longitude : ""}"
              placeholder="-112.0740"
            >
            <small>Between -125 and -66 (USA mainland)</small>
          </div>

          <div>
            <label for="visitedDate">Visited Date: *</label>
            <input
              type="date"
              id="visitedDate"
              name="visitedDate"
              required
              value="${editingLocation ? editingLocation.visitedDate.toISOString().split("T")[0] : ""}"
            >
          </div>

          <div>
            <label for="notes">Notes (optional):</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              placeholder="Any additional notes about this location"
            >${editingLocation && editingLocation.notes ? escapeHtml(editingLocation.notes) : ""}</textarea>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="isCurrent"
                value="true"
                ${editingLocation?.isCurrent ? "checked" : ""}
              >
              Mark as current location
            </label>
            <small>Only one location can be current at a time</small>
          </div>

          <div>
            <button type="submit">
              ${editingLocation ? "💾 Update Location" : "➕ Add Location"}
            </button>
            ${editingLocation ? `
              <a href="/dashboard/locations">
                <button type="button">Cancel Edit</button>
              </a>
            ` : ""}
          </div>
        </fieldset>
      </form>

      <details>
        <summary>Need help finding coordinates?</summary>
        <p>
          You can find latitude and longitude for any location using:
        </p>
        <ul>
          <li><a href="https://www.latlong.net/" target="_blank" rel="noopener">LatLong.net</a></li>
          <li><a href="https://www.google.com/maps" target="_blank" rel="noopener">Google Maps</a> (right-click on map → "What's here?")</li>
        </ul>
      </details>
    </section>

    <!-- Existing Locations -->
    <section>
      <h2>All Locations</h2>

      ${locations.length === 0 ? `
        <p>No locations added yet. Add your first location above!</p>
      ` : `
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Visited</th>
              <th>Coordinates</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${locations.map(location => {
              const dateStr = location.visitedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              return `
                <tr${location.isCurrent ? ' style="background: #ffffcc;"' : ""}>
                  <td>
                    <strong>${escapeHtml(location.city)}, ${escapeHtml(location.stateCode)}</strong>
                    <br>
                    <small>${escapeHtml(location.state)}</small>
                    ${location.notes ? `<br><small>${escapeHtml(location.notes)}</small>` : ""}
                  </td>
                  <td>${dateStr}</td>
                  <td>
                    <small>${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</small>
                  </td>
                  <td>
                    ${location.isCurrent ? "📍 <strong>Current</strong>" : "Visited"}
                  </td>
                  <td>
                    <form method="POST" action="/dashboard/locations/${location.id}/edit" style="display: inline;">
                      <button type="submit">Edit</button>
                    </form>
                    ${!location.isCurrent ? `
                      <form method="POST" action="/dashboard/locations/${location.id}/set-current" style="display: inline;">
                        <button type="submit">Set Current</button>
                      </form>
                    ` : ""}
                    <form method="POST" action="/dashboard/locations/${location.id}/delete" style="display: inline;" onsubmit="return confirm('Delete this location? This cannot be undone.');">
                      <button type="submit">Delete</button>
                    </form>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      `}
    </section>
  `;

  return renderDashboardLayout({
    title: "Locations",
    content,
    activeTab: "locations",
    username,
  });
}
