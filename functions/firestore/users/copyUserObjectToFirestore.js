const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

exports.copyUserObjectToFirestore = functions.auth.user().onCreate( async (user) => {
    console.log('User created:', user, '\n Copying user object to Firestore ...');    
    
    const userData = {
        uid: user.uid ?? null,
        email: user.email ?? null,
        emailVerified: user.emailVerified ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        phoneNumber: user.phoneNumber ?? null,
        disabled: user.disabled ?? null,
    }
    
    try {
        const docRef = db.collection('users').doc(user.uid);
        await docRef.set(userData);        
        console.log('User object copied to Firestore:', userData);
    } catch (error) {
        console.error(`Error copying user object for uid ${uid} to Firestore:`, error);
    }
});