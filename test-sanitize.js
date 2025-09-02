// Quick test for sanitization
const { sanitizeUserContent } = require('./dist/utils/sanitize.js');

console.log('Testing sanitization:');

const tests = [
  { input: 'hey Book Fairy find me something good', expected: 'find me something good' },
  { input: '@Book Fairy hello', expected: 'hello' },
  { input: 'Hey Book Fairy, find harry potter', expected: 'find harry potter' },
  { input: 'hey book fairy, find me something good', expected: 'hey , find me something good' }
];

tests.forEach(({ input, expected }, i) => {
  const output = sanitizeUserContent(input);
  console.log(`\nTest ${i + 1}:`);
  console.log('Input:   "' + input + '"');
  console.log('Output:  "' + output + '"');
  console.log('Expected:"' + expected + '"');
  console.log('Match:', output === expected);
});
