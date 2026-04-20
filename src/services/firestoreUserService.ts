import { db } from "../firebase/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

export interface UserData {
    email: string;
    uid: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string | null;
}

export interface UserUpdateData {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string | null;
}

export async function getUserDoc(
    userId: string
): Promise<UserData | null> {
    const userSnap = await getDoc(doc(db, "users", userId));

    if (!userSnap.exists()) return null;
    return userSnap.data() as UserData;
}

export async function updateUserDoc(
    userId: string,
    data: UserUpdateData
): Promise<void> {
    const ref = doc(db, "users", userId);
    const payload = {
        ...data,
        lastUpdated: serverTimestamp(),
    }

    await updateDoc(ref, payload);
}