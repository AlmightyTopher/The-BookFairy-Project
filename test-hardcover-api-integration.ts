#!/usr/bin/env npx tsx

/**
 * Comprehensive test for updated Hardcover API integration
 * Tests all enhanced functions and fixes any issues found
 */

import dotenv from 'dotenv';
dotenv.config();

// Import all Hardcover functions
import {
  // Enhanced functions
  searchBooks,
  searchAuthors,
  getBooksByAuthor,
  getUserLibraryBooks,
  getSeriesInfo,
  getEnhancedBookDetails,
  getBookDetailsById,
  getCurrentUser,
  
  // Legacy compatibility functions
  hcPing,
  searchBooksDescriptionFirst,
  listBooksByAuthor,
  bookMenuFromBookId,
  editionPreflightByIsbn,
  userHasBook,
  warnIfLengthMismatch,
  buildSmartTitleQuery,
  getUserBookStatus,
  
  // Original client functions
  getBookDetails,
  getBookCoverUrl,
  
  // Types
  type BookMeta,
  type BookDetails,
  type HardcoverSearchOptions,
  type AuthorSearchResult,
  type SeriesInfo,
  type BookMenuData
} from './src/integrations/hardcover/service';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  data?: any;
  duration: number;
}

class HardcoverTester {
  private results: TestResult[] = [];
  private hasToken: boolean;

