import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { LoginForm } from "./components/Forms/LoginForm";
import { SignupForm } from "./components/Forms/SignupForm";
import Modal from "./components/Modal/Modal";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import priceTrackSvg from './assets/pricetrack.svg';
import { UserCircleIcon } from "@heroicons/react/24/solid";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SaleCheck";
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const openLogin = () => { setIsLogin(true); setIsModalOpen(true); };
  const openSignup = () => { setIsLogin(false); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 shadow-md">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.jpg" alt="SaleCheck Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gray-900">SaleCheck</span>
        </Link>

        <div className="flex items-center">
          {/* Nav */}
          <nav className="hidden md:flex items-center gap-12 text-gray-700 font-medium">
            <Link to="/how-it-works" className="hover:text-green-600">How It Works</Link>
            <Link to="/about" className="hover:text-green-600">About</Link>
            <Link to="/contact" className="hover:text-green-600">Contact</Link>
          </nav>

          {/* Auth */}
          <div className="flex gap-4 ml-16">
            {user ? (
              <div className="flex flex-col items-center">
                <button
                  onClick={() => navigate(`/profile?id=${user.uid}`)}
                  className="focus:outline-none"
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User Avatar"
                      className="h-10 w-10 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  )}
                </button>
                <span
                  onClick={() => {
                    auth.signOut().then(() => {
                      setUser(null);
                      navigate("/");
                    });
                  }}
                  className="text-xs text-gray-400 mt-1 cursor-pointer hover:text-gray-600"
                >
                  Signout
                </span>
              </div>
            ) : (
              <>
                <button onClick={openLogin} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105">
                  Login
                </button>
                <button onClick={openSignup} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col md:flex-row gap-8 px-[10%] mt-[5vh]">
                {/* Left Column */}
                <div className="md:w-1/2 flex flex-col justify-center">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                    Welcome to SaleCheck
                  </h1>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    We provide you with the service that makes tracking price drops a breeze. Enter the product URL and your target
                    price, and our system will keep a close eye on any price changes for you. We’ll notify you the moment your item is
                    on sale, so you can seize the deal without having to constantly check.
                    <br /><br />
                    Let us do the hard work of monitoring prices, so you can enjoy your savings effortlessly!
                  </p>
                </div>
                {/* Right Column */}
                <div className="md:w-1/2 flex justify-center items-center">
                  <img src={priceTrackSvg} alt="pricetrack-img" className="rounded-lg max-w-full h-auto" />
                </div>
              </div>
            }
          />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="shadow-md text-gray-700 py-4 text-center mt-auto">
        &copy; {new Date().getFullYear()} SaleCheck. All rights reserved.
      </footer>

      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        {isLogin ? (
          <LoginForm switchToSignup={() => setIsLogin(false)} closeModal={closeModal} />
        ) : (
          <SignupForm switchToLogin={() => setIsLogin(true)} closeModal={closeModal} />
        )}
      </Modal>
    </div>
  )
}

export default App;
