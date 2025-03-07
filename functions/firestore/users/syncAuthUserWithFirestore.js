const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

exports.copyAuthUserToFirestore = functions.auth.user().onCreate( async (user) => {
    await syncAuthUserWithFirestore(user);
});

exports.updateAuthUserToFirestore = functions.auth.user().onUpdate( async (change) => {
    const user = change.after;
    await syncAuthUserWithFirestore(user);
});

async function syncAuthUserWithFirestore(user) {
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
} 