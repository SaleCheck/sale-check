const { initializeApp } = require("firebase-admin/app");
initializeApp();

const {
    scrapeAndComparePricesOnRequest,
    scrapeAndComparePricesOnSchedule
} = require('./productPrices/scrapeAndComparePrices');
const onProductSaleCheckExecution = require('./productPrices/onProductSaleCheckExecution');
const createProductToCheck = require('./firestore/createProductToCheck');
const testPuppeteer = require('./utils/testPuppeteer');

exports.scrapeAndComparePricesOnRequest = scrapeAndComparePricesOnRequest;
exports.scrapeAndComparePricesOnSchedule = scrapeAndComparePricesOnSchedule;
exports.onProductSaleCheckExecution = onProductSaleCheckExecution.onProductSaleCheckExecution;
exports.createProductToCheck = createProductToCheck.createProductToCheck;
exports.testPuppeteer = testPuppeteer.testPuppeteer;