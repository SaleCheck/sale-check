const firebaseConfig = {
    apiKey: "AIzaSyDZOYnEHUA3I1PS36teLMmKirTXpMVzFAc",
    authDomain: "sale-check-b611b.firebaseapp.com",
    projectId: "sale-check-b611b",
    storageBucket: "sale-check-b611b.appspot.com",
    messagingSenderId: "712429550284",
    appId: "1:712429550284:web:3fdb2d4ab2e5b99448a069",
    measurementId: "G-743W5CC4YL"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById('login-submit').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default form submission i.e. automatic, immediate closing of form element

    document.getElementById('loading-overlay').style.display = 'block';
    document.getElementById('loading-spinner').style.display = 'block';

    const user = document.getElementById('user').value;
    const pwd = document.getElementById('pwd').value;

    auth.signInWithEmailAndPassword(user, pwd)
        .then((userCredential) => {
            console.log("Signed in successfully:", userCredential.user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing in:", errorCode, errorMessage);
        })
        .finally(() => {
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('loading-spinner').style.display = 'none';
            document.getElementById('login-modal').style.display = 'none';

            document.getElementById('user').value = '';
            document.getElementById('pwd').value = '';

            window.location.href = "profile/index.html";
        });
});

document.getElementById('signup-submit').addEventListener('click', async function (event) {
    event.preventDefault(); // Prevent default form submission

    document.getElementById('loading-overlay').style.display = 'block';
    document.getElementById('loading-spinner').style.display = 'block';

    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;
    const password = document.getElementById('signup-password').value;
    const avatarFile = document.getElementById('user-avatar').files[0]; 

    try {
        // Create user with email and password
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Ensure the user is authenticated before uploading the avatar
        await auth.currentUser.reload();

        try {
            await db.collection('users').doc(user.uid).update({
                firstName: firstName,
                lastName: lastName,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating user profile:", error);
            return;
        }

        if (avatarFile) {
            try {
                const storageRef = firebase.storage().ref(`users/avatar/${user.uid}/${user.uid}.png`);
                await storageRef.put(avatarFile);

                const photoURL = await storageRef.getDownloadURL();
                await user.updateProfile({ photoURL });

                const db = firebase.firestore();
                await db.collection('users').doc(user.uid).update({ photoURL: photoURL });

            } catch (uploadError) {
                console.error("Error uploading avatar:", uploadError);

                await user.delete();
                alert("Error uploading avatar. Please try signing up again.");

                return;
            }
        }

        alert("Sign up successful! You can now log in.");
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error signing up:", errorCode, errorMessage);
        alert(`Error: ${errorMessage}`);
    } finally {
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('signup-modal').style.display = 'none';

        document.getElementById('firstname').value = '';
        document.getElementById('lastname').value = '';
        document.getElementById('email').value = '';
        document.getElementById('signup-password').value = '';
        document.getElementById('user-avatar').value = ''; // Clear the file input
    }
});

document.getElementById('login-btn').addEventListener('click', function () {
    document.getElementById('login-modal').style.display = 'block';
});
document.getElementById('signup-btn').addEventListener('click', function () {
    document.getElementById('signup-modal').style.display = 'block';
});
document.getElementById('close-login-modal').addEventListener('click', function () {
    document.getElementById('login-modal').style.display = 'none';
});
document.getElementById('close-signup-modal').addEventListener('click', function () {
    document.getElementById('signup-modal').style.display = 'none';
});

// Show the Reset Password Modal
document.getElementById('forgot-password-link').addEventListener('click', function () {
    document.getElementById('reset-password-modal').style.display = 'block';
    document.getElementById('login-modal').style.display = 'none';
});

// Close the Reset Password Modal
document.getElementById('close-reset-password-modal').addEventListener('click', function () {
    document.getElementById('reset-password-modal').style.display = 'none';
});

// Handle Password Reset
document.getElementById('reset-password-submit').addEventListener('click', function () {
    const email = document.getElementById('reset-email').value;

    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("Password reset email sent. Please check your inbox.");
            document.getElementById('reset-password-modal').style.display = 'none';
            document.getElementById('reset-email').value = ''; // Clear the input field
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);
            alert(`Error: ${error.message}`);
        });
});