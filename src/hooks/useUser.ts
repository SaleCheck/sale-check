import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import { updateUserAuthProfile } from '../services/authService';
import { getUserDoc, updateUserDoc } from '../services/firestoreUserService';
import { uploadUserAvatar } from '../services/storageUserServce';

interface UpdateUserProfileArgs {
  firstName: string;
  lastName: string;
}

export const userKeys = {
  detail: (uid?: string) => ['users', uid] as const,
};

export function useUserDoc(uid?: string) {
  return useQuery({
    queryKey: userKeys.detail(uid),
    queryFn: () => getUserDoc(uid!),
    enabled: !!uid,
  });
}

export function useUpdateUserProfile(user: User | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
    }: UpdateUserProfileArgs): Promise<void> => {
      if (!user) throw new Error('No authenticated user');

      const displayName = `${firstName} ${lastName}`.trim();
      await updateUserAuthProfile(user, { displayName });
      await updateUserDoc(user.uid, { displayName, firstName, lastName });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user?.uid) }),
  });
}

export function useUpdateAvatar(user: User | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<void> => {
      if (!user) throw new Error('No authenticated user');

      const photoURL = await uploadUserAvatar(user.uid, file);
      await updateUserAuthProfile(user, { photoURL });
      await updateUserDoc(user.uid, { photoURL });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user?.uid) }),
  });
}
