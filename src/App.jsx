import priceTrackImage from './assets/pricetrack.jpg'  // your right-side image

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 shadow-md">
        <div className="flex items-center gap-2">
          <img src="/favicon.jpg" alt="SaleCheck Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gray-900">SaleCheck</span>
        </div>

        <div className="flex gap-4">
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105">
            Login
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105">
            Sign Up
          </button>
        </div>
      </header>

      {/* Two-column section */}
      <main className="flex flex-1 flex-col md:flex-row items-center justify-between gap-8 py-16 px-[10%]">
        {/* Left Column: Text */}
        <div className="md:w-1/2">
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

        {/* Right Column: Image */}
        <div className="md:w-1/2 flex justify-center">
          <img src={priceTrackImage} alt="pricetrack-img" className="rounded-lg max-w-full h-auto" />
        </div>
      </main>
    </div>
  )
}

export default App
