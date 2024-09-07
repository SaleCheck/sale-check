const { initializeApp } = require("firebase-admin/app");
initializeApp();

const scrapeAndComparePricesOnRequest = require('./productPrices/scrapeAndComparePricesOnRequest');
const scrapeAndComparePricesOnSchedule = require('./productPrices/scrapeAndComparePricesOnSchedule');
const onProductSaleCheckExecution = require('./productPrices/onProductSaleCheckExecution');
const createProductToCheck = require('./firestore/createProductToCheck');

exports.scrapeAndComparePricesOnRequest = scrapeAndComparePricesOnRequest.scrapeAndComparePricesOnRequest;
exports.scrapeAndComparePricesOnSchedule = scrapeAndComparePricesOnSchedule.scrapeAndComparePricesOnSchedule;
exports.onProductSaleCheckExecution = onProductSaleCheckExecution.onProductSaleCheckExecution;
exports.createProductToCheck = createProductToCheck.createProductToCheck;