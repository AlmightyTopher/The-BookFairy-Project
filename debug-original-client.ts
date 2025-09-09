#!/usr/bin/env npx tsx

import dotenv from 'dotenv';
dotenv.config();

// Import the working client functions
import { getBookDetails, getBookCoverUrl } from './src/integrations/hardcover/client';

async function main() {
  console.log('🔍 Testing Original Client Functions That Are Working');
  console.log('======================================================');

  // Test getBookDetails
  console.log('\n🧪 Testing getBookDetails');
  try {
    const result = await getBookDetails({ title: 'Dune', author: 'Frank Herbert' });
    console.log('✅ getBookDetails succeeded:', !!result);
    if (result) {
      console.log('Book details:', {
        title: result.title,
        authors: result.authors,
        hcId: result.hcId
      });
    }
  } catch (error) {
    console.log('❌ getBookDetails failed:', error);
  }

  // Test getBookCoverUrl  
  console.log('\n🧪 Testing getBookCoverUrl');
  try {
    const result = await getBookCoverUrl({ title: 'The Hobbit', author: 'J.R.R. Tolkien' });
    console.log('✅ getBookCoverUrl succeeded:', !!result);
    console.log('Cover URL:', result);
  } catch (error) {
    console.log('❌ getBookCoverUrl failed:', error);
  }

  // Test the actual gql function from client
  console.log('\n🧪 Manually testing GraphQL request like client does');
  
  const HC_URL = process.env.HARDCOVER_GRAPHQL_URL ?? "https://api.hardcover.app/v1/graphql";
  const HC_TOKEN = process.env.HARDCOVER_API_TOKEN ?? "";

  function bearer(): Record<string, string> {
    return HC_TOKEN ? { authorization: HC_TOKEN } : {};
  }

  const query = `
    query {
      me {
        id
        username
      }
    }
  `;

  try {
    const res = await fetch(HC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "BookFairy/1.0",
        ...bearer(),
      },
      body: JSON.stringify({ query }),
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.log('HTTP Error:', res.status, txt);
      return;
    }
    
    const json = await res.json();
    if (json.errors) {
      console.log('GraphQL Error:', JSON.stringify(json.errors));
      return;
    }
    
    console.log('✅ Manual GraphQL request succeeded:', json.data);
  } catch (error) {
    console.log('❌ Manual GraphQL request failed:', error);
  }
}

main().catch(console.error);
