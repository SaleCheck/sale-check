require("firebase-functions/logger/compat");
const { onRequest } = require("firebase-functions/v2/https");
const scrapeAndComparePricesAlgorithm = require("../utils/scrapeAndComparePricesAlgorithm");

exports.scrapeAndComparePricesOnRequest = onRequest({ timeoutSeconds: 300, memory: "1GiB" }, async (req, res) => {
    if (req.method !== "GET") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only GET requests are allowed.' });

    try {
        const executionResults = await scrapeAndComparePricesAlgorithm();
        res.status(200).json({ success: true, executions: executionResults });
        
    } catch (error) {
        console.log('Error scraping the webpage:', error);
        res.status(500).send({ success: false, error: 'An error occurred while scraping the webpage.' });
    }
});
