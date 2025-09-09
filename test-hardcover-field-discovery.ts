#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

// Test different GraphQL fields systematically to discover the working schema
class HardcoverFieldTester {
  private HC_URL = process.env.HARDCOVER_GRAPHQL_URL ?? "https://api.hardcover.app/v1/graphql";
  private HC_TOKEN = process.env.HARDCOVER_API_TOKEN ?? "";

  private async makeGraphQLRequest(query: string, variables: Record<string, any> = {}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(this.HC_URL, {
        method: 'POST',
        headers: {
          "content-type": "application/json",
          "user-agent": "BookFairy/1.0 FieldTester",
          authorization: `Bearer ${this.HC_TOKEN}`
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const result = await response.json();
      
      if (result.errors) {
        return { success: false, error: result.errors[0]?.message || 'GraphQL error' };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async testBasicConnection(): Promise<boolean> {
    console.log('🔗 Testing basic connection...');
    const query = `query { __typename }`;
    const result = await this.makeGraphQLRequest(query);
    
    if (result.success) {
      console.log('✅ Basic connection successful');
      return true;
    } else {
      console.log('❌ Basic connection failed:', result.error);
      return false;
    }
  }

  async testMeQuery(): Promise<void> {
    console.log('\n👤 Testing "me" query fields...');
    
    const basicFields = ['id', 'username', 'email', 'display_name', 'name', 'created_at', 'updated_at'];
    
    for (const field of basicFields) {
      const query = `query { me { ${field} } }`;
      const result = await this.makeGraphQLRequest(query);
      
      if (result.success) {
        console.log(`✅ me.${field}: works`);
      } else {
        console.log(`❌ me.${field}: ${result.error}`);
      }
    }
  }

  async testBookFields(): Promise<void> {
    console.log('\n📚 Testing book fields...');
    
    // Start with a simple book query to get some book IDs
    const idsQuery = `query { books(limit: 1) { id } }`;
    const idsResult = await this.makeGraphQLRequest(idsQuery);
    
    if (!idsResult.success) {
      console.log('❌ Cannot get book IDs:', idsResult.error);
      return;
    }

    const bookId = idsResult.data?.books?.[0]?.id;
    if (!bookId) {
      console.log('❌ No books found');
      return;
    }

    console.log(`📖 Testing fields on book ID: ${bookId}`);

    const fieldsToTest = [
      'id', 'title', 'subtitle', 'description', 'isbn', 'isbn_10', 'isbn_13', 'isbns',
      'pages', 'rating', 'ratings_count', 'reviews_count', 'users_count',
      'release_date', 'published_date', 'created_at', 'updated_at',
      'has_audiobook', 'has_ebook', 'format',
      'tags', 'genres', 'moods', 'content_warnings',
      'author_names', 'series_names',
      'image_url', 'cover_image_url'
    ];

    for (const field of fieldsToTest) {
      const query = `query { books(where: { id: { _eq: ${bookId} } }, limit: 1) { ${field} } }`;
      const result = await this.makeGraphQLRequest(query);
      
      if (result.success) {
        const value = result.data?.books?.[0]?.[field];
        console.log(`✅ books.${field}: works (value: ${JSON.stringify(value)?.slice(0, 100)}...)`);
      } else {
        console.log(`❌ books.${field}: ${result.error}`);
      }
    }
  }

  async testBookRelationships(): Promise<void> {
    console.log('\n🔗 Testing book relationship fields...');
    
    const idsQuery = `query { books(limit: 1) { id } }`;
    const idsResult = await this.makeGraphQLRequest(idsQuery);
    
    if (!idsResult.success) return;
    
    const bookId = idsResult.data?.books?.[0]?.id;
    if (!bookId) return;

    const relationshipFields = [
      'contributions { author { name } }',
      'contributions { author { id name } }',
      'authors { name }',
      'book_series { position series { name } }',
      'series { name }',
      'default_cover_edition { image { url } }',
      'cover_edition { image { url } }',
      'editions { isbn_13 title }',
      'editions(limit: 1) { isbn_13 }'
    ];

    for (const field of relationshipFields) {
      const query = `query { books(where: { id: { _eq: ${bookId} } }, limit: 1) { ${field} } }`;
      const result = await this.makeGraphQLRequest(query);
      
      if (result.success) {
        console.log(`✅ books.${field}: works`);
      } else {
        console.log(`❌ books.${field}: ${result.error}`);
      }
    }
  }

  async testSearchQuery(): Promise<void> {
    console.log('\n🔍 Testing search query...');
    
    const query = `
      query {
        search(query: "dune", query_type: "book", per_page: 3) {
          ids
          results
          query
          query_type
          page
          per_page
        }
      }
    `;
    
    const result = await this.makeGraphQLRequest(query);
    
    if (result.success) {
      console.log('✅ search query works');
      console.log('   Results:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ search query failed:', result.error);
    }
  }

  async runFullFieldDiscovery(): Promise<void> {
    console.log('🔬 Starting Hardcover GraphQL Field Discovery\n');
    
    if (!this.HC_TOKEN) {
      console.log('❌ HARDCOVER_API_TOKEN not configured');
      return;
    }

    const connected = await this.testBasicConnection();
    if (!connected) return;

    await this.testMeQuery();
    await this.testBookFields();
    await this.testBookRelationships();
    await this.testSearchQuery();
    
    console.log('\n🎉 Field discovery complete!');
  }
}

async function main() {
  const tester = new HardcoverFieldTester();
  await tester.runFullFieldDiscovery();
}

main().catch(console.error);
