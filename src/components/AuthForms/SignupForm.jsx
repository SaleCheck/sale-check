export function SignupForm({ switchToLogin }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Sign Up</h2>
      <input type="text" placeholder="Name" className="border rounded px-3 py-2" />
      <input type="email" placeholder="Email" className="border rounded px-3 py-2" />
      <input type="password" placeholder="Password" className="border rounded px-3 py-2" />
      <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full">
        Sign Up
      </button>
      <p className="text-sm text-gray-500">
        Already have an account?{" "}
        <button className="text-green-500 hover:underline" onClick={switchToLogin}>
          Login
        </button>
      </p>
    </div>
  );
}
