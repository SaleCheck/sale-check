export function LoginForm({ switchToSignup }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Login</h2>
      <input type="email" placeholder="Email" className="border rounded px-3 py-2" />
      <input type="password" placeholder="Password" className="border rounded px-3 py-2" />
      <button className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-full">
        Login
      </button>
      <p className="text-sm text-gray-500">
        Don't have an account?{" "}
        <button className="text-blue-500 hover:underline" onClick={switchToSignup}>
          Sign Up
        </button>
      </p>
    </div>
  );
}