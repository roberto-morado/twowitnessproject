/**
 * Link Model
 * Represents a single link displayed on the homepage
 */

export interface Link {
  id: string;              // Unique identifier (UUID)
  title: string;           // Link title (e.g., "YouTube Channel")
  url: string;             // Full URL (e.g., "https://youtube.com/@twowitnessproject")
  description?: string;    // Optional description
  emoji: string;           // Emoji icon (e.g., "📺")
  order: number;           // Display order (lower = higher on page)
  isActive: boolean;       // Whether link is visible
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLinkInput {
  title: string;
  url: string;
  description?: string;
  emoji: string;
  order?: number;
}

export interface UpdateLinkInput {
  title?: string;
  url?: string;
  description?: string;
  emoji?: string;
  order?: number;
  isActive?: boolean;
}
