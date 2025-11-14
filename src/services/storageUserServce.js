import { storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadUserAvatar(userId, file) {
    const avatarRef = ref(storage, `users/avatar/${userId}/${userId}.png`);
    await uploadBytes(avatarRef, file);

    return getDownloadURL(avatarRef);
}