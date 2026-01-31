import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { profileAPI, followAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ComposeMessage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    try {
      const response = await followAPI.getFollowers(user?.username);
      setFollowers(response.data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await profileAPI.search(query);
      setSearchResults(
        (response.data || []).filter((u) => u.username !== user?.username)
      );
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const displayUsers = searchQuery ? searchResults : followers;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        <h1 className="text-2xl font-light text-gray-900 text-center mb-6">
          New Message
        </h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* Users list */}
        <div className="space-y-1">
          {!searchQuery && (
            <p className="text-sm text-gray-500 mb-3">Your followers</p>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : displayUsers.length > 0 ? (
            displayUsers.map((u) => (
              <Link
                key={u.id}
                to={`/messages/send/${u.username}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar
                  src={u.profile?.profile_image}
                  name={u.username}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.username}</p>
                  {u.profile?.user_type && (
                    <p className="text-xs text-gray-400 capitalize">{u.profile.user_type}</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-400 py-8">
              {searchQuery ? 'No users found' : 'No followers yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
