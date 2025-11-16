import { db } from "../firebase/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

export async function getUserDoc(userId) {
    const userSnap = await getDoc(doc(db, "users", userId));
    return userSnap.exists() ? userSnap.data() : null;
}

export async function updateUserDoc(userId, data) {
    const ref = doc(db, "users", userId);
    const payload = {
        ...data,
        lastUpdated: serverTimestamp(),
    }

    return updateDoc(ref, payload);
}