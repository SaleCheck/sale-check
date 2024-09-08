const { initializeApp } = require("firebase-admin/app");
initializeApp();

const scrapeAndComparePricesOnRequest = require('./productPrices/scrapeAndComparePricesOnRequest');
const scrapeAndComparePricesOnSchedule = require('./productPrices/scrapeAndComparePricesOnSchedule');
const onProductSaleCheckExecution = require('./productPrices/onProductSaleCheckExecution');
const createProductToCheck = require('./firestore/createProductToCheck');
const testPuppeteer = require('./utils/testPuppeteer');

exports.scrapeAndComparePricesOnRequest = scrapeAndComparePricesOnRequest.scrapeAndComparePricesOnRequest;
exports.scrapeAndComparePricesOnSchedule = scrapeAndComparePricesOnSchedule.scrapeAndComparePricesOnSchedule;
exports.onProductSaleCheckExecution = onProductSaleCheckExecution.onProductSaleCheckExecution;
exports.createProductToCheck = createProductToCheck.createProductToCheck;
exports.testPuppeteer = testPuppeteer.testPuppeteer;