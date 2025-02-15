require("firebase-functions/logger/compat");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const scrapeAndComparePricesAlgorithm = require("../utils/scrapeAndComparePricesAlgorithm");
const { sendEmail } = require('../utils/emailService');

exports.scrapeAndComparePricesOnSchedule = onSchedule({
        schedule: "0 7 * * 1,3,5",
        timeZone: "Europe/Paris",
        timeoutSeconds: 300,
        memory: "2GiB",
    }, async () => {
    // Cron explanation:
    //  0: Minute (0th minute)
    //  8: Hour (8 AM)
    //  *: Day of the month (every day)
    //  *: Month (every month)
    //  1,3,5: Days of the week (Monday, Wednesday, Friday)
    // Timezone: ID in https://docs.sentinel.thalesgroup.com/softwareandservices/ems/EMSdocs/WSG/Content/TimeZone.htm

    try {
        console.log("Scheduled function triggered.");
        await scrapeAndComparePricesAlgorithm();
        console.log("Scraping and comparison completed successfully.");
        
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
        console.error("Error in scheduled function:", error);

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