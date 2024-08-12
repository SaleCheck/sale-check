require("firebase-functions/logger/compat");
const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const db = getFirestore();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILAPPPWD,
    },
});

// Helper function to send emails
async function sendEmail(mailOptions) {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
}

exports.onProductSaleCheckExecution = functions.firestore
    .document('productsToCheck/{productId}/executions/{executionId}')
    .onCreate( async (snap, context) => {
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
                url: productUrl,
                emailNotification: emailTo
            } = snapshot.data();

            const { foundPrice, samePriceAsExpected } = executionData;
            const discountPercentage = Math.round(((productExpectedPrice - foundPrice) / productExpectedPrice) * 100);

            const emailSubject = samePriceAsExpected
                ? `SaleChecker Execution Successful`
                : `ON SALE: ${productName} Costs ${foundPrice} € Now!`;
            const emailBody = samePriceAsExpected
                ? `<p>
                        Found price ${foundPrice} € for product ${productName} during successful execution of SaleChecker today.
                        <br>
                        Verify yourself by checking: <a href="${productUrl}">${productUrl}</a>
                        <br><br>
                        Have a smiley day
                        <br>– Team SaleChecker
                    </p>`
                :
                `<p>
                        Hello!👋
                        <br><br>
                        The product <em>${productName}</em> seems to be on <b>${discountPercentage} % SALE</b>🚨, since its price is now just ${foundPrice} € as found during today's execution of your SaleChecker service!
                        <br><br>
                        This is different from the normal price which is ${productExpectedPrice} €, so go get yours now on <a href="${productUrl}">${productUrl}</a>!💪💥
                        <br><br>
                        Kind regards and smiley day to you☀️
                        <br>– Team SaleChecker😻
                    </p>`

            const mailOptions = {
                from: 'mathingvid@gmail.com',
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

        } catch (error) {
            console.error("Error during Firestore trigger execution: ", error);
            const errorMailOptions = {
                from: 'mathingvid@gmail.com',
                to: emailTo,
                subject: `Error in SaleChecker Execution for☹️`,
                html: `<p>
                        An error occurred during the execution of SaleChecker.
                        <br><br>
                        <strong>Error Details:</strong> ${error.message}
                        <br><br>
                        Please check the function logs for more details.
                        <br><br>
                        Kind regards,
                        <br>– Team SaleChecker
                    </p>`
            };
            await sendEmail(errorMailOptions);
        }

        return null;
    });