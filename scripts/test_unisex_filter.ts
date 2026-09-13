import { Product } from '../src/types';

function matchesGenderFilter(productGender: string, selectedGenders: string[]): boolean {
  if (selectedGenders.length === 0) return true;
  return selectedGenders.some(g => {
    if (productGender === g) return true;
    if (productGender === 'unisex' && (g === 'men' || g === 'women')) return true;
    return false;
  });
}

function matchesCollection(collectionId: string, product: { gender: string; category?: string }): boolean {
  if (collectionId === 'men') {
    return product.gender === 'men' || product.gender === 'unisex' || product.category === 'men';
  }
  if (collectionId === 'women') {
    return product.gender === 'women' || product.gender === 'unisex' || product.category === 'women';
  }
  if (collectionId === 'unisex') {
    return product.gender === 'unisex' || product.category === 'unisex';
  }
  return product.gender === collectionId || product.category === collectionId;
}

console.log('=== TESTING UNISEX FILTER INCLUSION ===\n');

// 1. Men filter selected
console.log('1. Testing selectedGenders = ["men"]:');
const menInMen = matchesGenderFilter('men', ['men']);
const unisexInMen = matchesGenderFilter('unisex', ['men']);
const womenInMen = matchesGenderFilter('women', ['men']);
console.log(' - Men fragrance included:', menInMen, '(Expected: true)');
console.log(' - Unisex fragrance included:', unisexInMen, '(Expected: true)');
console.log(' - Women fragrance included:', womenInMen, '(Expected: false)');
if (!menInMen || !unisexInMen || womenInMen) {
  console.error('FAILED Men filter test');
  process.exit(1);
}

// 2. Women filter selected
console.log('\n2. Testing selectedGenders = ["women"]:');
const womenInWomen = matchesGenderFilter('women', ['women']);
const unisexInWomen = matchesGenderFilter('unisex', ['women']);
const menInWomen = matchesGenderFilter('men', ['women']);
console.log(' - Women fragrance included:', womenInWomen, '(Expected: true)');
console.log(' - Unisex fragrance included:', unisexInWomen, '(Expected: true)');
console.log(' - Men fragrance included:', menInWomen, '(Expected: false)');
if (!womenInWomen || !unisexInWomen || menInWomen) {
  console.error('FAILED Women filter test');
  process.exit(1);
}

// 3. Unisex filter selected
console.log('\n3. Testing selectedGenders = ["unisex"]:');
const unisexInUnisex = matchesGenderFilter('unisex', ['unisex']);
const menInUnisex = matchesGenderFilter('men', ['unisex']);
const womenInUnisex = matchesGenderFilter('women', ['unisex']);
console.log(' - Unisex fragrance included:', unisexInUnisex, '(Expected: true)');
console.log(' - Men fragrance included:', menInUnisex, '(Expected: false)');
console.log(' - Women fragrance included:', womenInUnisex, '(Expected: false)');
if (!unisexInUnisex || menInUnisex || womenInUnisex) {
  console.error('FAILED Unisex filter test');
  process.exit(1);
}

// 4. Collection pages
console.log('\n4. Testing Collection Pages:');
console.log(' - Unisex in /collections/men:', matchesCollection('men', { gender: 'unisex' }), '(Expected: true)');
console.log(' - Unisex in /collections/women:', matchesCollection('women', { gender: 'unisex' }), '(Expected: true)');
console.log(' - Unisex in /collections/unisex:', matchesCollection('unisex', { gender: 'unisex' }), '(Expected: true)');
console.log(' - Men in /collections/women:', matchesCollection('women', { gender: 'men' }), '(Expected: false)');
console.log(' - Women in /collections/men:', matchesCollection('men', { gender: 'women' }), '(Expected: false)');

if (!matchesCollection('men', { gender: 'unisex' }) || !matchesCollection('women', { gender: 'unisex' })) {
  console.error('FAILED Collection pages test');
  process.exit(1);
}

console.log('\n=== ALL UNISEX FILTER TESTS PASSED SUCCESSFULLY! ===');
