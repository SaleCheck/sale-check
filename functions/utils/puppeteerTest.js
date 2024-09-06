/*Can simply be run using `node puppeteerTest.js` */ 

const puppeteer = require('puppeteer');

(async () => {
    // Launch a new browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto('https://www.lapavoni.com/en/products/domestic-machines/driptray-lever-pavone-stradivari', { waitUntil: 'domcontentloaded' });

    // Select all elements with the CSS selector and extract their text content
    const prices = await page.$$eval("p.fs-4.fw-bold.text-title.text-secondary", elements => elements.map(el => el.textContent.trim()));

    // Print the extracted prices
    console.log(prices);

    // Close the browser
    await browser.close();
})();
