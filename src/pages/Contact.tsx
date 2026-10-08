import { useState, useEffect } from 'react';
import { sendContactMessage } from '../services/contactEmailService';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  useEffect(() => {
    document.title = 'SaleCheck | Contact';
  }, []);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await sendContactMessage(formData);
      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('sendContactMessage failed:', err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-24 px-6">
      <h1 className="text-5xl font-extrabold mb-6 text-gray-900">Contact Us</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-sm shadow-sm"
      >
        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="name"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="email"
          >
            E-Mail
          </label>
          <input
            type="email"
            id="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="message"
          >
            Message
          </label>
          <textarea
            id="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {status === 'error' && (
          <p className="text-red-500 text-sm">
            Something went wrong. Try again.
          </p>
        )}
        {status === 'sent' && (
          <p className="text-green-600 text-sm">Message sent — thanks!</p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            type="submit"
            disabled={status === 'sending'}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105"
          >
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
