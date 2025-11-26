import { useEffect } from "react";

export default function HowItWorks() {
    useEffect(() => {
        document.title = "SaleCheck | How It Works";
    }, []);

    return (
        <div className="max-w-3xl mx-auto mt-24 mb-36 px-6">
            <h1 className="text-5xl font-extrabold mb-6 text-gray-900">How It Works</h1>

            <div className="text-lg text-gray-700 space-y-10">

                <p className="ml-4">
                    SaleCheck makes it effortless to track price changes on the products you care about.
                </p>

                {/* STEP 1 */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">1. Create Your Account</h2>
                    <p className="mt-3 ml-4">
                        Sign up with your email to get started.<br />
                        Your email is used for login and for receiving price alerts.
                    </p>
                </div>

                {/* STEP 2 */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">2. Add a Product</h2>
                    <p className="mt-3 ml-4">
                        Paste the product’s URL into SaleCheck and give it a name.<br />
                        This tells the system which item you want to track.
                    </p>
                </div>

                {/* STEP 3 + YouTube Embed */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">3. Provide the Price Selector</h2>
                    <p className="mt-3 ml-4 mb-4">
                        Every store displays prices differently, so SaleCheck needs to know exactly where the price
                        is located on the page.<br /><br />
                        Open the product page in Chrome, right-click the price, choose <strong>Inspect</strong>, then
                        right-click the highlighted element and select <strong>Copy → Copy selector</strong>.
                    </p>

                    <div className="my-6 ml-2">
                        <iframe
                            className="w-full aspect-video rounded-lg"
                            src="https://www.youtube.com/embed/GCSym4Bktgg"
                            title="How to find CSS selectors"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                {/* STEP 4 */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">4. Automatic Monitoring</h2>
                    <p className="mt-3 ml-4">
                        Once the product is added, SaleCheck continuously checks the page for price changes.<br />
                        No need to revisit the online stores anymore — SaleCheck does the work for you.
                    </p>
                </div>

                {/* STEP 5 */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">5. Get Email Alerts</h2>
                    <p className="mt-3 ml-4">
                        After each monitoring run, you'll receive a confirmation email.<br />
                        If a price drop or change is detected, SaleCheck immediately notifies you so you never miss a deal.
                    </p>
                </div>

            </div>
        </div>
    );
}
