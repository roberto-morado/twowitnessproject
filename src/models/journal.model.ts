/**
 * Journal Entry Model
 * Represents ministry journal/blog entries
 */

export interface JournalEntry {
  id: string;
  slug: string; // URL-friendly: "encounter-in-phoenix"
  title: string;
  content: string; // Plain text with line breaks
  excerpt: string; // Auto-generated from first ~200 chars
  date: Date; // Publication date
  locationId?: string; // Optional link to Location
  isFeatured: boolean; // Show on homepage
  isPublished: boolean; // Draft vs published
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJournalEntryInput {
  title: string;
  content: string;
  date: Date;
  locationId?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface UpdateJournalEntryInput {
  title?: string;
  content?: string;
  date?: Date;
  locationId?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
}

/**
 * Journal entry with location details populated
 */
export interface JournalEntryWithLocation extends JournalEntry {
  location?: {
    city: string;
    state: string;
    stateCode: string;
  };
}
