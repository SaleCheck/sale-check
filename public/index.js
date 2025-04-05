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

document.getElementById('login-btn').addEventListener('click', function () {
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
    });
});

document.getElementById('crud-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Show the loading overlay and spinner
    document.getElementById('loading-overlay').style.display = 'block';
    document.getElementById('loading-spinner').style.display = 'block';

    const productName = document.getElementById('product-name').value;
    const expectedPrice = document.getElementById('expected-price').value;
    const currency = document.getElementById('currency').value;
    const productUrl = document.getElementById('product-url').value;
    const emailForNotifications = document.getElementById('email-for-notifications').value.split(',');
    const cssSelector = document.getElementById('css-selector').value;
    const payload = {
        data: {
            productName: productName,
            expectedPrice: parseFloat(expectedPrice),
            expectedPriceCurrency: currency,
            url: productUrl,
            emailNotification: emailForNotifications.map(email => email.trim()),
            cssSelector: cssSelector
        }
    };

    fetch('https://us-central1-sale-check-b611b.cloudfunctions.net/createProductToCheck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            document.getElementById('message').innerHTML = '<p style="color: green;">Success! Your item has been added.</p>';
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('message').innerHTML = '<p style="color: red;">Error: Unable to add the item. Please try again.</p>';
            if (error.response && error.response.data && error.response.data.message) {
                document.getElementById('message').innerHTML = `<p style="color: red;">Error: ${error.response.data.message}</p>`;
            }
        })
        .finally(() => {
            // Hide the loading overlay and spinner
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('loading-spinner').style.display = 'none';
        });

    //document.getElementById('crud-form').reset();
    //document.getElementById('product-image').value = '';
});

document.getElementById('clear-button').addEventListener('click', function () {
    var form = document.getElementById('crud-form');
    form.reset();
    document.getElementById('product-image').value = '';

    document.getElementById('message').innerHTML = '';
});
