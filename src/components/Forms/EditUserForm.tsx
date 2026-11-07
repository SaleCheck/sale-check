import { useState, type FormEvent } from 'react';

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
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Edit User</h2>
      <input
        type="text"
        placeholder="First Name"
        className="border rounded-sm px-3 py-2"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        className="border rounded-sm px-3 py-2"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 py-2 rounded-full"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 rounded-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