  constructor() {
    this.hasToken = !!process.env.HARDCOVER_API_TOKEN;
    console.log(`🔑 API Token Status: ${this.hasToken ? 'Found' : 'Missing'}`);
    if (!this.hasToken) {
      console.warn('⚠️  Some tests will be skipped without HARDCOVER_API_TOKEN');
    }
  }

  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const start = Date.now();
    try {
      console.log(`🧪 Testing: ${name}`);
      const data = await testFn();
      const duration = Date.now() - start;
      const result: TestResult = { name, success: true, data, duration };
      console.log(`✅ ${name} (${duration}ms)`);
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      const result: TestResult = { 
        name, 
        success: false, 
        error: error instanceof Error ? error.message : String(error), 
        duration 
      };
      console.log(`❌ ${name} failed: ${result.error} (${duration}ms)`);
      this.results.push(result);
      return result;
    }
  }

  async testBasicConnectivity() {
    if (!this.hasToken) {
      console.log('⏭️  Skipping connectivity tests (no token)');
      return;
    }

    await this.runTest('hcPing', async () => {
      const result = await hcPing();
      if (typeof result !== 'boolean') {
        throw new Error(`Expected boolean, got ${typeof result}`);
      }
      return result;
    });

    await this.runTest('getCurrentUser', async () => {
      const user = await getCurrentUser();
      if (user && (!user.id || !user.username)) {
        throw new Error('User object missing required fields');
      }
      return user;
    });
  }

  async testBookSearch() {
    await this.runTest('searchBooks - Basic', async () => {
      const result = await searchBooks({
        query: 'dune',
        queryType: 'book',
        perPage: 5
      });
      
      if (!result.ids || !Array.isArray(result.ids)) {
        throw new Error('Missing or invalid ids array');
      }
      if (!result.results || !Array.isArray(result.results)) {
        throw new Error('Missing or invalid results array');
      }
      if (result.query !== 'dune') {
        throw new Error(`Query mismatch: expected 'dune', got '${result.query}'`);
      }
      
      return {
        found: result.ids.length,
        firstResult: result.results[0],
        queryType: result.queryType
      };
    });

    await this.runTest('searchBooks - Advanced', async () => {
      const result = await searchBooks({
        query: 'brandon sanderson',
        queryType: 'book',
        perPage: 3,
        fields: 'title,author_names,description',
        weights: '3,2,1',
        sort: '_text_match:desc'
      });
      
      return {
        found: result.ids.length,
        fields: result.results[0] ? Object.keys(result.results[0]) : []
      };
    });

    await this.runTest('searchBooksDescriptionFirst', async () => {
      const books = await searchBooksDescriptionFirst('fantasy epic', 3);
      
      if (!Array.isArray(books)) {
        throw new Error('Expected array of BookDetails');
      }
      
      books.forEach((book, i) => {
        if (!book.title || !book.authors) {
          throw new Error(`Book ${i} missing required fields`);
        }
      });
      
      return {
        count: books.length,
        titles: books.map(b => b.title)
      };
    });
  }

  async testAuthorFunctions() {
    await this.runTest('searchAuthors', async () => {
      const authors = await searchAuthors('sanderson', 5);
      
      if (!Array.isArray(authors)) {
        throw new Error('Expected array of AuthorSearchResult');
      }
      
      authors.forEach((author, i) => {
        if (!author.name || typeof author.booksCount !== 'number') {
          throw new Error(`Author ${i} missing required fields`);
        }
      });
      
      return {
        count: authors.length,
        names: authors.map(a => a.name)
      };
    });

    await this.runTest('getBooksByAuthor', async () => {
      const books = await getBooksByAuthor('Brandon Sanderson', 5);
      
      if (!Array.isArray(books)) {
        throw new Error('Expected array of BookDetails');
      }
      
      books.forEach((book, i) => {
        if (!book.title || !book.authors || !Array.isArray(book.authors)) {
          throw new Error(`Book ${i} missing required fields`);
        }
      });
      
      return {
        count: books.length,
        titles: books.map(b => b.title)
      };
    });

    await this.runTest('listBooksByAuthor (legacy)', async () => {
      const books = await listBooksByAuthor('Neil Gaiman', 3);
      
      if (!Array.isArray(books)) {
        throw new Error('Expected array of BookDetails');
      }
      
      return {
        count: books.length,
        titles: books.map(b => b.title)
      };
    });
  }

  async testBookDetails() {
    let testBookId: number | null = null;

    await this.runTest('getBookDetailsById', async () => {
      // Search for a book first to get an ID
      const searchResult = await searchBooks({
        query: 'the way of kings',
        queryType: 'book',
        perPage: 1
      });
      
      if (searchResult.ids.length === 0) {
        throw new Error('No books found for test');
      }
      
      testBookId = searchResult.ids[0];
      const details = await getBookDetailsById(testBookId);
      
      if (!details) {
        throw new Error('No book details returned');
      }
      
      if (!details.title || !details.authors || !Array.isArray(details.authors)) {
        throw new Error('Book details missing required fields');
      }
      
      return {
        id: details.hcId,
        title: details.title,
        authors: details.authors,
        hasDescription: !!details.description,
        hasCover: !!details.imageUrl
      };
    });

    await this.runTest('bookMenuFromBookId', async () => {
      if (!testBookId) {
        throw new Error('No test book ID available');
      }
      
      const menuData = await bookMenuFromBookId(testBookId);
      
      if (!menuData) {
        throw new Error('No menu data returned');
      }
      
      if (!menuData.title || !menuData.authors || !Array.isArray(menuData.authors)) {
        throw new Error('Menu data missing required fields');
      }
      
      return {
        id: menuData.id,
        title: menuData.title,
        authors: menuData.authors
      };
    });

    await this.runTest('getEnhancedBookDetails', async () => {
      const meta: BookMeta = {
        title: 'The Way of Kings',
        author: 'Brandon Sanderson'
      };
      
      const details = await getEnhancedBookDetails(meta);
      
      if (!details) {
        throw new Error('No enhanced details returned');
      }
      
      return {
        title: details.title,
        authors: details.authors,
        hasId: !!details.hcId
      };
    });

    await this.runTest('getBookDetails (original)', async () => {
      const meta: BookMeta = {
        title: 'Dune',
        author: 'Frank Herbert'
      };
      
      const details = await getBookDetails(meta);
      
      // This might return null, which is okay
      return {
        found: !!details,
        title: details?.title,
        authors: details?.authors
      };
    });

    await this.runTest('getBookCoverUrl', async () => {
      const meta: BookMeta = {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien'
      };
      
      const coverUrl = await getBookCoverUrl(meta);
      
      return {
        found: !!coverUrl,
        url: coverUrl
      };
    });
  }

  async testUtilityFunctions() {
    await this.runTest('buildSmartTitleQuery', async () => {
      const query1 = buildSmartTitleQuery('The Lord of the Rings: The Fellowship of the Ring', 'J.R.R. Tolkien');
      const query2 = buildSmartTitleQuery('Harry Potter (Book 1)', 'J.K. Rowling');
      
      if (!query1.includes('Tolkien') || query1.includes(':')) {
        throw new Error('Query building failed for title with colon');
      }
      
      if (!query2.includes('Rowling') || query2.includes('(')) {
        throw new Error('Query building failed for title with parentheses');
      }
      
      return { query1, query2 };
    });

    await this.runTest('warnIfLengthMismatch', async () => {
      // This should not throw, just warn
      warnIfLengthMismatch(5, 3, 'test context');
      return { tested: true };
    });

    await this.runTest('editionPreflightByIsbn', async () => {
      const result1 = await editionPreflightByIsbn('9780441172719'); // Dune ISBN
      const result2 = await editionPreflightByIsbn('invalid-isbn');
      
      if (typeof result1.exists !== 'boolean') {
        throw new Error('Invalid exists field type');
      }
      
      return {
        validIsbnExists: result1.exists,
        validIsbnBookId: result1.bookId,
        invalidIsbnExists: result2.exists
      };
    });
  }

  async testUserFunctions() {
    if (!this.hasToken) {
      console.log('⏭️  Skipping user functions (no token)');
      return;
    }

    // Get current user first
    const user = await getCurrentUser();
    if (!user) {
      console.log('⏭️  Skipping user functions (not authenticated)');
      return;
    }

    await this.runTest('getUserBookStatus', async () => {
      // Try with a random book ID - this will likely return null
      const status = await getUserBookStatus(user.id, 12345);
      
      return {
        userId: user.id,
        status: status
      };
    });

    await this.runTest('userHasBook', async () => {
      // Try with a random book ID - this will likely return false
      const hasBook = await userHasBook(user.id, 12345);
      
      if (typeof hasBook !== 'boolean') {
        throw new Error('Expected boolean result');
      }
      
      return {
        userId: user.id,
        hasBook: hasBook
      };
    });

    await this.runTest('getUserLibraryBooks', async () => {
      const books = await getUserLibraryBooks({
        userId: user.id,
        limit: 5
      });
      
      if (!Array.isArray(books)) {
        throw new Error('Expected array of BookDetails');
      }
      
      return {
        count: books.length,
        titles: books.map(b => b.title)
      };
    });
  }

  async testSeriesFunctions() {
    await this.runTest('getSeriesInfo', async () => {
      const series = await getSeriesInfo('stormlight', 3);
      
      if (!Array.isArray(series)) {
        throw new Error('Expected array of SeriesInfo');
      }
      
      series.forEach((s, i) => {
        if (!s.name || typeof s.booksCount !== 'number') {
          throw new Error(`Series ${i} missing required fields`);
        }
      });
      
      return {
        count: series.length,
        names: series.map(s => s.name)
      };
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Hardcover API Integration Tests\n');

    await this.testBasicConnectivity();
    await this.testBookSearch();
    await this.testAuthorFunctions();
    await this.testBookDetails();
    await this.testUtilityFunctions();
    await this.testUserFunctions();
    await this.testSeriesFunctions();

    this.printSummary();
  }

  private printSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total time: ${totalTime}ms`);

    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    }

    console.log('\n📋 Detailed Results:');
    this.results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`  ${status} ${r.name} (${r.duration}ms)`);
      if (r.data && r.success) {
        console.log(`     Data: ${JSON.stringify(r.data, null, 2).slice(0, 200)}...`);
      }
    });

    // Return exit code for CI/CD
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run the tests
async function main() {
  const tester = new HardcoverTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { HardcoverTester };
