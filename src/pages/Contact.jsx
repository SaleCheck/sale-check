import { useState } from "react";

export default function Contact() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });

    return (
        <div className="max-w-3xl mx-auto mt-24 px-6">
            <h1 className="text-5xl font-extrabold mb-6 text-gray-900">Contact Us</h1>
            <form className="space-y-4 bg-white p-6 rounded shadow">
                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Your Name"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                    </input>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="email">E-Mail</label>
                    <input
                        type="text"
                        id="email"
                        placeholder="Your Email"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                    </input>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="message">Message</label>
                    <textarea
                        type="text"
                        id="message"
                        placeholder="Your Message"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={4}
                    >
                    </textarea>
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105"
                    >
                        Submit
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}