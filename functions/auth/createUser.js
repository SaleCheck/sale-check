const { onRequest } = require("firebase-functions/v2/https");
const { 
    getAuth, 
    createUserWithEmailAndPassword, 
    updateProfile 
} = require("firebase/auth");
const cors = require('cors')({ origin: true });


exports.createUser = onRequest({ timeoutSeconds: 300, memory: "1GiB" }, async (req, res) => {
    cors(req, res, async () => {    
        if (req.method !== "POST") return res.status(405).send({ success: false, error: 'Method Not Allowed. Only POST requests are allowed.' });
        if (req.get('Content-Type') !== 'application/json') {
            return res.status(400).send({ success: false, error: 'Content-Type must be application/json.' });
        }
        
        const { email, pwd, displayName, photoURL, phoneNumber } = req.body.data;
        if (!email || !pwd) {
            return res.status(400).send({ error: 'Bad Request: Email and password are required' });
        }
        
        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
            const user = userCredential.user;
            
            await updateProfile(user, {
                displayName: displayName || null,
                photoURL: photoURL || null,
                phoneNumber: phoneNumber || null
            })
            
            return res.status(201).send({ status: "Success", user: user });
        
        } catch (error) {
            console.error("Error creating user: ", error);
            return res.status(500).send({ status: 'Internal Server Error', error: error });
        }
    })
});
