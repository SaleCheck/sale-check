const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const db = getFirestore();

exports.createProductToCheck = onRequest({ timeoutSeconds: 300, memory: "1GiB" }, async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send({ success: false, error: 'Method Not Allowed. Only POST requests are allowed.' });
    }

    try {
        const data = req.body.data;
        if (!data) return res.status(400).send("Bad Request: No data provided");

        const allowedKeys = ["productName", "expectedPrice", "expectedPriceCurrency", "url", "emailNotification", "cssSelector"];
        const filteredData = {};
        for (const key of allowedKeys) {
            if (data.hasOwnProperty(key)) {
                filteredData[key] = data[key];
            }
        }
        filteredData.createdTimestamp = Timestamp.now();
        filteredData.lastUpdated = Timestamp.now();

        // Add the filtered data to Firestore
        const docRef = await db.collection("productsToCheck").add(filteredData);
        res.status(200).send({ message: "Product added successfully", documentId: docRef.id });

    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send("Internal Server Error");
    }
});
