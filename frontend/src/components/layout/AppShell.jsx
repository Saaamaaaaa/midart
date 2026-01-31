import { Link, NavLink, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

export default function AppShell({ children }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    "text-sm " +
    (isActive
      ? "text-gray-900 font-medium"
      : "text-gray-600 hover:text-gray-900");

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-gray-900">
            MidArt
          </Link>

          <nav className="flex items-center gap-4">
            <NavLink to="/feed" className={navClass}>
              Feed
            </NavLink>

            {!loading && user ? (
              <>
                <Link
  to={`/profile/${user.username}`}
  className="text-sm text-gray-600 hover:text-gray-900"
>
  @{user.username}
</Link>

                <Button variant="secondary" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
