import { Routes, Route, Link } from "react-router-dom";
import priceTrackImage from './assets/pricetrack.jpg';
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
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
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105">
              Login
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105">
              Sign Up
            </button>
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
                  <img src={priceTrackImage} alt="pricetrack-img" className="rounded-lg max-w-full h-auto" />
                </div>
              </div>
            }
          />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="shadow-md text-gray-700 py-4 text-center mt-auto">
        &copy; {new Date().getFullYear()} SaleCheck. All rights reserved.
      </footer>
    </div>
  )
}

export default App;
