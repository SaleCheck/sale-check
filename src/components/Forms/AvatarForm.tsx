import { useEffect, useState, type FormEvent } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface AvatarFormProps {
  currentPhotoURL?: string | null;
  closeModal?: () => void;
  onSubmit: (file: File) => Promise<void>;
}

export default function AvatarForm({
  currentPhotoURL = null,
  closeModal,
  onSubmit,
}: AvatarFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!avatarFile) {
      setPreviewURL(null);
      return;
    }

    const objectURL = URL.createObjectURL(avatarFile);
    setPreviewURL(objectURL);

    return () => URL.revokeObjectURL(objectURL);
  }, [avatarFile]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!avatarFile) return;

    setError('');
    setLoading(true);

    try {
      await onSubmit(avatarFile);
      if (closeModal) closeModal();
    } catch (err) {
      console.error('Avatar upload error:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const displayedURL = previewURL ?? currentPhotoURL;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Edit Avatar</h2>
      <div className="flex justify-center">
        {displayedURL ? (
          <img
            src={displayedURL}
            alt="Avatar Preview"
            className="h-24 w-24 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <UserCircleIcon className="h-24 w-24 text-gray-400" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="avatar-file"
          className="text-sm text-gray-600 font-medium"
        >
          Upload new profile picture:
        </label>
        <input
          id="avatar-file"
          type="file"
          className="border rounded-sm px-3 py-2"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {/* Action Buttons */}
      <div className="flex justify-center space-x-3 pt-4 w-full">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!avatarFile || loading}
          className={`px-4 py-2 rounded-md bg-blue-500 text-white ${
            !avatarFile || loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:brightness-95'
          }`}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
