import { auth } from "../firebase/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";

export function subscribeToAuthStateChanges(callback) {
    return onAuthStateChanged(auth, callback);
}

export function logout() {
    return signOut(auth);
}

export function loginWithEmailAndPwd(email, pwd) {
    return signInWithEmailAndPassword(auth, email, pwd);
}

export function signUpWithEmailAndPwd(email, pwd) {
    return createUserWithEmailAndPassword(auth, email, pwd);
}

export function updateUserAuthProfile(user, data) {
    return updateProfile(user, data);
} 