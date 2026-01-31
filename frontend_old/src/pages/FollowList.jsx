import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { followAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FollowList() {
  const { username } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const isFollowersList = location.pathname.includes('/followers');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [username, isFollowersList]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = isFollowersList
        ? await followAPI.getFollowers(username)
        : await followAPI.getFollowing(username);
      setUsers(response.data || []);

      // Initialize following states
      const states = {};
      (response.data || []).forEach((u) => {
        states[u.username] = u.is_following || false;
      });
      setFollowingStates(states);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (targetUsername) => {
    const isFollowing = followingStates[targetUsername];
    try {
      if (isFollowing) {
        await followAPI.unfollow(targetUsername);
      } else {
        await followAPI.follow(targetUsername);
      }
      setFollowingStates((prev) => ({
        ...prev,
        [targetUsername]: !isFollowing,
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          to={`/profile/${username}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {username}'s profile
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-light text-gray-900 mb-6">
          {isFollowersList ? `${username}'s Followers` : `${username} is Following`}
        </h1>

        {/* Users list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-1">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Link to={`/profile/${u.username}`} className="flex items-center gap-3 flex-1">
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

                {user?.username !== u.username && (
                  <Button
                    variant={followingStates[u.username] ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleFollow(u.username)}
                  >
                    {followingStates[u.username] ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">
            {isFollowersList ? 'No followers yet' : 'Not following anyone yet'}
          </p>
        )}
      </div>
    </div>
  );
}
