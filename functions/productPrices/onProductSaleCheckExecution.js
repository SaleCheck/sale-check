require('firebase-functions/logger/compat');
const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const { sendEmail } = require('../utils/emailService');

const db = getFirestore();

exports.onProductSaleCheckExecution = functions.firestore
    .document('productsToCheck/{productId}/executions/{executionId}')
    .onCreate(async (snap, context) => {
        let emailTo = process.env.EMAILUSER;

        try {
            const executionRef = snap.ref;
            const executionData = snap.data();
            const { productId } = context.params;

            const productRef = db.collection('productsToCheck').doc(productId);
            const snapshot = await productRef.get();

            if (!snapshot.exists) {
                console.error(`No product found for ID: ${productId}`);
                return null;
            }

            const {
                productName,
                expectedPrice: productExpectedPrice,
                expectedPriceCurrency: productExpectedPriceCurrency,
                url: productUrl,
                emailNotification: emailTo,
                imageUrl
            } = snapshot.data();

            try {
                if (emailTo) {
                    const { foundPrice, samePriceAsExpected } = executionData;
                    if (foundPrice == null || foundPrice == undefined || samePriceAsExpected == null || samePriceAsExpected == undefined) {
                        throw new Error(`No price found for product: ${productName}`);
                    }

                    if (samePriceAsExpected && foundPrice === productExpectedPrice) {
                        console.log(`Skipping email; No price change found for product ${productName}`);
                        return null;

                    } else {
                        const discountPercentage = Math.round(((productExpectedPrice - foundPrice) / productExpectedPrice) * 100);

                        const imageHtml = imageUrl
                            ? `<br><img src="${imageUrl}" alt="${productName}" style="height: 300px; width: auto;">`
                            : '';

                        const emailSubject = `🚨ON SALE🤑: ${productName} Costs ${foundPrice} ${productExpectedPriceCurrency} Now!`;

                        const emailBody = `
                            <p>
                                Hello!👋
                                <br><br>
                                ${imageHtml}
                                <br>
                                The product <em>${productName}</em> seems to be on <b>${discountPercentage} % SALE</b>🚨, since its price is now just ${foundPrice} ${productExpectedPriceCurrency} as found during today's execution of your SaleChecker service!
                                <br>
                                This is different from the normal price which is ${productExpectedPrice} ${productExpectedPriceCurrency}, so go get yours now on <a href="${productUrl}">${productUrl}</a>!💪💥
                                <br><br>
                                Kind regards and smiley day to you☀️
                                <br>– Team SaleChecker😻
                            </p>`;

                        const mailOptions = {
                            from: process.env.EMAILUSER,
                            to: emailTo,
                            subject: emailSubject,
                            html: emailBody
                        };
                        await sendEmail(mailOptions);

                        // Update Firestore document with email details
                        await executionRef.update({
                            emailStatus: {
                                emailSent: true,
                                emailSentBody: emailBody,
                                emailSentOn: Timestamp.now(),
                                emailSentSubject: emailSubject,
                                emailSentTo: emailTo,
                            }
                        });
                    }
                }

            } catch (error) {
                console.error("Error during Firestore trigger execution: ", error);
                if (emailTo) {
                    const errorMailOptions = {
                        from: process.env.EMAILUSER,
                        to: emailTo,
                        subject: `Error in SaleChecker Execution for ${productName}☹️`,
                        html: `
                            <p>
                                An error occurred during the execution of SaleChecker.
                                <br><br>
                                <strong>Error Details:</strong> ${error.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                                <br><br>
                                Please check the function logs for more details.
                                <br><br>
                                Kind regards,
                                <br>– Team SaleChecker
                            </p>`
                    };
                    await sendEmail(errorMailOptions);
                }
            };

        } catch (error) {
            console.error(`Error occured: ${error}`);
            const criticalErrorMailOptions = {
                from: process.env.EMAILUSER,
                to: process.env.EMAILUSER, 
                subject: `⚠️CRITICAL ERROR: SaleChecker Execution Failed Completely Failed`,
                html: `
                    <p>
                        <strong>Critical Error Occurred!</strong>
                        <br><br>
                        An unexpected error occurred during the execution of the SaleChecker service.
                        <br><br>
                        <strong>Error Details:</strong> ${error.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                        <br><br>
                        This issue needs immediate attention as it might impact the proper functioning of the service.
                        <br><br>
                        Please check the function logs for more details and take necessary actions.
                        <br><br>
                        Kind regards,
                        <br>– Team SaleChecker
                    </p>`
            };
            await sendEmail(criticalErrorMailOptions);
        }
    });