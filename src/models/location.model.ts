/**
 * Location Model
 * Represents cities visited during ministry journey
 */

export interface Location {
  id: string;
  city: string;
  state: string;
  stateCode: string; // Two-letter code: "AZ", "CA", etc.
  latitude: number; // For SVG positioning
  longitude: number;
  visitedDate: Date;
  isCurrent: boolean; // Only one location should be current
  notes?: string; // Optional story/memory from this location
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationInput {
  city: string;
  state: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  visitedDate: Date;
  isCurrent?: boolean;
  notes?: string;
}

export interface UpdateLocationInput {
  city?: string;
  state?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
  visitedDate?: Date;
  isCurrent?: boolean;
  notes?: string;
}
