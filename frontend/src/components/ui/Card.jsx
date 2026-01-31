export default function Card({ className = "", ...props }) {
  return (
    <div
      className={"rounded-xl border border-gray-100 bg-white shadow-sm " + className}
      {...props}
    />
  );
}
