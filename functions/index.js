//const testPavoniPriceMultiple = require('./productPrices/testPavoniPriceMultiple');
//const testPavoniPrice = require('./productPrices/testPavoniPrice');
const scrapeAndComparePrices = require('./productPrices/scrapeAndComparePrices');
const scheduleScrapeAndComparePrices = require('./productPrices/scheduleScrapeAndComparePrices');
const onProductSaleCheckExecution = require('./productPrices/onProductSaleCheckExecution');

//exports.testPavoniPriceMultiple = testPavoniPriceMultiple.testPavoniPriceMultiple;
//exports.testPavoniPrice = testPavoniPrice.testPavoniPrice;
exports.scrapeAndComparePrices = scrapeAndComparePrices.scrapeAndComparePrices;
exports.scheduleScrapeAndComparePrices = scheduleScrapeAndComparePrices.scheduleScrapeAndComparePrices;
exports.onProductSaleCheckExecution = onProductSaleCheckExecution.onProductSaleCheckExecution;