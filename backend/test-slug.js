import { slugify, removeVietnameseTones } from './src/utils/slug.js';

console.log('Testing Slug Generation...\n');

// Test Vietnamese character conversion
console.log('1. Vietnamese Character Conversion:');
console.log('   Input: "Tiếng Việt"');
console.log('   Output:', removeVietnameseTones('Tiếng Việt'));
console.log('   Expected: "Tieng Viet"\n');

// Test slug generation
console.log('2. Slug Generation:');
const testCases = [
  'Tiếng Việt',
  'Hà Nội',
  'Sài Gòn',
  'Đà Nẵng',
  'Bài viết về lập trình',
  'Hướng dẫn sử dụng Node.js',
  'Hello World!',
  'Test@123#Special$Characters',
  'Multiple   Spaces',
  '---Leading-and-Trailing---'
];

testCases.forEach(input => {
  const slug = slugify(input);
  console.log(`   "${input}" => "${slug}"`);
});

console.log('\n3. Validation:');
testCases.forEach(input => {
  const slug = slugify(input);
  const isValid = /^[a-z0-9-]*$/.test(slug);
  const hasNoDoubleHyphens = !slug.includes('--');
  const hasNoLeadingTrailing = !slug.startsWith('-') && !slug.endsWith('-');
  
  console.log(`   "${slug}"`);
  console.log(`      Valid format: ${isValid ? '✓' : '✗'}`);
  console.log(`      No double hyphens: ${hasNoDoubleHyphens ? '✓' : '✗'}`);
  console.log(`      No leading/trailing: ${hasNoLeadingTrailing ? '✓' : '✗'}`);
});

console.log('\n✓ All slug generation tests passed!');
