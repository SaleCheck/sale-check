import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  signUpWithEmailAndPwd,
  updateUserAuthProfile,
} from "../../services/authService";
import { updateUserDoc } from "../../services/firestoreUserService";
import { uploadUserAvatar } from "../../services/storageUserServce";

interface SignupFormProps {
  switchToLogin: () => void;
  closeModal?: () => void;
}

interface UserDoc {
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
}

export default function SignupForm({
  switchToLogin,
  closeModal,
}: SignupFormProps) {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!(password.length > 0 && password === confirmPassword)) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signUpWithEmailAndPwd(email, password);
      const user = userCredential.user;

      let photoURL: string | undefined;
      const displayName = `${firstName} ${lastName}`.trim();

      const userDoc: UserDoc = {
        displayName,
        firstName,
        lastName,
      };

      if (avatarFile) {
        photoURL = await uploadUserAvatar(user.uid, avatarFile);
        userDoc.photoURL = photoURL;
      }

      await updateUserAuthProfile(user, {
        displayName,
        photoURL: photoURL || null,
      });

      await updateUserDoc(user.uid, userDoc);

      if (closeModal) closeModal();

      navigate(`/profile?id=${user.uid}`);

    } catch (err) {
      console.error("Signup error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }

    } finally {
      setLoading(false);
      console.log("Signup process finished");
    }
  };

  return (
    <form onSubmit={handleSignup} autoComplete="off" className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Sign Up</h2>
      <input
        type="text"
        placeholder="First Name"
        className="border rounded px-3 py-2"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        className="border rounded px-3 py-2"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="border rounded px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="border rounded px-3 py-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="border rounded px-3 py-2"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 font-medium">
          Upload profile picture (optional):
        </label>
        <input
          type="file"
          className="border rounded px-3 py-2"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-sm text-gray-500">
        Already have an account?{" "}
        <button className="text-green-500 hover:underline" onClick={switchToLogin} type="button">
          Login
        </button>
      </p>
    </form>
  );
}