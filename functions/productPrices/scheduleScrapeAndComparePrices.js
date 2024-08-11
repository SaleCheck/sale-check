const { onSchedule } = require("firebase-functions/v2/scheduler");
const { scrapeAndComparePrices } = require("./scrapeAndComparePrices.js");

exports.scheduleScrapeAndComparePrices = onSchedule('0 8 * * 1,3,5', { timeoutSeconds: 300, memory: "1GiB" }, async () => {
    // Cron explanation:
    //  0: Minute (0th minute)
    //  8: Hour (8 AM)
    //  *: Day of the month (every day)
    //  *: Month (every month)
    //  1,3,5: Days of the week (Monday, Wednesday, Friday)
    
    await scrapeAndComparePrices();
});