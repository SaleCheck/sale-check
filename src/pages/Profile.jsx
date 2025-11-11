import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import Card from "../components/Card/Card";
import Spinner from "../components/Spinner/Spinner";

export default function Profile() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [productsToCheck, setProductsToCheck] = useState([]);
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
                <Spinner/>
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
                            imageSrc="https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
                            title={product.productName || "Unnamed Product"}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
