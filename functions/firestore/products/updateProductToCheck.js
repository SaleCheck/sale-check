const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const cors = require('cors')({ origin: true });
const { ALLOWED_FIELDS } = require("./productSchema");

const db = getFirestore();

exports.updateProductToCheck = onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method !== "PATCH") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only PATCH requests are allowed.' });
        if (req.get('Content-Type') !== 'application/json') {
            return res.status(400).send({ success: false, error: 'Content-Type must be application/json.' });
        }

        try {
            const data = req.body.data;
            if (!data || !data.id) return res.status(400).send("Bad request: 'id' is required in the payload.");

            const productId = data.id;
            const productUpdateData = data.updateData;
            const docRef = db.collection("productsToCheck").doc(productId);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({ success: false, error: "Document not found." });
            } else {
                const updatedData = {};
                for (const key of ALLOWED_FIELDS) {
                    if (productUpdateData.hasOwnProperty(key)) {
                        updatedData[key] = productUpdateData[key];
                    }
                }
                updatedData.lastUpdated = Timestamp.now();
                await docRef.update(updatedData);

                return res.status(200).json({ success: true, message: `Product ${productId} updated successfully.`})
            }
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).send("Internal Server Error");
        }
    })
});