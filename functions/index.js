const { initializeApp } = require("firebase-admin/app");
initializeApp();

const {
    scrapeAndComparePricesOnRequest,
    scrapeAndComparePricesOnSchedule
} = require('./productPrices/scrapeAndComparePrices');
const onProductSaleCheckExecution = require('./productPrices/onProductSaleCheckExecution');
const testPuppeteer = require('./utils/testPuppeteer');
const createProductToCheck = require('./firestore/createProductToCheck');
const getProductToCheck = require('./firestore/getProductToCheck');

exports.scrapeAndComparePricesOnRequest = scrapeAndComparePricesOnRequest;
exports.scrapeAndComparePricesOnSchedule = scrapeAndComparePricesOnSchedule;
exports.onProductSaleCheckExecution = onProductSaleCheckExecution.onProductSaleCheckExecution;
exports.testPuppeteer = testPuppeteer.testPuppeteer;
exports.createProductToCheck = createProductToCheck.createProductToCheck;
exports.getProductToCheck = getProductToCheck.getProductToCheck;

