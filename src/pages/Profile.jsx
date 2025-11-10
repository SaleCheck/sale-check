import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "SaleCheck | Profile";
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) setUserData(userDoc.data());
        });
        return unsubscribe;
    }, []);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">You are not logged in.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-col items-center text-center pt-16">
                <h1 className="text-2xl font-bold mb-2">Welcome, {userData?.firstName || user.displayName || user.email}!</h1>
                <p className="text-gray-600">You are successfully logged in.</p>
            </div>
        </div>
    );
}
