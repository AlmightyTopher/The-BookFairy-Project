#!/usr/bin/env npx tsx

import dotenv from 'dotenv';
dotenv.config();

const HC_TOKEN = process.env.HARDCOVER_API_TOKEN ?? "";
const HC_URL = process.env.HARDCOVER_GRAPHQL_URL ?? "https://api.hardcover.app/v1/graphql";

console.log('🔍 Testing Different Authorization Header Formats');
console.log('=================================================');

const query = `
  query {
    me {
      id
      username
    }
  }
`;

// Test different authorization formats
const authFormats: { name: string; headers: Record<string, string> }[] = [
  { name: 'Raw token (current)', headers: { authorization: HC_TOKEN } },
  { name: 'Bearer prefix', headers: { authorization: `Bearer ${HC_TOKEN}` } },
  { name: 'Authorization uppercase', headers: { Authorization: HC_TOKEN } },
  { name: 'Authorization uppercase with Bearer', headers: { Authorization: `Bearer ${HC_TOKEN}` } },
  { name: 'x-authorization', headers: { 'x-authorization': HC_TOKEN } },
  { name: 'x-hasura-user-token', headers: { 'x-hasura-user-token': HC_TOKEN } },
];

async function testAuthFormat(format: { name: string; headers: Record<string, string> }) {
  console.log(`\n🧪 Testing: ${format.name}`);
  
  try {
    const res = await fetch(HC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "BookFairy/1.0",
        ...format.headers,
      },
      body: JSON.stringify({ query }),
    });
    
    console.log(`Response status: ${res.status}`);
    
    const result = await res.json();
    
    if (result.errors) {
      console.log(`❌ Error: ${JSON.stringify(result.errors[0])}`);
    } else if (result.data) {
      console.log(`✅ Success: ${JSON.stringify(result.data)}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Exception: ${error}`);
  }
  
  return false;
}

async function main() {
  if (!HC_TOKEN) {
    console.log('❌ No HARDCOVER_API_TOKEN found');
    return;
  }
  
  console.log(`✅ Token found (length: ${HC_TOKEN.length})`);
  console.log(`🌐 URL: ${HC_URL}`);
  
  for (const format of authFormats) {
    const success = await testAuthFormat(format);
    if (success) {
      console.log(`\n🎉 Working format found: ${format.name}`);
      break;
    }
  }
}

main().catch(console.error);
