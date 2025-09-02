/**
 * Format a book title with author for Discord (clean, no links)
 * @param title - The book title
 * @param author - The book author
 * @param index - Optional index number for numbered lists
 * @returns Clean formatted string
 */
export function formatBook(title: string, author: string, index?: number): string {
  const bookInfo = `${title} by ${author}`;
  const numberedPrefix = index !== undefined ? `${index}. ` : '';
  
  // Clean format: "1. Title by Author"
  return `${numberedPrefix}${bookInfo}`;
}

/**
 * Format a book title with author for bullet lists (clean, no links)
 * @param title - The book title  
 * @param author - The book author
 * @returns Clean formatted string for bullet lists
 */
export function formatBookBullet(title: string, author: string): string {
  const bookInfo = `${title} by ${author}`;
  
  // Clean format: "- Title by Author"
  return `- ${bookInfo}`;
}

/**
 * Generate a Goodreads search URL for a book title and author
 * @param title - The book title
 * @param author - The book author
 * @returns Goodreads search URL
 */
export function generateGoodreadsUrl(title: string, author: string): string {
  // Clean up the title and author for URL encoding
  const cleanTitle = title.trim();
  const cleanAuthor = author.trim();
  
  // Create search query combining title and author
  const searchQuery = `${cleanTitle} ${cleanAuthor}`.trim();
  
  // Encode for URL
  const encodedQuery = encodeURIComponent(searchQuery);
  
  // Return Goodreads search URL
  return `https://www.goodreads.com/search?q=${encodedQuery}`;
}
