const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Function to trigger when a new document is added to the `productsToCheck` collection
exports.onProductSaleCheckExecution = functions.firestore
    .document('productsToCheck/{productId}/executions/{executionId}')
    .onCreate((snap, context) => {
        const executionData = snap.data();
        const productId = context.params.productId;
        const executionId = context.params.executionId;

        if (executionData.samePriceAsExpected) {
            console.log(`Price for product ${productId} is ${executionData.foundPrice} which IS same as expected.`);
            console.log('New execution document added:', {
                productId,
                executionId,
                data: executionData
            });
            
        } else {
            console.log(`Price for product ${productId} is ${executionData.foundPrice} which is NOT same as expected.`);
            console.log('New execution document added:', {
                productId,
                executionId,
                data: executionData
            });
        }

        return null;
    });