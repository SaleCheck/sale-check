import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card/Card';
import Spinner from '../components/Spinner/Spinner';
import Modal from '../components/Modal/Modal';
import ProductForm from '../components/Forms/ProductForm';
import { subscribeToAuthStateChanges } from '../services/authService';
import { getUserDoc } from '../services/firestoreUserService';
import {
  getProductsForUser,
  createProductForUser,
  updateProductForUser,
  deleteProductForUser,
} from '../services/firestoreProductService';
import { uploadProductImage } from '../services/storageUserServce';
import type { User } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';
import type { Product } from '../services/firestoreProductService';

interface ProductFormValues {
  productName: string;
  expectedPrice: string | number;
  expectedPriceCurrency: string;
  url: string;
  cssSelector: string;
}

interface HandleCreateArgs {
  productImageFile: File | null;
  values: ProductFormValues;
}

interface HandleEditArgs {
  productId: string | null;
  productImageFile: File | null;
  values: ProductFormValues;
}

export default function Profile() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [modalProductData, setModalProductData] = useState<Partial<Product>>(
    {}
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    queryKey: ['users', user?.uid],
    queryFn: () => getUserDoc(user!.uid),
    enabled: !!user,
  });
  const { data: productsToCheck = [], isLoading: isProductsLoading } = useQuery(
    {
      queryKey: ['products', user?.uid],
      queryFn: () => getProductsForUser(user!.uid),
      enabled: !!user,
    }
  );

  useEffect(() => {
    document.title = t('pageTitle.profile');
  }, [t]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateChanges(
      (currentUser: User | null) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading || isUserDataLoading || isProductsLoading) {
    return (
      <div className="flex flex-col items-center pt-24 space-y-4">
        <p className="text-gray-500 text-lg">{t('profile.fetching')}</p>
        <Spinner size="24" />
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">{t('profile.notLoggedIn')}</p>
      </div>
    );
  }

  const handleCreate = async ({
    values,
    productImageFile,
  }: HandleCreateArgs): Promise<void> => {
    if (!user?.uid || !user.email) {
      console.error('No authenticated user');
      return;
    }

    try {
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

      let imageUrl: string | null = null;
      if (productImageFile) {
        try {
          imageUrl = await uploadProductImage(productId, productImageFile);
          await updateProductForUser(productId, { imageUrl: imageUrl });
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ['products', user?.uid],
      });
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleEdit = async ({
    productId,
    values,
    productImageFile,
  }: HandleEditArgs): Promise<void> => {
    if (!productId) {
      console.log('No productid');
      return;
    }

    try {
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

      await queryClient.invalidateQueries({
        queryKey: ['products', user?.uid],
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleDelete = async (productId?: string): Promise<void> => {
    if (!productId) return;

    try {
      setIsDeleting(true);
      await deleteProductForUser(productId);

      await queryClient.invalidateQueries({
        queryKey: ['products', user?.uid],
      });
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col items-center text-center pt-16">
        <h1 className="text-2xl font-bold mb-2">
          {t('profile.welcome', {
            name: userData?.firstName || user?.displayName || user?.email,
          })}
        </h1>
        <p className="text-gray-600">{t('profile.alertsInfo')}</p>

        {/* Button: Add Product */}
        <button
          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-xs hover:shadow-sm transition flex items-center gap-2"
          onClick={() => {
            setModalProductData({});
            setIsCreateModalOpen(true);
          }}
        >
          <PlusIcon className="w-5 h-5" /> {t('profile.addProduct')}
        </button>

        {/* Cards: Render for each product */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 mt-4">
          {productsToCheck.map((product) => (
            <Card
              key={product.id}
              imageSrc={product.imageUrl}
              title={product.productName || t('card.unnamed')}
              expectedPrice={product.expectedPrice}
              expectedPriceCurrency={product.expectedPriceCurrency || ''}
              onEdit={() => {
                setIsEditModalOpen(true);
                setModalProductData(product);
              }}
              onDelete={() => {
                setIsDeleteModalOpen(true);
                setModalProductData(product);
              }}
            />
          ))}
        </div>
      </div>

      {/* Modal: Add Product */}
      <Modal
        isOpen={isCreateModalOpen}
        closeModal={() => setIsCreateModalOpen(false)}
      >
        <ProductForm
          formTitle={t('profile.addProduct')}
          closeModal={() => setIsCreateModalOpen(false)}
          submitBtnLabel={t('profile.addProduct')}
          submitBtnClassName="bg-green-500 text-white"
          onSubmit={handleCreate}
        />
      </Modal>

      {/* Modal: Edit Product */}
      <Modal
        isOpen={isEditModalOpen}
        closeModal={() => setIsEditModalOpen(false)}
      >
        <ProductForm
          formTitle={t('profile.editProduct')}
          closeModal={() => setIsEditModalOpen(false)}
          productId={modalProductData.id}
          productName={modalProductData.productName}
          imageUrl={modalProductData.imageUrl}
          expectedPrice={modalProductData.expectedPrice}
          expectedPriceCurrency={modalProductData.expectedPriceCurrency}
          productUrl={modalProductData.url}
          cssSelector={modalProductData.cssSelector}
          lastUpdated={modalProductData.lastUpdated as Timestamp | undefined}
          submitBtnLabel={t('common.saveChanges')}
          submitBtnClassName="bg-blue-500 text-white"
          onSubmit={handleEdit}
        />
      </Modal>

      {/* Modal: Delete Product */}
      <Modal
        isOpen={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
      >
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('profile.delete.title')}
          </h2>
          <p className="text-gray-600 text-center">
            {t('profile.delete.confirm')}
          </p>
          <div className="flex justify-center space-x-3 pt-4 w-full">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              {t('common.cancel')}
            </button>

            <button
              onClick={() => handleDelete(modalProductData.id)}
              disabled={isDeleting}
              className={`px-4 py-2 rounded-md text-white bg-red-500 transition ${
                isDeleting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-red-600'
              }`}
            >
              {isDeleting
                ? t('profile.delete.submitting')
                : t('profile.delete.submit')}
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center">
            {t('profile.delete.irreversible')}
          </p>
        </div>
      </Modal>
    </div>
  );
}
