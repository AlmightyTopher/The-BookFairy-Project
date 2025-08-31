import { searchProwlarr } from './clients/prowlarr-client';

async function testSearch() {
    try {
        const result = await searchProwlarr('Project Hail Mary', {
            preferredFormat: 'M4B',
            fallbackToMP3: true,
            language: 'ENG'
        });

        console.log('Search Results:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Search failed:', error);
    }
}

testSearch();
