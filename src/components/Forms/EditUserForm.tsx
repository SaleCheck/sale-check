import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface EditUserFormValues {
  firstName: string;
  lastName: string;
}

interface EditUserFormProps {
  initialFirstName?: string;
  initialLastName?: string;
  closeModal?: () => void;
  onSubmit: (values: EditUserFormValues) => Promise<void>;
}

export default function EditUserForm({
  initialFirstName = '',
  initialLastName = '',
  closeModal,
  onSubmit,
}: EditUserFormProps) {
  const [firstName, setFirstName] = useState<string>(initialFirstName);
  const [lastName, setLastName] = useState<string>(initialLastName);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      if (closeModal) closeModal();
    } catch (err) {
      console.error('Edit user error:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('common.unexpectedError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">{t('editUser.title')}</h2>
      <input
        type="text"
        placeholder={t('common.firstName')}
        className="border rounded-sm px-3 py-2"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder={t('common.lastName')}
        className="border rounded-sm px-3 py-2"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      {/* Action Buttons */}
      <div className="flex justify-center space-x-3 pt-4 w-full">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          {t('common.cancel')}
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md bg-blue-500 text-white ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95'
          }`}
        >
          {loading ? t('common.saving') : t('common.save')}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
