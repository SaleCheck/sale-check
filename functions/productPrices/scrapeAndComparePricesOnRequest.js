require("firebase-functions/logger/compat");
const { onRequest } = require("firebase-functions/v2/https");
const scrapeAndComparePricesAlgorithm = require("../utils/scrapeAndComparePricesAlgorithm");
const { sendEmail } = require('../utils/emailService');

exports.scrapeAndComparePricesOnRequest = onRequest({ timeoutSeconds: 300, memory: "1GiB" }, async (req, res) => {
    if (req.method !== "GET") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only GET requests are allowed.' });

    try {
        const executionResults = await scrapeAndComparePricesAlgorithm();
        res.status(200).json({ success: true, executions: executionResults });

        const emailSubject = `✅SaleCheck Price Monitoring Ran Successfully`;
        const emailBody = `
            <p>
                The SaleCheck price monitoring scheduler has successfully run today.
                <br><br>
                Please note: Products without price changes <strong>will not</strong> trigger notification emails.
                <br><br>
                Kind regards and smiley day to you☀️
                <br>
                – Team SaleChecker😻
            </p>`;        
        const mailOptions = {
            from: process.env.EMAILUSER,
            to: process.env.EMAILUSER,
            subject: emailSubject,
            html: emailBody
        };
        await sendEmail(mailOptions);
        
    } catch (error) {
        console.log('Error scraping the webpage:', error);
        res.status(500).send({ success: false, error: 'An error occurred while scraping the webpage.' });

        const emailSubject = `❗ERROR: SaleCheck Scheduled Job Failed`;
        const emailBody = `
            <p>
                The scheduled SaleCheck job encountered an error and did not complete successfully.
                <br><br>
                <strong>Error Details:</strong>  
                <pre>${error.message}</pre>
                <br>
                Consider investigating this issue to ensure continued monitoring.
                <br><br>
                Kind regards,  
            Team SaleChecker
            </p>`;        
        const mailOptions = {
            from: process.env.EMAILUSER,
            to: process.env.EMAILUSER,
            subject: emailSubject,
            html: emailBody
        };
        await sendEmail(mailOptions);
    }
});
