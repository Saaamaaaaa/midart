export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full px-4 py-3 text-sm rounded-xl border border-gray-200 " +
        "focus:outline-none focus:ring-2 focus:ring-gray-200 " +
        className
      }
    />
  );
}
