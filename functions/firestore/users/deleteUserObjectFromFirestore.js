const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();
const bucket = admin.storage().bucket();

exports.deleteUserObjectFromFirestore = functions.auth.user().onDelete(async (user) => {
    console.log('User deleted:', user, '\n Deleting user object from Firestore and avatar from Storage...');

    try {
        // Delete user document from Firestore
        const docRef = db.collection('users').doc(user.uid);
        await docRef.delete();
        console.log('User object deleted from Firestore:', user.uid);

        // Delete user avatar from Firebase Storage
        const avatarPath = `users/avatar/${user.uid}/`;
        const [files] = await bucket.getFiles({ prefix: avatarPath });
        const deletePromises = files.map(file => file.delete());
        await Promise.all(deletePromises);
        console.log(`User avatar deleted from Storage at path: ${avatarPath}`);
    } catch (error) {
        console.error(`Error deleting user data for uid ${user.uid}:`, error);
    }
});