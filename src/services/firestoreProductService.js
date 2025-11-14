import { collection, getDocs, query, where } from "firebase/firestore";
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