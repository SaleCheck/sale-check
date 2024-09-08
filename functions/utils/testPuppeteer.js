const { onRequest } = require("firebase-functions/v2/https");
const puppeteer = require('puppeteer');
const cors = require('cors')({ origin: true });

exports.testPuppeteer = onRequest({ timeoutSeconds: 300, memory: "1GiB" }, async (req, res) => {
    cors(req, res, async () => {
        const productUrl = req.query.productUrl || req.body.productUrl;
        const cssSelector = req.query.cssSelector || req.body.cssSelector;

        if (req.method !== "POST") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only POST requests are allowed.' });
        if (!productUrl || !cssSelector) return res.status(400).send('Missing productUrl or cssSelector parameter');

        let browser;
        try {
            browser = await puppeteer.launch({ headless: true });

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
