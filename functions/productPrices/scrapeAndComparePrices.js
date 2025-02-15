require("firebase-functions/logger/compat");
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const scrapeAndComparePricesAlgorithm = require("../utils/scrapeAndComparePricesAlgorithm");
const { sendEmail } = require('../utils/emailService');

async function runSaleCheckerAlgorithm() {
    console.log("Scraping algorithm triggered.");
    
    try {
        await scrapeAndComparePricesAlgorithm();
        console.log("Scraping and comparison algorithm completed successfully.");

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
        console.error("Error during scraping algorithm:", error);

        const emailSubject = `❗ERROR: SaleCheck Job Failed`;
        const emailBody = `
            <p>
                The SaleCheck job encountered an error and did not complete successfully.
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
        throw error; 
    }
};

// Scheduled execution for Google Cloud Scheduler

exports.scrapeAndComparePricesOnSchedule = onSchedule({
    schedule: "0 7 * * 1,3,5",
    timeZone: "Europe/Paris",
    timeoutSeconds: 300,
    memory: "2GiB",
}, async () => {
    // Cron explanation:
    //  0: Minute (0th minute)
    //  7: Hour (7 AM)
    //  *: Day of the month (every day)
    //  *: Month (every month)
    //  1,3,5: Days of the week (Monday, Wednesday, Friday)
    // Timezone: ID in https://docs.sentinel.thalesgroup.com/softwareandservices/ems/EMSdocs/WSG/Content/TimeZone.htm

    console.log("Scheduled function triggered.");
    await runSaleCheckerAlgorithm();
});

// On-demand HTTP execution on request 
exports.scrapeAndComparePricesOnRequest = onRequest({ timeoutSeconds: 300, memory: "1GiB" }, async (req, res) => {
    if (req.method !== "GET") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only GET requests are allowed.' });
    console.log("On-demand request received.");

    try {
        await runSaleCheckerAlgorithm();
        res.status(200).json({ success: true, message: "Price monitoring executed successfully." });
    } catch (error) {
        res.status(500).send({ success: false, error: `An error occurred while scraping the webpage: ${error.message}` });
    }
});
