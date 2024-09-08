const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const cors = require('cors')({ origin: true });

exports.testPuppeteer = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const productUrl = req.query.productUrl || req.body.productUrl;
        const cssSelector = req.query.cssSelector || req.body.cssSelector;

        if (req.method !== "GET") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only GET requests are allowed.' });
        if (!productUrl || !cssSelector) return res.status(400).send('Missing productUrl or cssSelector parameter');

        let browser;
        try {
            browser = await puppeteer.launch();

            const page = await browser.newPage();
            await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

            const prices = await page.$$eval(cssSelector, elements => elements.map(el => el.textContent.trim()));
            res.send("Found price(s): " + String(prices)); 
        } catch (error) {
            console.error('Error scraping prices:', error);
            res.status(500).send(`An error occurred while scraping prices: ${error.message}`);
        } finally {
            if (browser) await browser.close();
        }
    })
});
