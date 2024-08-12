require("firebase-functions/logger/compat");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const scrapeAndComparePricesAlgorithm = require("../utils/scrapeAndComparePricesAlgorithm");

exports.scrapeAndComparePricesOnSchedule = onSchedule({
        schedule: "0 7 * * 1,3,5",
        timeoutSeconds: 300,
        memory: "2GiB",
    }, async () => {
    // Cron explanation:
    //  0: Minute (0th minute)
    //  8: Hour (8 AM)
    //  *: Day of the month (every day)
    //  *: Month (every month)
    //  1,3,5: Days of the week (Monday, Wednesday, Friday)

    try {
        console.log("Scheduled function triggered.");
        await scrapeAndComparePricesAlgorithm();
        console.log("Scraping and comparison completed successfully.");
    } catch (error) {
        console.error("Error in scheduled function:", error);
    }
});