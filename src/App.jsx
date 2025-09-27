import './App.css'
import favicon from '/favicon.jpg'

function App() {
  return (
    <div className="flex flex-col items-center justify-center px-4 mt-[10vh]">
      {/* Favicon Image */}
      <img
        src={favicon}
        alt="SaleCheck Favicon"
        className="h-56 w-56 object-contain mb-6"
      />

      {/* Main Header */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
        Welcome to SaleCheck
      </h1>


      {/* Introduction Text */}
      <p className="text-gray-700 text-center max-w-2xl mb-8 leading-relaxed">
        We provide you with the service that makes tracking price drops a breeze. Enter the product URL and your target
        price, and our system will keep a close eye on any price changes for you. We’ll notify you the moment your item is
        on sale, so you can seize the deal without having to constantly check.
        <br /><br />
        Let us do the hard work of monitoring prices, so you can enjoy your savings effortlessly!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition transform hover:scale-105">
          Login
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition transform hover:scale-105">
          Sign Up
        </button>
      </div>
    </div>
  )
}

export default App
