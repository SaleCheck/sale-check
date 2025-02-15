# SaleCheck
![SaleCheck Icon](https://sale-check-b611b.web.app/assets/favicon.png)

SaleCheck is a smart price tracking tool built with Firebase and Google Cloud Functions. This web application allows users to effortlessly monitor price drops on their desired products, ensuring they never miss a deal.

Contributors are expected to act in a collaborative manner to move the project forward. We encourage the constructive exchange of contrary opinions and compromise. The maintainer reserves the right to limit or block contributors who repeatedly act in ways that discourage, exhaust, or otherwise negatively affect other participants.

**This project has a [Code of Conduct](./CODE_OF_CONDUCT.md).**

## Table of Contents
- [About](#about)
- [Features](#features)
- [How It Works](#how-it-works)
- [Technologies](#technologies)
- [How to Run Locally](#how-to-run-locally)
- [Contributing](#contributing)
- [License](#license)

## About
SaleCheck provides a service that makes tracking price drops a breeze. Simply enter the product URL and price CSS Selector and set your target price. Our system will constantly check for any price changes and notify you the moment your item is on sale. You can save time and money by letting us handle the monitoring, so you can focus on enjoying your savings!

Website: [sale-check-b611b.web.app](sale-check-b611b.web.app)


## Features
- **Product URL Tracking**: Easily input the URL of a product you want to monitor.
- **Customizable Alerts**: Set your target price and get notified when the price drops to that level.
- **Firebase Backend**: Powered by Firebase to handle all your tracking needs reliably and efficiently.
- **Cloud Functions**: Google Cloud Functions handle the logic behind monitoring and notifying you about price changes.

## How It Works
- **Enter the product URL**: On the website, paste the URL of the product you want to track.
- **Set your target price**: Choose the price you want to be notified at.
- **Wait for the notification**: Our system will monitor the price and send you an alert when the price drops to or below your target.

## Technologies
- **Firebase**: Firebase Hosting for the web app, Firebase Functions for backend logic.
- **Google Cloud Functions**: Serverless functions that handle the price monitoring.
- **Firestore**: A NoSQL database used to store user data and track product prices.

## How to Run Locally
To run this project locally, follow these steps:

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sale-check.git
cd sale-check
```

2. Install dependencies:
```bash
npm install
```

3. Start the Firebase Emulator for local development:
```bash
firebase emulators:start
```

4. Access the app locally by visiting [http://localhost:5000](http://localhost:5000).

## Contributing
Contributions are welcome! If you'd like to improve the project, feel free to fork the repository and create a pull request. Please ensure that your code follows our contribution guidelines.

## License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See [LICENSE](./LICENSE) for the full
license text. 
