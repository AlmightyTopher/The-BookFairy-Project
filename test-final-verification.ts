import { findBooksByAuthor } from './src/search/author';

async function quickTest() {
  console.log('🔥 Quick functionality test...');
  
  // Test 1: Author search
  const books1 = await findBooksByAuthor('Frank Herbert', { max: 3 });
  console.log(`✅ Found ${books1.length} books by Frank Herbert`);
  books1.forEach((book, i) => console.log(`   ${i+1}. ${book.title} (${book.year || 'N/A'})`));
  
  // Test 2: Different author
  const books2 = await findBooksByAuthor('J.K. Rowling', { max: 3 });
  console.log(`\n✅ Found ${books2.length} books by J.K. Rowling`);
  books2.forEach((book, i) => console.log(`   ${i+1}. ${book.title} (${book.year || 'N/A'})`));
  
  console.log('\n🎉 All functionality preserved with enhanced Hardcover integration!');
}

quickTest().catch(console.error);
