import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface ProductData {
    name: string;
    url: string;
    price?: number;
    user: string;
    emailNotification: string[];
    createdTimestamp?: any; // Firestore timestamp
    lastUpdated?: any;      // Firestore timestamp
}

export interface Product extends ProductData {
    id: string;
}

export async function getProductsForUser(userId: string): Promise<Product[]> {
    const ref = collection(db, "productsToCheck");
    const q = query(ref, where("user", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as ProductData),
    }));
}

export async function createProductForUser(
    userId: string, 
    userEmail: string, 
    data: { name: string; url: string; price?: number }
): Promise<DocumentReference<DocumentData>> {
    const ref = collection(db, "productsToCheck");
    const payload: ProductData = {
        ...data,
        user: userId,
        emailNotification: [userEmail],
        createdTimestamp: serverTimestamp(),
        lastUpdated: serverTimestamp(),
    }
    return addDoc(ref, payload);
}

export async function updateProductForUser(
    productId: string, 
    data: ProductData
): Promise<void> {
    const ref = doc(db, "productsToCheck", productId);

    await updateDoc(ref, {
        ...data,
        lastUpdated: serverTimestamp(),
    });
}

export async function deleteProductForUser(productId: string): Promise<void> {
    const ref = doc(db, "productsToCheck", productId);
    await deleteDoc(ref);
}