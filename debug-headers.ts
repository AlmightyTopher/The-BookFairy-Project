#!/usr/bin/env npx tsx

import dotenv from 'dotenv';
dotenv.config();

const HC_TOKEN = process.env.HARDCOVER_API_TOKEN ?? "";
const HC_URL = process.env.HARDCOVER_GRAPHQL_URL ?? "https://api.hardcover.app/v1/graphql";

console.log('🔍 Debugging Header Formats');
console.log('===============================');

// Test the original client bearer function
function bearer(): Record<string, string> {
  return HC_TOKEN ? { authorization: HC_TOKEN } : {};
}

// Test the new buildHeaders function
function buildHeaders(): Record<string, string> {
  return {
    "content-type": "application/json",
    "user-agent": "BookFairy/1.0",
    ...(HC_TOKEN ? { authorization: HC_TOKEN } : {})
  };
}

console.log('Original client bearer():', JSON.stringify(bearer(), null, 2));
console.log('New service buildHeaders():', JSON.stringify(buildHeaders(), null, 2));

// Test the original client approach
async function testOriginalClient() {
  console.log('\n🧪 Testing Original Client Approach');
  
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
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    
    const result = await res.json();
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Test the service approach
async function testServiceApproach() {
  console.log('\n🧪 Testing Service Approach');
  
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
      headers: buildHeaders(),
      body: JSON.stringify({ query }),
    });
    
    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    
    const result = await res.json();
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function main() {
  if (!HC_TOKEN) {
    console.log('❌ No HARDCOVER_API_TOKEN found');
    return;
  }
  
  console.log(`✅ Token found (length: ${HC_TOKEN.length})`);
  console.log(`🌐 URL: ${HC_URL}`);
  
  await testOriginalClient();
  await testServiceApproach();
}

main().catch(console.error);
