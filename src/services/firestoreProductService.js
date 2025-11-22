import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function getProductsForUser(userId) {
    const ref = collection(db, "productsToCheck");
    const querie = query(ref, where("user", "==", userId));
    const productSnap = await getDocs(querie);

    return productSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}

export async function createProductForUser(userId, data) {
    const ref = collection(db, "productsToCheck");
    const payload = {
        ...data, 
        user: userId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
    }
    return addDoc(ref, payload);
}

export async function updateProductForUser(productId, data) {
    const ref = doc(db, "productsToCheck", productId);
    const payload = {
        ...data,
        lastUpdated: serverTimestamp(),
    }

    return updateDoc(ref, payload);
}

export async function deleteProductForUser(productId) {
    const ref = doc(db, "productsToCheck", productId);
    return deleteDoc(ref);
}
