/**
 * Scripture Auto-linker
 * Automatically converts Bible references to LSB Bible links
 */

/**
 * Regex patterns for matching Bible references
 */
const SCRIPTURE_PATTERNS = [
  // Book chapter:verse-verse (e.g., "John 3:16-18")
  /\b(\d?\s?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)-(\d+)\b/g,
  // Book chapter:verse, verse (e.g., "John 3:16, 18")
  /\b(\d?\s?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+),\s*(\d+)\b/g,
  // Book chapter:verse (e.g., "John 3:16")
  /\b(\d?\s?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)\b/g,
];

/**
 * Known Bible book names (including common abbreviations)
 */
const BIBLE_BOOKS = [
  "Genesis", "Gen", "Exodus", "Ex", "Leviticus", "Lev", "Numbers", "Num",
  "Deuteronomy", "Deut", "Joshua", "Josh", "Judges", "Judg", "Ruth",
  "1 Samuel", "1 Sam", "2 Samuel", "2 Sam", "1 Kings", "1 Kin",
  "2 Kings", "2 Kin", "1 Chronicles", "1 Chr", "2 Chronicles", "2 Chr",
  "Ezra", "Nehemiah", "Neh", "Esther", "Est", "Job", "Psalm", "Psalms", "Ps",
  "Proverbs", "Prov", "Ecclesiastes", "Eccl", "Song of Solomon", "Song",
  "Isaiah", "Isa", "Jeremiah", "Jer", "Lamentations", "Lam", "Ezekiel", "Ezek",
  "Daniel", "Dan", "Hosea", "Hos", "Joel", "Amos", "Obadiah", "Obad",
  "Jonah", "Jon", "Micah", "Mic", "Nahum", "Nah", "Habakkuk", "Hab",
  "Zephaniah", "Zeph", "Haggai", "Hag", "Zechariah", "Zech", "Malachi", "Mal",
  "Matthew", "Matt", "Mark", "Luke", "John", "Acts",
  "Romans", "Rom", "1 Corinthians", "1 Cor", "2 Corinthians", "2 Cor",
  "Galatians", "Gal", "Ephesians", "Eph", "Philippians", "Phil",
  "Colossians", "Col", "1 Thessalonians", "1 Thess", "2 Thessalonians", "2 Thess",
  "1 Timothy", "1 Tim", "2 Timothy", "2 Tim", "Titus", "Tit", "Philemon", "Phlm",
  "Hebrews", "Heb", "James", "Jas", "1 Peter", "1 Pet", "2 Peter", "2 Pet",
  "1 John", "2 John", "3 John", "Jude", "Revelation", "Rev",
];

/**
 * Convert a Bible reference to an LSB Bible URL
 * Example: "John 3:16" -> "https://read.lsbible.org/?q=John+3%3A16"
 */
function createLSBUrl(book: string, chapter: string, verse: string, endVerse?: string): string {
  const baseUrl = "https://read.lsbible.org/?q=";

  if (endVerse) {
    // Range: John 3:16-18
    return `${baseUrl}${encodeURIComponent(`${book} ${chapter}:${verse}-${endVerse}`)}`;
  } else {
    // Single verse: John 3:16
    return `${baseUrl}${encodeURIComponent(`${book} ${chapter}:${verse}`)}`;
  }
}

/**
 * Check if a string is a valid Bible book name
 */
function isValidBook(book: string): boolean {
  const normalized = book.trim();
  return BIBLE_BOOKS.some(
    (b) => b.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Auto-link Scripture references in text
 * Converts plain text references to HTML links to LSB Bible
 *
 * @param text - Plain text that may contain Scripture references
 * @returns HTML string with Scripture references converted to links
 *
 * @example
 * ```ts
 * linkScripture("Read John 3:16 today")
 * // Returns: 'Read <a href="https://read.lsbible.org/?q=John+3%3A16">John 3:16</a> today'
 * ```
 */
export function linkScripture(text: string): string {
  let result = text;

  // Pattern 1: Book chapter:verse-verse (e.g., "John 3:16-18")
  result = result.replace(
    /\b(\d?\s?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)-(\d+)\b/g,
    (match, book, chapter, startVerse, endVerse) => {
      if (!isValidBook(book)) return match;
      const url = createLSBUrl(book, chapter, startVerse, endVerse);
      return `<a href="${url}" target="_blank" rel="noopener">${match}</a>`;
    }
  );

  // Pattern 2: Book chapter:verse, verse (e.g., "John 3:16, 18")
  result = result.replace(
    /\b(\d?\s?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+),\s*(\d+)\b/g,
    (match, book, chapter, verse1, verse2) => {
      if (!isValidBook(book)) return match;
      // Convert "John 3:16, 18" to "John 3:16, 3:18" for the URL
      const url = createLSBUrl(book, chapter, `${verse1}%2C ${verse2}`);
      return `<a href="${url}" target="_blank" rel="noopener">${match}</a>`;
    }
  );

  // Pattern 3: Book chapter:verse (e.g., "John 3:16")
  result = result.replace(
    /\b(\d?\s?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)\b/g,
    (match, book, chapter, verse) => {
      if (!isValidBook(book)) return match;
      const url = createLSBUrl(book, chapter, verse);
      return `<a href="${url}" target="_blank" rel="noopener">${match}</a>`;
    }
  );

  return result;
}

/**
 * Convert plain text with line breaks to HTML paragraphs with Scripture linking
 *
 * @param text - Plain text with newlines
 * @returns HTML string with paragraphs and linked Scripture references
 *
 * @example
 * ```ts
 * textToHtmlWithScripture("First paragraph.\n\nSecond paragraph with John 3:16.")
 * // Returns: '<p>First paragraph.</p><p>Second paragraph with <a...>John 3:16</a>.</p>'
 * ```
 */
export function textToHtmlWithScripture(text: string): string {
  // Split by double newlines (paragraph breaks)
  const paragraphs = text.split(/\n\n+/);

  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";

      // Convert single newlines to <br> and link Scripture
      const withBreaks = trimmed.replace(/\n/g, "<br>");
      const withLinks = linkScripture(withBreaks);

      return `<p>${withLinks}</p>`;
    })
    .filter((p) => p)
    .join("\n");
}
