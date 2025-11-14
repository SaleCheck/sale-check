import { db } from "../firebase/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

export async function getUserDoc(userId) {
    const userSnap = await getDoc(doc(db, "users", userId));
    return userSnap.exists() ? userSnap.data() : null;
}

export function updateUserDoc(userId, data) {
    return updateDoc(doc(db, "users", userId), {
        ...data,
        lastUpdated: serverTimestamp()
    })
}