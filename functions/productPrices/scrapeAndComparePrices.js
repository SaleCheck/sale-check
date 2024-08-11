const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const puppeteer = require("puppeteer");

initializeApp();
const db = getFirestore();

exports.scrapeAndComparePrices = onRequest(async (req, res) => {
    try {
        const executionResults = [];

        const productsRef = db.collection('productsToCheck');
        const snapshot = await productsRef.get();

        const productsRefs = {};
        for (const doc of snapshot.docs) {
            const docId = doc.id;
            const docData = doc.data();

            productsRefs[docId] = docData;

            const productUrl = docData.url;
            const expectedPrice = docData.expectedPrice;

            let executionTimestamp = new Date().toISOString();
            let browser;

            // Start scraping the data
            try {
                const browser = await puppeteer.launch({
                    headless: true
                });
                const page = await browser.newPage();
                await page.goto(productUrl);

                // Return body of page
                await page.waitForSelector('body');

                const productPrice = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('p.fs-4.fw-bold.text-title.text-secondary'))
                        .map(element => element.innerText)
                        .map(text => {
                            const numberString = text.split(' ')[1]; // Get the part after the space
                            const numberWithDot = numberString.replace(',', '.') // Replace comma with dot
                            return parseFloat(numberWithDot);
                        });
                });

                console.log(`Price found for ${docData.productName}: ${productPrice} \n\n`);

                // Create a new document in the subcollection "executions"
                const priceMatched = productPrice[0] === expectedPrice;
                const executionRef = productsRef.doc(docId).collection('executions').doc(executionTimestamp);
                const productSaleCheckSummary = {
                    executedOn: executionTimestamp,
                    foundPrice: productPrice[0],
                    samePriceAsExpected: priceMatched,
                    executionSuccessful: true
                };

                await executionRef.set(productSaleCheckSummary);
                executionResults.push({ docId, saleCheckData: productSaleCheckSummary });

            } catch (error) {
                console.log(`Error scraping the page for ${productUrl}:`, error);

                if (browser) await browser.close();

                const executionRef = productsRef.doc(docId).collection('executions').doc(executionTimestamp);
                const productSaleCheckSummary = {
                    executedOn: executionTimestamp,
                    executionSuccessful: false,
                    executionError: error.message
                };

                await executionRef.set(productSaleCheckSummary);
                executionResults.push({ docId, saleCheckData: productSaleCheckSummary });

            } finally {
                if (browser) await browser.close();
            }
        }
        res.status(200).json({ success: true, executions: executionResults });

    } catch (error) {
        console.log('Error scraping the webpage:', error);
        res.status(500).send({ success: false, error: 'An error occurred while scraping the webpage.' });
    }
});
