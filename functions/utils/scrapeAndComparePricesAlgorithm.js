const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const puppeteer = require("puppeteer");

const db = getFirestore();

async function scrapeAndComparePricesAlgorithm() {
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
        const cssSelector = docData.cssSelector;
    
        let executionTimestamp = new Date().toISOString();
        let browser;
    
        try {
            browser = await puppeteer.launch({
                headless: true
            });
            const page = await browser.newPage();
            await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
    
            // Select all elements with the CSS selector and extract their text content
            const productPrices = await page.$$eval(cssSelector, elements => 
                elements.map(el => el.textContent.trim().replace(',', '.'))
            );
    
            const productPrice = parseFloat(productPrices[0]);  // Assuming only one price is found
    
            console.log(`Price found for ${docData.productName}: ${productPrice} \n\n`);
    
            const priceMatched = productPrice === expectedPrice;
            const executionRef = productsRef.doc(docId).collection('executions').doc(executionTimestamp);
            const productSaleCheckSummary = {
                executedOn: Timestamp.now(),
                foundPrice: productPrice,
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
                executedOn: Timestamp.now(),
                executionSuccessful: false,
                executionError: error.message
            };
    
            await executionRef.set(productSaleCheckSummary);
            executionResults.push({ docId, saleCheckData: productSaleCheckSummary });
    
        } finally {
            if (browser) await browser.close();
        }
    }
    return executionResults;
}

module.exports = scrapeAndComparePricesAlgorithm;
