const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

exports.deleteUserObjectFromFirestore = functions.auth.user().onDelete( async (user) => {
    console.log('User deleted:', user, '\n Deleting user object to Firestore ...');
    
    try {
        const docRef = db.collection('users').doc(user.uid);
        await docRef.delete();      
        console.log('User object deleted from Firestore:', user.uid);        
    } catch (error) {
        console.error(`Error deleting uid ${user.uid} in Firestore:`, error);
    }
});