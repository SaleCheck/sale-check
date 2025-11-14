import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function SignupForm({ switchToLogin, closeModal }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!(password.length > 0 && password === confirmPassword)) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const displayName = `${firstName} ${lastName}`.trim();

      if (avatarFile) {
        let photoURL;

        const avatarRef = ref(storage, `users/avatar/${user.uid}/${user.uid}.png`);
        await uploadBytes(avatarRef, avatarFile);
        photoURL = await getDownloadURL(avatarRef);

        await updateProfile(user, {
          displayName: displayName,
          photoURL: photoURL || null
        });

        await updateDoc(doc(db, "users", user.uid), {
          photoURL: photoURL,
          displayName: displayName,
          firstName: firstName,
          lastName: lastName,
          lastUpdated: serverTimestamp(),
        })

      } else {
        await updateDoc(doc(db, "users", user.uid), {
          displayName: displayName,
          firstName: firstName,
          lastName: lastName,
          lastUpdated: serverTimestamp(),
        })
      }

      if (closeModal) closeModal();
      navigate(`/profile?id=${user.uid}`);

    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);

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
          onChange={(e) => setAvatarFile(e.target.files[0])}
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
