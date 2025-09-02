/**
 * Detect if a title represents a multi-book series or collection
 * @param title - The book title to analyze
 * @returns Object with detection results
 */
function detectSeriesCollection(title: string): { isSeries: boolean; type: string; indicator: string } {
  const titleLower = title.toLowerCase();
  
  // Series indicators (strongest signals)
  if (titleLower.match(/\b(complete|collection|series|chronicles|saga|cycle)\b/)) {
    if (titleLower.includes('complete')) return { isSeries: true, type: 'Complete Collection', indicator: '📚 COMPLETE SERIES' };
    if (titleLower.includes('collection')) return { isSeries: true, type: 'Collection', indicator: '📚 COLLECTION' };
    if (titleLower.includes('series')) return { isSeries: true, type: 'Series', indicator: '📚 SERIES' };
    if (titleLower.includes('chronicles')) return { isSeries: true, type: 'Chronicles', indicator: '📚 CHRONICLES' };
    if (titleLower.includes('saga')) return { isSeries: true, type: 'Saga', indicator: '📚 SAGA' };
    if (titleLower.includes('cycle')) return { isSeries: true, type: 'Cycle', indicator: '📚 CYCLE' };
  }
  
  // Multi-volume indicators
  if (titleLower.match(/\b(vol\.|volume|book)\s*\d+[-–]\d+/)) {
    return { isSeries: true, type: 'Multi-Volume', indicator: '📚 MULTI-VOLUME' };
  }
  
  // "All books" indicator
  if (titleLower.match(/\ball\s+(books|novels|stories)\b/)) {
    return { isSeries: true, type: 'Complete Works', indicator: '📚 ALL BOOKS' };
  }
  
  return { isSeries: false, type: '', indicator: '' };
}

/**
 * Clean and normalize a book title by removing format tags, series info, and other noise
 * @param title - Raw book title from search results
 * @returns Cleaned title
 */
function cleanTitle(title: string): string {
  let cleaned = title;
  
  // Remove format tags like [ENG / MP3], [VIP], [ENG / M4B], etc.
  cleaned = cleaned.replace(/\s*\[.*?\]\s*/g, ' ');
  
  // Remove series/volume information patterns (but preserve for detection first)
  cleaned = cleaned.replace(/\s*[-–]\s*(Series|Vol\.?|Volume|Book)\s*\d+.*$/i, '');
  cleaned = cleaned.replace(/\s*(Series|Vol\.?|Volume|Book)\s*\d+\s*[-–:].*$/i, '');
  
  // Remove subtitle after colon if it's too long (> 20 chars) or contains technical terms
  cleaned = cleaned.replace(/:\s*([^:]{20,}|.*(?:Edition|Version|Guide|Manual|Workbook|Audio|Course).*?)$/i, '');
  
  // Remove "by [Author]" from title if it appears
  cleaned = cleaned.replace(/\s+by\s+[^,]+(?:,\s*[^,]+)*$/i, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove leading/trailing punctuation
  cleaned = cleaned.replace(/^[-–:,.\s]+|[-–:,.\s]+$/g, '');
  
  return cleaned;
}

/**
 * Clean and normalize author names by taking only the primary author
 * @param author - Raw author string from search results  
 * @returns Cleaned primary author name
 */
function cleanAuthor(author: string): string {
  let cleaned = author;
  
  // Take only the first author if multiple authors are listed
  cleaned = cleaned.split(/,|\s+and\s+|\s+&\s+/)[0].trim();
  
  // Remove publisher/series information after the author
  cleaned = cleaned.replace(/\s*[-–]\s*.+$/, '');
  
  // Remove common publisher names that sometimes get mixed in
  cleaned = cleaned.replace(/\b(The Great Courses|BBC Radio|Publisher|Press|Books|Inc\.?|Ltd\.?|LLC).*$/i, '');
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Format a book title with author for Discord (clean, no links)
 * @param title - The book title
 * @param author - The book author
 * @param index - Optional index number for numbered lists
 * @returns Clean formatted string
 */
export function formatBook(title: string, author: string, index?: number): string {
  const cleanedTitle = cleanTitle(title);
  const cleanedAuthor = cleanAuthor(author);
  
  // Detect if this is a series/collection
  const seriesInfo = detectSeriesCollection(title);
  
  let bookInfo;
  if (seriesInfo.isSeries) {
    // Bold formatting for series with special indicator
    bookInfo = `**${seriesInfo.indicator} ${cleanedTitle}** by **${cleanedAuthor}**`;
  } else {
    bookInfo = `${cleanedTitle} by ${cleanedAuthor}`;
  }
  
  const numberedPrefix = index !== undefined ? `${index}. ` : '';
  
  return `${numberedPrefix}${bookInfo}`;
}

/**
 * Format a book title with author for bullet lists (clean, no links)
 * @param title - The book title  
 * @param author - The book author
 * @returns Clean formatted string for bullet lists
 */
export function formatBookBullet(title: string, author: string): string {
  const cleanedTitle = cleanTitle(title);
  const cleanedAuthor = cleanAuthor(author);
  
  // Detect if this is a series/collection
  const seriesInfo = detectSeriesCollection(title);
  
  let bookInfo;
  if (seriesInfo.isSeries) {
    // Bold formatting for series with special indicator
    bookInfo = `**${seriesInfo.indicator} ${cleanedTitle}** by **${cleanedAuthor}**`;
  } else {
    bookInfo = `${cleanedTitle} by ${cleanedAuthor}`;
  }
  
  return `- ${bookInfo}`;
}

/**
 * Generate a Goodreads search URL for a book title and author
 * @param title - The book title
 * @param author - The book author
 * @returns Goodreads search URL
 */
export function generateGoodreadsUrl(title: string, author: string): string {
  // Clean up the title and author for better search results
  const cleanedTitle = cleanTitle(title);
  const cleanedAuthor = cleanAuthor(author);
  
  // Create search query combining title and author
  const searchQuery = `${cleanedTitle} ${cleanedAuthor}`.trim();
  
  // Encode for URL
  const encodedQuery = encodeURIComponent(searchQuery);
  
  // Return Goodreads search URL
  return `https://www.goodreads.com/search?q=${encodedQuery}`;
}
