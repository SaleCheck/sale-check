const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const cors = require('cors')({ origin: true });

const db = getFirestore();

exports.getProductToCheck = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== "GET") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only GET requests are allowed.' });

        try {
            const data = req.body.data;
            if (!data) return res.status(400).send("Bad request: No data in payload provided");

            const allowedPayloadKeys = "id";
            if (!data.hasOwnProperty(allowedPayloadKeys)) return res.status(400).send("Bad Request: Payload must include 'id' property.");

            const productId = data[allowedPayloadKeys]
            const doc = await db.collection("productsToCheck").doc(productId).get();

            if (!doc.exists) {
                res.status(400).send("Error: Document not found.");
            } else {
                res.status(200).send(doc.data());
            }
        } catch (error) {
            console.error("Error adding document: ", error);
            res.status(500).send("Internal Server Error");
        }
    })
});