import { storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadUserAvatar(
    userId: string, 
    file: File
): Promise<string> {
    const avatarRef = ref(storage, `users/avatar/${userId}/${userId}.png`);
    await uploadBytes(avatarRef, file);

    return getDownloadURL(avatarRef);
}

export async function uploadProductImage(
    productId: string, 
    file: File
): Promise<string> {
    const productImgRef = ref(storage, `/productImages/${productId}/${productId}.png`);
    await uploadBytes(productImgRef, file);

    return getDownloadURL(productImgRef);
}