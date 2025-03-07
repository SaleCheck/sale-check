const { initializeApp: initializeAdminApp } = require("firebase-admin/app");
initializeAdminApp();

const { initializeApp } = require('firebase/app');
const firebaseConfig = {
    apiKey: "AIzaSyDZOYnEHUA3I1PS36teLMmKirTXpMVzFAc",
    authDomain: "sale-check-b611b.firebaseapp.com",
    projectId: "sale-check-b611b",
    storageBucket: "sale-check-b611b.appspot.com",
    messagingSenderId: "712429550284",
    appId: "1:712429550284:web:3fdb2d4ab2e5b99448a069",
    measurementId: "G-743W5CC4YL"
};
initializeApp(firebaseConfig);


const {
    scrapeAndComparePricesOnRequest,
    scrapeAndComparePricesOnSchedule
} = require('./productPrices/scrapeAndComparePrices');
const onProductSaleCheckExecution = require('./productPrices/onProductSaleCheckExecution');
const testPuppeteer = require('./utils/testPuppeteer');
const createProductToCheck = require('./firestore/products/createProductToCheck');
const getProductToCheck = require('./firestore/products/getProductToCheck');
const updateProductToCheck = require('./firestore/products/updateProductToCheck');
const deleteProductToCheck = require('./firestore/products/deleteProductToCheck');
const copyUserObjectToFirestore = require('./firestore/users/copyUserObjectToFirestore');
const createUser = require('./auth/createUser');

exports.scrapeAndComparePricesOnRequest = scrapeAndComparePricesOnRequest;
exports.scrapeAndComparePricesOnSchedule = scrapeAndComparePricesOnSchedule;
exports.onProductSaleCheckExecution = onProductSaleCheckExecution.onProductSaleCheckExecution;
exports.testPuppeteer = testPuppeteer.testPuppeteer;
exports.createProductToCheck = createProductToCheck.createProductToCheck;
exports.getProductToCheck = getProductToCheck.getProductToCheck;
exports.updateProductToCheck = updateProductToCheck.updateProductToCheck;
exports.deleteProductToCheck = deleteProductToCheck.deleteProductToCheck;
exports.copyUserObjectToFirestore = copyUserObjectToFirestore.copyUserObjectToFirestore;
exports.createUser = createUser.createUser;