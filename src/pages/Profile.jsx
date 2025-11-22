import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import Card from "../components/Card/Card";
import Spinner from "../components/Spinner/Spinner";
import Modal from "../components/Modal/Modal";
import ProductForm from "../components/Forms/ProductForm";
import { subscribeToAuthStateChanges } from "../services/authService";
import { getUserDoc } from "../services/firestoreUserService";
import { getProductsForUser, createProductForUser, updateProductForUser, deleteProductForUser } from "../services/firestoreProductService";
import { uploadProductImage } from "../services/storageUserServce";

export default function Profile() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [productsToCheck, setProductsToCheck] = useState([]);
    const [modalProductData, setModalProductData] = useState({});
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "SaleCheck | Profile";
        const unsubscribe = subscribeToAuthStateChanges(async (currentUser) => {
            setLoading(true);

            if (!currentUser) {
                setUser(null);
                setUserData(null);
                setProductsToCheck([]);
                setLoading(false);
                return;
            }

            setUser(currentUser);

            try {
                const userData = await getUserDoc(currentUser.uid);
                setUserData(userData);

                const userProducts = await getProductsForUser(currentUser.uid);
                setProductsToCheck(userProducts);

            } catch (err) {
                console.error("Error loading data:", err);

            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center pt-24 space-y-4">
                <p className="text-gray-500 text-lg">Fetching products...</p>
                <Spinner size="24" />
            </div>
        )
    }

    if (!loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">You are not logged in.</p>
            </div>
        );
    }

    const handleCreate = async ({ values, productImageFile }) => {
        if (!user?.uid) {
            console.error("No authenticated user");
            return;
        }

        try {
            setLoading(true);
            const productRef = await createProductForUser(user.uid, user.email, { ...values });
            const productId = productRef.id;

            let imageUrl = null;
            if (productImageFile) {
                try {
                    imageUrl = await uploadProductImage(productId, productImageFile);
                    await updateProductForUser(productId, { imageUrl: imageUrl });

                } catch (err) {
                    console.error("Image upload failed:", err);
                }
            }

            setIsCreateModalOpen(false);
            navigate(0);    // Reload page
        } catch (err) {
            console.error("Error updating product:", err);

        } finally {
            setLoading(false);
        }
    }

    const handleEdit = async ({ productId, values, productImageFile }) => {
        if (!productId) {
            console.log("No productid")
            return;
        }

        try {
            setLoading(true);

            let imageUrl = null;
            if (productImageFile) {
                try {
                    imageUrl = await uploadProductImage(productId, productImageFile);
                } catch (err) {
                    console.error("Image upload failed:", err);
                }
            }

            const payload = {
                ...values,
                ...(imageUrl ? { imageUrl } : {})
            };
            await updateProductForUser(productId, payload);

            setIsEditModalOpen(false);
            navigate(0);    // Reload page
        } catch (err) {
            console.error("Error updating product:", err);

        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (productId) => {
        if (!productId) return;

        try {
            setIsDeleting(true);
            await deleteProductForUser(productId);

            setIsDeleteModalOpen(false);
            navigate(0);    // Reload page

        } catch (err) {
            console.error("Error deleting product:", err);

        } finally {
            setIsDeleting(false)
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-col items-center text-center pt-16">
                <h1 className="text-2xl font-bold mb-2">Welcome, {userData?.firstName || user.displayName || user.email}!</h1>
                <p className="text-gray-600">Price monitoring alerts are sent to the email your account is registered with.</p>

                {/* Button: Add Product */}
                <button
                    className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm hover:shadow transition flex items-center gap-2"
                    onClick={() => {
                        setModalProductData({});
                        setIsCreateModalOpen(true);
                    }}>
                    <PlusIcon className="w-5 h-5" /> Add Product
                </button>

                {/* Cards: Render for each product */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 mt-4">
                    {productsToCheck.map((product) => (
                        <Card
                            key={product.id}
                            imageSrc={product.imageUrl}
                            title={product.productName || "Unnamed Product"}
                            expectedPrice={product.expectedPrice || "Unknown Price"}
                            expectedPriceCurrency={product.expectedPriceCurrency || ""}
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
            <Modal isOpen={isCreateModalOpen} closeModal={() => setIsCreateModalOpen(false)}>
                <ProductForm
                    formTitle="Add Product"
                    imageUpload={true}
                    closeModal={() => setIsCreateModalOpen(false)}
                    submitBtnLabel="Add Product"
                    submitBtnClassName="bg-green-500 text-white"
                    onSubmit={handleCreate}
                />
            </Modal>

            {/* Modal: Edit Product */}
            <Modal isOpen={isEditModalOpen} closeModal={() => setIsEditModalOpen(false)}>
                <ProductForm
                    formTitle="Edit Product"
                    closeModal={() => setIsEditModalOpen(false)}
                    productId={modalProductData.id}
                    productName={modalProductData.productName}
                    imageUrl={modalProductData.imageUrl}
                    expectedPrice={modalProductData.expectedPrice}
                    expectedPriceCurrency={modalProductData.expectedPriceCurrency}
                    productUrl={modalProductData.url}
                    cssSelector={modalProductData.cssSelector}
                    lastUpdated={modalProductData.lastUpdated}
                    submitBtnLabel="Save Changes"
                    submitBtnClassName="bg-blue-500 text-white"
                    onSubmit={handleEdit}
                />
            </Modal>

            {/* Modal: Delete Product */}
            <Modal isOpen={isDeleteModalOpen} closeModal={() => setIsDeleteModalOpen(false)}>
                <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Delete Product</h2>
                    <p className="text-gray-600 text-center">
                        Are you sure you want to delete this product?
                    </p>
                    <div className="flex justify-center space-x-3 pt-4 w-full">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => handleDelete(modalProductData.id)}
                            disabled={isDeleting}
                            className={`px-4 py-2 rounded-md text-white bg-red-500 transition ${isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
                        >
                            {isDeleting ? "Deleting ..." : "Delete"}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
