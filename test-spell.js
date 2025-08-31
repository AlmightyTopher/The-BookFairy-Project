const { SpellChecker } = require('./dist/utils/spell-checker');

console.log('Testing spell checker:');
console.log('Input: "find me something like dune"');
console.log('Output:', SpellChecker.correctSpelling('find me something like dune'));

console.log('\nTesting individual words:');
console.log('something:', SpellChecker.correctSpelling('something'));
console.log('find:', SpellChecker.correctSpelling('find'));
console.log('like:', SpellChecker.correctSpelling('like'));
console.log('dune:', SpellChecker.correctSpelling('dune'));
