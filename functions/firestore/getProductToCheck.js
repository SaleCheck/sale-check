const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const cors = require('cors')({ origin: true });

const db = getFirestore();

exports.getProductToCheck = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== "GET") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only GET requests are allowed.' });

        try {
            const data = req.body.data;
            if (!data || !data.id) return res.status(400).send("Bad request: 'id' is required in the payload.");

            const productId = data.id;
            const docRef = db.collection("productsToCheck").doc(productId);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                res.status(404).json({ success: false, error: "Document not found." });
            } else {
                res.status(200).send(docSnap.data());   
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            res.status(500).send("Internal Server Error");
        }
    })
});