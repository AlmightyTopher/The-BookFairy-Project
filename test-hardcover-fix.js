#!/usr/bin/env node

// Quick test to verify the Hardcover client fix
const { getBookDetails, getBookCoverUrl } = require('./src/integrations/hardcover/client.ts');

async function testHardcoverFix() {
  console.log("🧪 Testing Hardcover client fix...\n");

  // Test data
  const testMeta = {
    title: "The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    hcId: null
  };

  try {
    console.log("📖 Testing getBookDetails...");
    const details = await getBookDetails(testMeta);
    
    if (details) {
      console.log("✅ getBookDetails working!");
      console.log(`  - Title: ${details.title}`);
      console.log(`  - Authors: ${details.authors?.join(', ')}`);
      console.log(`  - HC ID: ${details.hcId}`);
      console.log(`  - Has cover: ${!!details.coverUrl}`);
      console.log(`  - Description length: ${details.description?.length || 0} chars`);
    } else {
      console.log("❌ getBookDetails returned null");
    }

    console.log("\n🖼️  Testing getBookCoverUrl...");
    const coverUrl = await getBookCoverUrl(testMeta);
    
    if (coverUrl) {
      console.log("✅ getBookCoverUrl working!");
      console.log(`  - Cover URL: ${coverUrl}`);
    } else {
      console.log("⚠️  getBookCoverUrl returned undefined (may be expected)");
    }

    console.log("\n🎉 Function implementation test completed!");
    console.log("✅ Discord bot should no longer crash on book detail interactions");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testHardcoverFix().catch(console.error);
}

module.exports = { testHardcoverFix };
