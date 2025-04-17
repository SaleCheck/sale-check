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
console.log("Firebase Auth instance:", auth);

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

            window.location.href = "profile/main.html";
        });
});

document.getElementById('signup-submit').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default form submission

    document.getElementById('loading-overlay').style.display = 'block';
    document.getElementById('loading-spinner').style.display = 'block';

    const email = document.getElementById('email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("User signed up successfully:", userCredential.user);
            alert("Sign up successful! You can now log in.");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing up:", errorCode, errorMessage);
            alert(`Error: ${errorMessage}`);
        })
        .finally(() => {
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('loading-spinner').style.display = 'none';
            document.getElementById('signup-modal').style.display = 'none';

            document.getElementById('firstname').value = '';
            document.getElementById('lastname').value = '';
            document.getElementById('email').value = '';
            document.getElementById('signup-password').value = '';
        });
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