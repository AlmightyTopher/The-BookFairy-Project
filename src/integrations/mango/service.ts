// src/integrations/mango/service.ts
// Stub for mango curated service (mocked in tests)

export async function fetchCurated(genre: string, timeframe: string): Promise<Array<{
  title: string; 
  author?: string; 
  year?: number; 
  link?: string;
}>> {
  // This is a stub - tests will mock this function
  // Real implementation would fetch curated content based on genre and timeframe
  return [];
}