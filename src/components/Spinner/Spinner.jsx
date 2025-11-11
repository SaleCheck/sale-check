export default function Spinner({ size = "8", color = "blue" }) {
  return (
    <div className="flex items-center justify-center w-full py-8">
      <div
        className={`h-${size} w-${size} border-4 border-${color}-500 border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}