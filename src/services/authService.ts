import { auth } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
  type UserCredential,
  type Unsubscribe,
} from "firebase/auth";


export interface AuthData {
  displayName?: string | null; 
  photoURL?: string | null
}

export function subscribeToAuthStateChanges(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export function logout(): Promise<void> {
  return signOut(auth);
}

export function loginWithEmailAndPwd(
  email: string,
  pwd: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, pwd);
}

export function signUpWithEmailAndPwd(
  email: string,
  pwd: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, pwd);
}

export function updateUserAuthProfile(
  user: User,
  data: AuthData,
): Promise<void> {
  return updateProfile(user, data);
}
