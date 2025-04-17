const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Timestamp } = require("firebase-admin/firestore");

const db = admin.firestore();

exports.copyUserObjectToFirestore = functions.auth.user().onCreate( async (user) => {
    console.log('User created:', user, '\n Copying user object to Firestore ...');    
    
    const userData = {
        createdOn: Timestamp.now() ?? null,
        disabled: user.disabled ?? null,
        displayName: user.displayName ?? null,
        email: user.email ?? null,
        emailVerified: user.emailVerified ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        lastUpdated: Timestamp.now() ?? null,
        phoneNumber: user.phoneNumber ?? null,
        photoURL: user.photoURL ?? null,
        uid: user.uid ?? null,
    }
    
    try {
        const docRef = db.collection('users').doc(user.uid);
        await docRef.set(userData);        
        console.log('User object copied to Firestore:', userData);
    } catch (error) {
        console.error(`Error copying user object for uid ${uid} to Firestore:`, error);
    }
});