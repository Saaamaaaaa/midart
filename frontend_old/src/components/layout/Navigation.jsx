import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Mail, User, Plus, LogOut, Image, Type, Folder, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-40">
      <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/feed" className="text-xl font-semibold text-gray-900">
          MidArt
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-1">
          {/* Feed */}
          <Link
            to="/feed"
            className={`p-2 rounded-lg transition-colors ${
              isActive('/feed') ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5" />
          </Link>

          {/* Messages */}
          <Link
            to="/messages"
            className={`p-2 rounded-lg transition-colors ${
              location.pathname.startsWith('/messages') ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Mail className="w-5 h-5" />
          </Link>

          {/* Create dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                showCreateMenu ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-5 h-5" />
              <ChevronDown className="w-3 h-3" />
            </button>

            {showCreateMenu && (
              <>
                <div
                  className="fixed inset-0"
                  onClick={() => setShowCreateMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    to="/create/post?type=image"
                    onClick={() => setShowCreateMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Image className="w-4 h-4" />
                    Upload Image
                  </Link>
                  <Link
                    to="/create/post?type=verbal"
                    onClick={() => setShowCreateMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Type className="w-4 h-4" />
                    Verbalise Thoughts
                  </Link>
                  <Link
                    to="/create/project"
                    onClick={() => setShowCreateMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Folder className="w-4 h-4" />
                    Create Project
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <Link
            to={`/profile/${user?.username}`}
            className={`p-2 rounded-lg transition-colors ${
              location.pathname.startsWith('/profile') ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Avatar
              src={user?.profile?.profile_image}
              name={user?.username}
              size="xs"
            />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
