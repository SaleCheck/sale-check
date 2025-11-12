import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import Card from "../components/Card/Card";
import Spinner from "../components/Spinner/Spinner";
import Modal from "../components/Modal/Modal";

export default function Profile() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [productsToCheck, setProductsToCheck] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "SaleCheck | Profile";
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
                // Get user data
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) setUserData(userDoc.data());

                // Get productsToCheck
                const productsToCheckRef = collection(db, "productsToCheck");
                const productsToCheckQuery = query(productsToCheckRef, where("user", "==", currentUser.uid));
                const productsToCheckSnap = await getDocs(productsToCheckQuery);

                const productsList = productsToCheckSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProductsToCheck(productsList);

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
                <p className="text-gray-600 text-lg">Fetching products...</p>
                <Spinner />
            </div>
        )
    }

    if (!user && !loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">You are not logged in.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-col items-center text-center pt-16">
                <h1 className="text-2xl font-bold mb-2">Welcome, {userData?.firstName || user.displayName || user.email}!</h1>
                <p className="text-gray-600">You are successfully logged in.</p>

                {/* Render cards for each product */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 mt-8">
                    {productsToCheck.map((product) => (
                        <Card
                            key={product.id}
                            imageSrc={product.imageUrl}
                            title={product.productName || "Unnamed Product"}
                            expectedPrice={product.expectedPrice || "Unknown Price"}
                            expectedPriceCurrency={product.expectedPriceCurrency || ""}
                            onEdit={() => setIsEditModalOpen(true)}
                            onDelete={() => setIsDeleteModalOpen(true)}
                        />
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} closeModal={() => setIsEditModalOpen(false)}>
                <p>Modal</p>
            </Modal>

            {/* Delete Modal */}
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
                            disabled
                            className="px-4 py-2 bg-red-500 text-white rounded-md opacity-50 cursor-not-allowed"
                        >
                            Delete
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
