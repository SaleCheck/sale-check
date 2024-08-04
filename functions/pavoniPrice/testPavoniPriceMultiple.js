const { logger } = require("firebase-functions");

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const puppeteer = require("puppeteer");

initializeApp();

exports.testPavoniPriceMultiple = onRequest(async (req, res) => {
    try {
        const productsWithPrices = [
            { product: 'wooden-handles-olive-kit', expectedPrice: 99.99 },
            { product: 'driptray-lever-pavone-europiccola', expectedPrice: 34.99 },
            { product: 'kit-wood-handles-for-lever-machine', expectedPrice: 69.99 }
        ];

        const browser = await puppeteer.launch({ headless: true });
        const priceResults = [];

        for (const { product, expectedPrice } of productsWithPrices) {
            console.log(product, expectedPrice);

            const page = await browser.newPage();
            await page.goto('https://www.lapavoni.com/en/products/domestic-machines/' + product);

            // Wait for the page to fully load
            await page.waitForSelector('body');

            const price = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('p.fs-4.fw-bold.text-title.text-secondary'))
                    .map(element => element.innerText)
                    .map(text => {
                        const numberString = text.split(' ')[1]; // Get the part after the space
                        const numberWithDot = numberString.replace(',', '.'); // Replace comma with dot
                        return parseFloat(numberWithDot);
                    });
            });

            priceResults.push({
                product,
                price,
                expectedPrice,
                isPriceCorrect: price[0] === expectedPrice
            });
        }

        await browser.close();
        res.status(200).json(priceResults);

    } catch (error) {
        logger.error('Error scraping the webpage:', error);
        res.status(500).send('An error occurred while scraping the webpage.');
    }
});