export default function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition active:scale-[0.99]";

  const styles = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:border-gray-300",
    ghost: "bg-transparent text-gray-700 hover:text-gray-900",
  };

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
