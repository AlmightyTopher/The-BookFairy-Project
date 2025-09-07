/**
 * Comprehensive End-User Hardcover API Functionality Test
 * Tests all Hardcover integration functions to ensure they work properly
 */

import { 
  hcPing, 
  searchBooksDescriptionFirst, 
  listBooksByAuthor, 
  bookMenuFromBookId, 
  editionPreflightByIsbn, 
  userHasBook,
  warnIfLengthMismatch,
  buildSmartTitleQuery
} from './src/integrations/hardcover/service';

async function testHardcoverFunctionality() {
  console.log('🔍 Starting Hardcover API End-User Functionality Test...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Test 1: API Connectivity and Authentication
  console.log('📡 Test 1: API Connectivity (hcPing)');
  try {
    const me = await hcPing();
    if (me && me.id && me.username) {
      console.log(`✅ API connection successful - User: ${me.username} (ID: ${me.id})`);
      results.passed++;
    } else {
      console.log('❌ API ping returned invalid user data');
      results.failed++;
      results.errors.push('hcPing returned invalid user data');
    }
  } catch (error) {
    console.log(`❌ API connection failed: ${error}`);
    results.failed++;
    results.errors.push(`hcPing failed: ${error}`);
  }

  // Test 2: Book Search Functionality
  console.log('\n📚 Test 2: Book Search (searchBooksDescriptionFirst)');
  try {
    const searchResults = await searchBooksDescriptionFirst('Harry Potter', 5);
    if (searchResults && searchResults.items && searchResults.items.length > 0) {
      console.log(`✅ Book search successful - Found ${searchResults.items.length} results`);
      console.log(`   First result: "${searchResults.items[0].title}" by ${searchResults.items[0].authors.join(', ')}`);
      results.passed++;
    } else {
      console.log('❌ Book search returned no results');
      results.failed++;
      results.errors.push('searchBooksDescriptionFirst returned no results');
    }
  } catch (error) {
    console.log(`❌ Book search failed: ${error}`);
    results.failed++;
    results.errors.push(`searchBooksDescriptionFirst failed: ${error}`);
  }

  // Test 3: Author Books Listing
  console.log('\n👤 Test 3: Author Books (listBooksByAuthor)');
  try {
    const authorBooks = await listBooksByAuthor('Stephen King', 5);
    if (authorBooks && authorBooks.items && authorBooks.items.length > 0) {
      console.log(`✅ Author books search successful - Found ${authorBooks.items.length} books`);
      console.log(`   Sample book: "${authorBooks.items[0].title}"`);
      results.passed++;
    } else {
      console.log('❌ Author books search returned no results');
      results.failed++;
      results.errors.push('listBooksByAuthor returned no results');
    }
  } catch (error) {
    console.log(`❌ Author books search failed: ${error}`);
    results.failed++;
    results.errors.push(`listBooksByAuthor failed: ${error}`);
  }

  // Test 4: Book Details Menu Data
  console.log('\n📖 Test 4: Book Details (bookMenuFromBookId)');
  try {
    // First get a book ID from search
    const searchForDetails = await searchBooksDescriptionFirst('The Hobbit', 1);
    if (searchForDetails.items.length > 0) {
      const bookId = searchForDetails.items[0].id;
      const bookDetails = await bookMenuFromBookId(bookId);
      
      if (bookDetails && bookDetails.title && bookDetails.authors.length > 0) {
        console.log(`✅ Book details retrieval successful`);
        console.log(`   Title: "${bookDetails.title}"`);
        console.log(`   Authors: ${bookDetails.authors.join(', ')}`);
        console.log(`   Has Audio: ${bookDetails.hasAudio ? 'Yes' : 'No'}`);
        if (bookDetails.series) console.log(`   Series: ${bookDetails.series}`);
        results.passed++;
      } else {
        console.log('❌ Book details returned incomplete data');
        results.failed++;
        results.errors.push('bookMenuFromBookId returned incomplete data');
      }
    } else {
      console.log('❌ Could not find book for details test');
      results.failed++;
      results.errors.push('No book found for details test');
    }
  } catch (error) {
    console.log(`❌ Book details retrieval failed: ${error}`);
    results.failed++;
    results.errors.push(`bookMenuFromBookId failed: ${error}`);
  }

  // Test 5: ISBN Edition Lookup
  console.log('\n🔢 Test 5: ISBN Edition Lookup (editionPreflightByIsbn)');
  try {
    // Test with a well-known ISBN (The Hobbit)
    const editions = await editionPreflightByIsbn('9780547928227');
    if (editions && editions.length > 0) {
      console.log(`✅ ISBN lookup successful - Found ${editions.length} edition(s)`);
      const edition = editions[0];
      if (edition.book) {
        console.log(`   Book: "${edition.book.title}" by ${edition.book.authors.join(', ')}`);
      }
      if (edition.format) console.log(`   Format: ${edition.format}`);
      if (edition.publisher) console.log(`   Publisher: ${edition.publisher}`);
      results.passed++;
    } else {
      console.log('❌ ISBN lookup returned no results');
      results.failed++;
      results.errors.push('editionPreflightByIsbn returned no results');
    }
  } catch (error) {
    console.log(`❌ ISBN lookup failed: ${error}`);
    results.failed++;
    results.errors.push(`editionPreflightByIsbn failed: ${error}`);
  }

  // Test 6: User Book Ownership Check
  console.log('\n📚 Test 6: User Book Ownership (userHasBook)');
  try {
    // Test with a random book ID
    const searchForOwnership = await searchBooksDescriptionFirst('Dune', 1);
    if (searchForOwnership.items.length > 0) {
      const hasBook = await userHasBook(searchForOwnership.items[0].id);
      console.log(`✅ User book ownership check successful - Has book: ${hasBook ? 'Yes' : 'No'}`);
      results.passed++;
    } else {
      console.log('❌ Could not find book for ownership test');
      results.failed++;
      results.errors.push('No book found for ownership test');
    }
  } catch (error) {
    console.log(`❌ User book ownership check failed: ${error}`);
    results.failed++;
    results.errors.push(`userHasBook failed: ${error}`);
  }

  // Test 7: Length Mismatch Warning Utility
  console.log('\n⏱️ Test 7: Length Mismatch Warning (warnIfLengthMismatch)');
  try {
    // Test with significantly different lengths (should warn)
    const warning1 = warnIfLengthMismatch(36000, 18000); // 50% difference
    if (warning1 && warning1.includes('differs by')) {
      console.log(`✅ Length mismatch warning works: "${warning1}"`);
      results.passed++;
    } else {
      console.log('❌ Length mismatch warning not generated when expected');
      results.failed++;
      results.errors.push('warnIfLengthMismatch did not warn for large difference');
    }

    // Test with similar lengths (should not warn)
    const warning2 = warnIfLengthMismatch(36000, 35000); // ~3% difference
    if (!warning2) {
      console.log('✅ No warning for small length difference (correct)');
    } else {
      console.log(`❌ Unexpected warning for small difference: "${warning2}"`);
    }
  } catch (error) {
    console.log(`❌ Length mismatch warning test failed: ${error}`);
    results.failed++;
    results.errors.push(`warnIfLengthMismatch failed: ${error}`);
  }

  // Test 8: Smart Title Query Builder
  console.log('\n🔧 Test 8: Smart Title Query Builder (buildSmartTitleQuery)');
  try {
    const query1 = buildSmartTitleQuery('The Fellowship of the Ring', 'The Lord of the Rings', 1);
    const query2 = buildSmartTitleQuery('Foundation', 'Foundation', null);
    const query3 = buildSmartTitleQuery('Standalone Book', null, null);
    
    console.log(`✅ Smart title queries generated:`);
    console.log(`   With series & number: "${query1}"`);
    console.log(`   With series only: "${query2}"`);
    console.log(`   Standalone: "${query3}"`);
    
    if (query1.includes('The Lord of the Rings') && query1.includes('#1') &&
        query2.includes('Foundation:') && 
        query3 === 'Standalone Book') {
      results.passed++;
    } else {
      console.log('❌ Smart title query format incorrect');
      results.failed++;
      results.errors.push('buildSmartTitleQuery produced incorrect format');
    }
  } catch (error) {
    console.log(`❌ Smart title query builder failed: ${error}`);
    results.failed++;
    results.errors.push(`buildSmartTitleQuery failed: ${error}`);
  }

  // Test Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 HARDCOVER API FUNCTIONALITY TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${results.passed}`);
  console.log(`❌ Tests Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🔍 Error Details:');
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  if (results.failed === 0) {
    console.log('\n🎉 All Hardcover API functions are working correctly from an end-user perspective!');
  } else {
    console.log('\n⚠️  Some Hardcover API functions need attention.');
  }

  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testHardcoverFunctionality().catch(console.error);
}

export { testHardcoverFunctionality };
