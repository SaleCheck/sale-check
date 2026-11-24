import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import {
  createProductForUser,
  deleteProductForUser,
  getProductsForUser,
  updateProductForUser,
} from '../services/firestoreProductService';
import { uploadProductImage } from '../services/storageUserServce';

export interface ProductFormValues {
  productName: string;
  expectedPrice: string | number;
  expectedPriceCurrency: string;
  url: string;
  cssSelector: string;
}

interface CreateProductArgs {
  productImageFile: File | null;
  values: ProductFormValues;
}

interface UpdateProductArgs extends CreateProductArgs {
  productId: string;
}

export const productKeys = {
  list: (uid?: string) => ['products', uid] as const,
};

export function useProducts(uid?: string) {
  return useQuery({
    queryKey: productKeys.list(uid),
    queryFn: () => getProductsForUser(uid!),
    enabled: !!uid,
  });
}

export function useCreateProduct(user: User | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      values,
      productImageFile,
    }: CreateProductArgs): Promise<void> => {
      if (!user?.uid || !user.email) throw new Error('No authenticated user');

      const payload = {
        ...values,
        expectedPrice: Number(values.expectedPrice),
      };
      const productRef = await createProductForUser(
        user.uid,
        user.email,
        payload
      );
      const productId = productRef.id;

      if (productImageFile) {
        try {
          const imageUrl = await uploadProductImage(
            productId,
            productImageFile
          );
          await updateProductForUser(productId, { imageUrl });
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.list(user?.uid) }),
  });
}

export function useUpdateProduct(uid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      values,
      productImageFile,
    }: UpdateProductArgs): Promise<void> => {
      let imageUrl: string | null = null;
      if (productImageFile) {
        try {
          imageUrl = await uploadProductImage(productId, productImageFile);
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }

      const payload = {
        ...values,
        expectedPrice: Number(values.expectedPrice),
        ...(imageUrl ? { imageUrl } : {}),
      };
      await updateProductForUser(productId, payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.list(uid) }),
  });
}

export function useDeleteProduct(uid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProductForUser(productId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.list(uid) }),
  });
}
