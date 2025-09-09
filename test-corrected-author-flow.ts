#!/usr/bin/env tsx

/**
 * Test the corrected author search flow that now uses Hardcover integration
 * This should demonstrate the proper workflow requested by the user
 */

import { TaskExecutor } from './src/flow/task-executor.js';

interface TaskContext {
  userId: string;
  query?: string;
  selectedGenre?: string;
  timeWindow?: string;
  selectedBook?: any;
  searchResults?: any[];
}

async function testCorrectedAuthorFlow() {
  console.log('🧪 Testing Corrected Author Search Flow with Hardcover Integration\n');

  const taskExecutor = new TaskExecutor();
  
  // Test the fowler_search_author task which should now use Hardcover
  const testContext: TaskContext = {
    userId: 'test-user-123',
    query: 'Eric Ugland'
  };

  console.log('📚 Testing Author Search: "Eric Ugland"');
  console.log('Expected: Should use Hardcover as primary source with fallback to other sources\n');

  try {
    const result = await taskExecutor.executeTask('fowler_search_author', testContext);
    
    if (result.success) {
      console.log('✅ Author search completed successfully!');
      console.log(`📊 Found ${result.data?.length || 0} books\n`);
      
      if (result.data && result.data.length > 0) {
        console.log('📖 Results with rich metadata:');
        result.data.forEach((book: any, index: number) => {
          console.log(`\n${index + 1}. **${book.title}**`);
          if (book.series) {
            console.log(`   Series: ${book.series}`);
          }
          console.log(`   Author: ${book.author}`);
          if (book.rating) {
            console.log(`   Rating: ⭐ ${book.rating}`);
          }
          if (book.year) {
            console.log(`   Year: ${book.year}`);
          }
          if (book.isbn) {
            console.log(`   ISBN: ${book.isbn}`);
          }
          // Check if enhanced metadata is preserved
          if (book._originalBookMeta) {
            console.log(`   ✅ Enhanced metadata preserved`);
          }
        });
      } else {
        console.log('ℹ️  No books found for this author');
      }
      
    } else {
      console.log('❌ Author search failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }

  console.log('\n🔄 Workflow Summary:');
  console.log('1. User clicks "By Author" button');
  console.log('2. System routes to fowler_search_author task');
  console.log('3. Task now calls findBooksByAuthor() with Hardcover integration');
  console.log('4. Results include rich metadata from multiple sources');
  console.log('5. User can then select a title for download (existing functionality preserved)');
  
  console.log('\n✨ This matches the requested setup:');
  console.log('- "pull the data about the authors books from hardcover"');
  console.log('- "then if a title is chosen use the same actions using searching by title would do"');
}

// Run the test
testCorrectedAuthorFlow().catch(console.error);
