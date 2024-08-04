const { logger } = require("firebase-functions");

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const puppeteer = require("puppeteer");

exports.testPavoniPrice = onRequest(async (req, res) => {
    try {
        const product = req.query.product;  // ?product=wooden-handles-olive-kit
                                            // ?product=driptray-lever-pavone-europiccola
                                            // ?product=kit-wood-handles-for-lever-machine

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://www.lapavoni.com/en/products/domestic-machines/' + product);

        // return body of page
        await page.waitForSelector('body');

        const price = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('p.fs-4.fw-bold.text-title.text-secondary'))
                .map(element => element.innerText)
                .map(text => {
                    const numberString = text.split(' ')[1]; // Get the part after the space
                    const numberWithDot = numberString.replace(',', '.') // Replace comma with dot
                    return parseFloat(numberWithDot);
                });
        });

        await browser.close();
        res.status(200).json({ price });

    } catch (error) {
        logger.error('Error scraping the webpage:', error);
        res.status(500).send('An error occurred while scraping the webpage.');
    }
});