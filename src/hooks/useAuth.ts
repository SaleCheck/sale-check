import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import {
  loginWithEmailAndPwd,
  logout,
  signUpWithEmailAndPwd,
  subscribeToAuthStateChanges,
  updateUserAuthProfile,
} from '../services/authService';
import { updateUserDoc } from '../services/firestoreUserService';
import { uploadUserAvatar } from '../services/storageUserServce';

interface LoginArgs {
  email: string;
  password: string;
}

interface SignupArgs extends LoginArgs {
  firstName: string;
  lastName: string;
  avatarFile: File | null;
}

interface UserDoc {
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
}

export function useAuthUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateChanges(
      (currentUser: User | null) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { user, loading };
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginArgs) =>
      loginWithEmailAndPwd(email, password),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      password,
      avatarFile,
    }: SignupArgs): Promise<User> => {
      const userCredential = await signUpWithEmailAndPwd(email, password);
      const user = userCredential.user;

      let photoURL: string | undefined;
      const displayName = `${firstName} ${lastName}`.trim();

      const userDoc: UserDoc = {
        displayName,
        firstName,
        lastName,
      };

      if (avatarFile) {
        photoURL = await uploadUserAvatar(user.uid, avatarFile);
        userDoc.photoURL = photoURL;
      }

      await updateUserAuthProfile(user, {
        displayName,
        photoURL: photoURL || null,
      });

      await updateUserDoc(user.uid, userDoc);

      return user;
    },
  });
}

export function useLogout() {
  return useMutation({ mutationFn: () => logout() });
}
