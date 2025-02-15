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



const { onRequest } = require("firebase-functions/v2/https");
const cors = require('cors')({ origin: true });

exports.gitHubActionTestDeployOnlyFunctions = onRequest({ timeoutSeconds: 300, memory: "1GiB" }, async (req, res) => {
    cors(req, res, async () => {
        res.status(200).send(`Smiley day to ya☀`);
    })
});
