import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmailAndPwd } from "../../services/authService";

export default function LoginForm({ switchToSignup, closeModal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await loginWithEmailAndPwd(email, password);
      if (closeModal) closeModal();
      navigate(`/profile?id=${userCredential.user.uid}`);
    } catch (err) {
      setError("Invalid email or password", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border rounded px-3 py-2"
        autoComplete="username"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border rounded px-3 py-2"
        autoComplete="current-password"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-full disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <p className="text-sm text-gray-500">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-blue-500 hover:underline"
          onClick={switchToSignup}
        >
          Sign Up
        </button>
      </p>
    </form>
  );
}
