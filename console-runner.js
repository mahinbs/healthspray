// This is a temporary script to run the bulk add function
// You can run this in the browser console to add all Upurfit products

import { bulkAddUpurfitProducts } from './src/utils/bulkAddProducts.ts';

// Run this in browser console:
// bulkAddUpurfitProducts();

console.log('To add all Upurfit products, run: bulkAddUpurfitProducts()');

// Make function available globally for console access
window.bulkAddUpurfitProducts = bulkAddUpurfitProducts;