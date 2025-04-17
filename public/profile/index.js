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
            // User is signed in
            const email = user.email;
            const photoURL = user.photoURL || 'https://firebasestorage.googleapis.com/v0/b/sale-check-b611b.appspot.com/o/users%2Favatar%2F__default__.png?alt=media&token=2f3d5dc7-bf5b-4b23-9511-996394b40275';

            // Update the header
            const userHeader = document.getElementById('user-header');
            const welcomeMessage = document.getElementById('welcome-message');
            const userAvatar = document.getElementById('user-avatar');

            welcomeMessage.textContent = `Welcome, ${email}`;
            userAvatar.src = photoURL;

            userHeader.style.display = 'block';

            const userId = user.uid;
            console.log(`User ID: ${userId}`);

            // Fetch products and display them in a table
            if (window.location.pathname === '/profile/main.html') {
                db.collection('productsToCheck')
                    .where('user', '==', userId)
                    .get()
                    .then((querySnapshot) => {
                        const tableContainer = document.createElement('div');
                        tableContainer.id = 'products-table-container';
                        tableContainer.style.marginTop = '20px';

                        const table = document.createElement('table');
                        table.style.width = '80%';
                        table.style.margin = '0 auto';
                        table.style.borderCollapse = 'collapse';

                        // Create table header
                        const headerRow = document.createElement('tr');
                        ['Image', 'Product Name', 'Expected Price', 'CSS Selector', 'URL'].forEach((headerText, index) => {
                            const th = document.createElement('th');
                            th.textContent = headerText;
                            th.style.border = '1px solid #ddd';
                            th.style.padding = '8px';
                            th.style.backgroundColor = '#f2f2f2';
                            if (headerText === 'URL') {
                                th.style.width = '10%';
                            }
                            headerRow.appendChild(th);
                        });
                        table.appendChild(headerRow);

                        // Populate table rows with product data
                        querySnapshot.forEach((doc) => {
                            const product = doc.data();
                            const row = document.createElement('tr');
                            row.style.height = '100px';

                            // Add Image column
                            const imageCell = document.createElement('td');
                            const img = document.createElement('img');
                            img.src = product.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf_ZCAY6LQatbwEYVq5-wucJP2oOus2PTpwA&s';
                            img.alt = product.productName || 'Product Image';
                            img.style.width = '100px';
                            img.style.height = 'auto';
                            img.style.maxHeight = '100%';
                            imageCell.appendChild(img);
                            imageCell.style.border = '1px solid #ddd';
                            imageCell.style.padding = '8px';
                            row.appendChild(imageCell);

                            // Add Product Name column
                            const nameCell = document.createElement('td');
                            nameCell.textContent = product.productName || 'N/A';
                            nameCell.style.border = '1px solid #ddd';
                            nameCell.style.padding = '8px';
                            row.appendChild(nameCell);

                            // Add Expected Price (Currency) column
                            const priceCell = document.createElement('td');
                            priceCell.textContent = `${product.expectedPrice || 'N/A'} ${product.expectedPriceCurrency || ''}`;
                            priceCell.style.border = '1px solid #ddd';
                            priceCell.style.padding = '8px';
                            row.appendChild(priceCell);

                            // Add CSS Selector column
                            const cssSelectorCell = document.createElement('td');
                            const codeElement = document.createElement('code');
                            codeElement.textContent = product.cssSelector || 'N/A';
                            codeElement.style.backgroundColor = '#f9f9f9';
                            codeElement.style.padding = '4px';
                            codeElement.style.display = 'inline-block';
                            cssSelectorCell.appendChild(codeElement);
                            cssSelectorCell.style.border = '1px solid #ddd';
                            cssSelectorCell.style.padding = '8px';
                            row.appendChild(cssSelectorCell);

                            // Add URL column
                            const urlCell = document.createElement('td');
                            const link = document.createElement('a');
                            link.href = product.url || '#';
                            link.textContent = product.url || 'N/A';
                            link.target = '_blank';
                            urlCell.appendChild(link);
                            urlCell.style.border = '1px solid #ddd';
                            urlCell.style.padding = '8px';
                            urlCell.style.width = '10%';
                            row.appendChild(urlCell);

                            table.appendChild(row);
                        });

                        tableContainer.appendChild(table);
                        document.body.appendChild(tableContainer);
                    })
                    .catch((error) => {
                        console.error('Error fetching documents:', error);
                    });
            }
        } else {
            // User is not signed in, redirect to login page
            window.location.href = "/index.html";
        }
    });

    document.getElementById('crud-form')?.addEventListener('submit', function (event) {
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

    document.getElementById('clear-button')?.addEventListener('click', function () {
        var form = document.getElementById('crud-form');
        form.reset();
        document.getElementById('product-image').value = '';

        document.getElementById('message').innerHTML = '';
    });

    document.getElementById('sign-out-button')?.addEventListener('click', function () {
        document.getElementById('loading-overlay').style.display = 'block';
        document.getElementById('loading-spinner').style.display = 'block';

        auth.signOut()
            .then(() => {
                console.log("User signed out.");
                /*auth.onAuthStateChanged is triggered after signOut and redirects to /index.html*/
            })
            .catch((error) => {
                console.error("Error signing out: ", error);
            })
            .finally(() => {
                document.getElementById('loading-overlay').style.display = 'none';
                document.getElementById('loading-spinner').style.display = 'none';
            });
    });

    document.getElementById('add-button')?.addEventListener('click', function () {
        window.location.href = "/profile/add.html";
    });
});