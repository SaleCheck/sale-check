const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const cors = require('cors')({ origin: true });

const db = getFirestore();

exports.deleteProductToCheck = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== "DELETE") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only DELETE requests are allowed.' });
        if (req.get('Content-Type') !== 'application/json') {
            return res.status(400).send({ success: false, error: 'Content-Type must be application/json.' });
        }

        try {
            const data = req.body.data;
            if (!data || !data.id) return res.status(400).send("Bad request: 'id' is required in the payload.");

            const productId = data.id;
            const docRef = db.collection("productsToCheck").doc(productId);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({ success: false, error: "Document not found." });
            } else {
                await db.recursiveDelete(docRef);
                return res.status(200).send(`Document ${productId} and all subcollections deleted successfully.`);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).send("Internal Server Error");
        }
    })
});