const { initializeApp } = require("firebase-admin/app");
initializeApp();

//const testPavoniPriceMultiple = require('./productPrices/testPavoniPriceMultiple');
//const testPavoniPrice = require('./productPrices/testPavoniPrice');
const scrapeAndComparePricesOnRequest = require('./productPrices/scrapeAndComparePricesOnRequest');
const scrapeAndComparePricesOnSchedule = require('./productPrices/scrapeAndComparePricesOnSchedule');
const onProductSaleCheckExecution = require('./productPrices/onProductSaleCheckExecution');

//exports.testPavoniPriceMultiple = testPavoniPriceMultiple.testPavoniPriceMultiple;
//exports.testPavoniPrice = testPavoniPrice.testPavoniPrice;
exports.scrapeAndComparePricesOnRequest = scrapeAndComparePricesOnRequest.scrapeAndComparePricesOnRequest;
exports.scrapeAndComparePricesOnSchedule = scrapeAndComparePricesOnSchedule.scrapeAndComparePricesOnSchedule;
exports.onProductSaleCheckExecution = onProductSaleCheckExecution.onProductSaleCheckExecution;