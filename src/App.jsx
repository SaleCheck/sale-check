import './App.css'
import favicon from '/favicon.png'

function App() {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Favicon Image */}
      <img
        src={favicon}
        alt="SaleCheck Favicon"
        style={{ height: '250px', display: 'block', margin: '0 auto' }}
      />

      {/* Main Header */}
      <h1>Welcome to SaleCheck</h1>

      {/* Introduction Text */}
      <p className="intro-text">
        We provide you with the service that makes tracking price drops a breeze. Enter the product URL and your target
        price, and our system will keep a close eye on any price changes for you. We’ll notify you the moment your item is
        on sale, so you can seize the deal without having to constantly check.
        <br /><br />
        Let us do the hard work of monitoring prices, so you can enjoy your savings effortlessly!
      </p>
    </div>
  )
}

export default App
