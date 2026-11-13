import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { sendContactMessage } from '../services/contactEmailService';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('pageTitle.contact');
  }, [t]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const { mutate: sendMessage, status } = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => setFormData({ name: '', email: '', message: '' }),
    onError: (err) => console.error('sendContactMessage failed:', err),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(formData);
  };

  return (
    <div className="max-w-3xl mx-auto mt-24 px-6">
      <h1 className="text-5xl font-extrabold mb-6 text-gray-900">
        {t('contact.title')}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-sm shadow-sm"
      >
        <div>
          <label
            className="block text-gray-700 font-medium mb-1"
            htmlFor="name"
          >
            {t('contact.name')}
          </label>
          <input
            type="text"
            id="name"
            placeholder={t('contact.namePlaceholder')}
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
            {t('contact.email')}
          </label>
          <input
            type="email"
            id="email"
            placeholder={t('contact.emailPlaceholder')}
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
            {t('contact.message')}
          </label>
          <textarea
            id="message"
            placeholder={t('contact.messagePlaceholder')}
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {status === 'error' && (
          <p className="text-red-500 text-sm">{t('contact.error')}</p>
        )}
        {status === 'success' && (
          <p className="text-green-600 text-sm">{t('contact.success')}</p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            type="submit"
            disabled={status === 'pending'}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-full transition transform hover:scale-105"
          >
            {status === 'pending'
              ? t('contact.submitting')
              : t('contact.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
