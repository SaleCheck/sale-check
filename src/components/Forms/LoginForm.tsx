import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginWithEmailAndPwd } from '../../services/authService';

interface LoginFormProps {
  switchToSignup: () => void;
  closeModal: () => void;
}

export default function LoginForm({
  switchToSignup,
  closeModal,
}: LoginFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await loginWithEmailAndPwd(email, password);

      if (closeModal) closeModal();
      navigate(`/profile?id=${userCredential.user.uid}`);
    } catch {
      setError(t('auth.login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">{t('auth.login.title')}</h2>

      <input
        type="email"
        placeholder={t('common.email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border rounded-sm px-3 py-2"
        autoComplete="username"
      />

      <input
        type="password"
        placeholder={t('common.password')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border rounded-sm px-3 py-2"
        autoComplete="current-password"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-full disabled:opacity-50"
      >
        {loading ? t('auth.login.submitting') : t('auth.login.submit')}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <p className="text-sm text-gray-500">
        {t('auth.login.noAccount')}{' '}
        <button
          type="button"
          className="text-blue-500 hover:underline"
          onClick={switchToSignup}
        >
          {t('auth.login.switchToSignup')}
        </button>
      </p>
    </form>
  );
}
