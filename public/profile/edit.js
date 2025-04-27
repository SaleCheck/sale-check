document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('loading-overlay').style.display = 'block';
    document.getElementById('loading-spinner').style.display = 'block';

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

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    if (!productId) {
        alert('No product ID provided.');
        window.location.href = '/profile/index.html';
        return;
    }

    // Fetch product details
    try {
        const response = await fetch(`https://us-central1-sale-check-b611b.cloudfunctions.net/getProductToCheck?id=${productId}`);
        if (!response.ok) throw new Error(`Failed to fetch product: ${response.statusText}`);
        const product = await response.json();

        // Populate form fields
        document.getElementById('product-name').value = product.productName || '';
        document.getElementById('expected-price').value = product.expectedPrice || '';
        document.getElementById('currency').value = product.expectedPriceCurrency || '';
        document.getElementById('product-url').value = product.url || '';
        document.getElementById('css-selector').value = product.cssSelector || '';

        // Display product image
        const productImagePreview = document.getElementById('product-image-preview');
        if (product.imageUrl) {
            productImagePreview.src = product.imageUrl;
        } else {
            productImagePreview.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf_ZCAY6LQatbwEYVq5-wucJP2oOus2PTpwA&s';
        }
        productImagePreview.style.display = 'block';
        
    } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product details. Please try again.');
        window.location.href = '/profile/index.html';
    } finally {
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('loading-spinner').style.display = 'none';
    }

    // Handle form submission
    document.getElementById('crud-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const updateData = {
            productName: document.getElementById('product-name').value,
            expectedPrice: parseFloat(document.getElementById('expected-price').value),
            expectedPriceCurrency: document.getElementById('currency').value,
            url: document.getElementById('product-url').value,
            cssSelector: document.getElementById('css-selector').value,
        };

        try {
            const response = await fetch('https://us-central1-sale-check-b611b.cloudfunctions.net/updateProductToCheck', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        id: productId,
                        updateData,
                    },
                }),
            });

            if (!response.ok) throw new Error(`Failed to update product: ${response.statusText}`);
            alert('Product updated successfully!');
            window.location.href = '/profile/index.html';
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        }
    });

    document.getElementById('delete-button')?.addEventListener('click', function () {
        if (confirm('Are you sure you want to delete this product?')) {
            document.getElementById('loading-overlay').style.display = 'block';
            document.getElementById('loading-spinner').style.display = 'block';

            fetch('https://us-central1-sale-check-b611b.cloudfunctions.net/deleteProductToCheck', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { id: productId } }),
            })
                .then((response) => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.text();
                })
                .then((data) => {
                    console.log('Product deleted successfully:', data);
                    alert('Product deleted successfully.');
                    window.location.href = '/profile/index.html';
                })
                .catch((error) => {
                    console.error('Error deleting product:', error);
                    alert('Failed to delete the product. Please try again.');
                })
                .finally(() => {
                    document.getElementById('loading-overlay').style.display = 'none';
                    document.getElementById('loading-spinner').style.display = 'none';
                });
        }
    });
});