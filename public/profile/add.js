document.addEventListener('DOMContentLoaded', () => {
    // Firebase configuration and initialization
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

    auth.onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;

            // Fetch user avatar and name from Firestore
            db.collection('users').doc(userId).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        const firstName = userData.firstName || 'User';
                        const lastName = userData.lastName || '';

                        // Update the welcome message
                        const welcomeMessage = document.getElementById('welcome-message');
                        welcomeMessage.textContent = `Welcome, ${firstName} ${lastName}`;
                    } else {
                        console.error('No such user document!');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user details:', error);
                });

            const photoURL = user.photoURL || 'https://firebasestorage.googleapis.com/v0/b/sale-check-b611b.appspot.com/o/users%2Favatar%2F__default__.png?alt=media&token=2f3d5dc7-bf5b-4b23-9511-996394b40275';
            const userHeader = document.getElementById('user-header');
            const userAvatar = document.getElementById('user-avatar');

            userAvatar.src = photoURL;
            userHeader.style.display = 'block';

            console.log(`User ID: ${userId}`);
        } else {
            console.log(`No user is signed in. Couldn't load profile header.`);
        }
    });

    // Handle form submission for adding a product
    document.getElementById('crud-form')?.addEventListener('submit', async function (event) {
        event.preventDefault();
        console.log('Form submitted');

        document.getElementById('loading-overlay').style.display = 'block';
        document.getElementById('loading-spinner').style.display = 'block';

        const productName = document.getElementById('product-name').value;
        const expectedPrice = document.getElementById('expected-price').value;
        const currency = document.getElementById('currency').value;
        const productUrl = document.getElementById('product-url').value;
        const cssSelector = document.getElementById('css-selector').value;
        const productImage = document.getElementById('product-image').files[0];

        const user = auth.currentUser;
        if (!user) {
            console.error('No user is logged in.');
            alert('Error: No user is logged in. Please log in to continue.');
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('loading-spinner').style.display = 'none';
            return;
        }

        const payload = {
            data: {
                productName: productName,
                expectedPrice: parseFloat(expectedPrice),
                expectedPriceCurrency: currency,
                url: productUrl,
                emailNotification: [user.email],
                cssSelector: cssSelector,
                user: user.uid,
            },
        };

        try {
            const response = await fetch('https://us-central1-sale-check-b611b.cloudfunctions.net/createProductToCheck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const productId = data.documentId;
            console.log('Product added successfully with ID:', productId);

            if (productImage) {
                const storageRef = firebase.storage().ref(`productImages/${productId}/${productId}.png`);
                await storageRef.put(productImage);

                const imageUrl = await storageRef.getDownloadURL();
                await db.collection('productsToCheck').doc(productId).update({ imageUrl });

                console.log('Image uploaded and Firestore updated successfully.');
            } else {
                console.log('No image uploaded.');
            }

            alert('Success! Your item has been added.');
            window.location.href = '/profile/index.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Error: Unable to add the item. Please try again.');
        } finally {
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('loading-spinner').style.display = 'none';
        }
    });

    // Handle clear button functionality
    document.getElementById('clear-button')?.addEventListener('click', function () {
        const form = document.getElementById('crud-form');
        form.reset();
        document.getElementById('product-image').value = '';
        document.getElementById('message').innerHTML = '';
    });

    // Handle test button functionality
    document.getElementById('test-button')?.addEventListener('click', function () {
        const productUrl = document.getElementById('product-url').value;
        const cssSelector = document.getElementById('css-selector').value;

        if (!productUrl || !cssSelector) {
            alert('Please provide both Product URL and CSS Selector.');
            return;
        }

        document.getElementById('loading-overlay').style.display = 'block';
        document.getElementById('loading-spinner').style.display = 'block';

        const payload = {
            productUrl: productUrl,
            cssSelector: cssSelector,
        };

        fetch('https://us-central1-sale-check-b611b.cloudfunctions.net/testPuppeteer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((err) => {
                        throw new Error(err || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.text();
            })
            .then((data) => {
                alert(`Response: ${data}`);
            })
            .catch((error) => {
                console.error('Error:', error);
                alert(`Error: ${error.message || 'Unable to test the selector. Please try again.'}`);
            })
            .finally(() => {
                document.getElementById('loading-overlay').style.display = 'none';
                document.getElementById('loading-spinner').style.display = 'none';
            });
    });
});