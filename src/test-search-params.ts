import { searchProwlarr } from './clients/prowlarr-client';

async function testSearchParameters() {
  const testQuery = 'dune frank herbert';
  
  // Focus on the most relevant parameters based on MAM's API
  const searchTypes = ['active'] as const; // Focus on active torrents
  const sortTypes = ['seedersDesc'] as const; // Sort by seeders
  const formats = ['M4B', 'MP3'] as const;
  const languages = ['ENG', 'GER'] as const;

  for (const searchType of searchTypes) {
    for (const sortType of sortTypes) {
      for (const format of formats) {
        for (const language of languages) {
          try {
            console.log(`\nTesting combination:`)
            console.log(`  Format: ${format}`)
            console.log(`  Language: ${language}`)

            const results = await searchProwlarr(testQuery, {
              searchType,
              sortType,
              preferredFormat: format as 'M4B' | 'MP3',
              fallbackToMP3: format === 'M4B',
              language,
              minSeeders: 1
            });

            console.log(`  Results found: ${results.results.length}`)
            if (results.results.length > 0) {
              const firstResult = results.results[0];
              console.log(`  First result:`)
              console.log(`    Title: ${firstResult.title}`)
              console.log(`    Seeders: ${firstResult.seeders}`)
              console.log(`    Format: ${results.format}`)
              console.log(`    Size: ${(firstResult.size / 1024 / 1024).toFixed(2)} MB`)
            }
          } catch (error) {
            console.error(`Error with parameters:`, {
              searchType,
              sortType,
              format,
              language
            });
            console.error(error);
          }
        }
      }
    }
  }
}

console.log('Starting search parameter tests...\n');
testSearchParameters().catch(console.error);
