const { onRequest } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const cors = require('cors')({ origin: true });

exports.getUser = onRequest( async (req, res) => {
    cors(req, res, async () => {    
        if (req.method !== "GET") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only GET requests are allowed.' });

        const uid = req.query.uid;
        if (!uid) return res.status(400).send({ success: false, error: "Bag Request: 'uid' is required in the query parameters." });          

        getAuth()
        .getUser(uid)
        .then((userRecord) => {
            res.status(200).send({ status: "Success", user: userRecord.toJSON() });
        })
        .catch((error) => {
            console.error("Error fetching user data:", error);
            res.status(500).send({ status: 'Internal Server Error', error: error });
        });
    })
});