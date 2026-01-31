import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Image, Type, Folder, Mail, UserPlus, UserMinus, Edit2 } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import PostCard from '../components/posts/PostCard';
import { useAuth } from '../context/AuthContext';
import { profileAPI, postAPI, verbalPostAPI, projectAPI, followAPI } from '../services/api';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsYou, setFollowsYou] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const normalizeProfileResponse = (data) => {
    // Some backends return { user: {...}, profile: {...} }
    if (data && data.user) {
      return {
        ...data.user,
        profile: data.profile || null,
        follower_count: data.follower_count ?? data.profile?.follower_count,
        following_count: data.following_count ?? data.profile?.following_count,
        is_following: data.is_following ?? false,
        follows_you: data.follows_you ?? false,
      };
    }
    // Others return a single combined object already
    return data;
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes, verbalRes, projectsRes] = await Promise.all([
        profileAPI.get(username),
        postAPI.list(username),
        verbalPostAPI.list(username),
        projectAPI.list(username),
      ]);

      const normalized = normalizeProfileResponse(profileRes.data);

      setProfile(normalized);
      setFollowerCount(normalized?.follower_count || 0);
      setFollowingCount(normalized?.following_count || 0);
      setIsFollowing(normalized?.is_following || false);
      setFollowsYou(normalized?.follows_you || false);

      const imagePosts = (postsRes.data || []).map((p) => ({ ...p, post_type: 'post' }));
      const verbalPosts = (verbalRes.data || []).map((p) => ({ ...p, post_type: 'verbal' }));
      const combined = [...imagePosts, ...verbalPosts].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setPosts(combined);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await followAPI.unfollow(username);
        setFollowerCount((prev) => prev - 1);
      } else {
        await followAPI.follow(username);
        setFollowerCount((prev) => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-6">
        <div className="max-w-2xl mx-auto px-6 animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full" />
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-gray-500">User not found</p>
          <p className="text-sm text-gray-400 mt-2">
            (This usually means the profile API URL doesn’t match the Django endpoint.)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <Avatar
            src={profile?.profile?.profile_image}
            name={profile?.username}
            size="xl"
          />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-medium text-gray-900">{profile?.username}</h1>

              {isOwnProfile ? (
                <Link to="/edit-profile">
                  <Button variant="secondary" icon={<Edit2 className="w-4 h-4" />}>
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? 'secondary' : 'primary'}
                  icon={isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}

              {!isOwnProfile && (
                <Link to={`/messages/send/${profile?.username}`}>
                  <Button variant="secondary" icon={<Mail className="w-4 h-4" />}>
                    Message
                  </Button>
                </Link>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-3">{profile?.profile?.bio}</p>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link to={`/profile/${profile?.username}/followers`} className="hover:text-gray-900">
                <span className="font-medium text-gray-900">{followerCount}</span> followers
              </Link>
              <Link to={`/profile/${profile?.username}/following`} className="hover:text-gray-900">
                <span className="font-medium text-gray-900">{followingCount}</span> following
              </Link>
              {!isOwnProfile && followsYou && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  Follows you
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'posts'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Image className="w-4 h-4" /> Posts
            </span>
          </button>
          <button
            onClick={() => setActiveTab('verbal')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'verbal'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Type className="w-4 h-4" /> Verbalise
            </span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'projects'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Folder className="w-4 h-4" /> Projects
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab !== 'projects' && (
          <div className="space-y-4">
            {posts
              .filter((p) => (activeTab === 'posts' ? p.post_type === 'post' : p.post_type === 'verbal'))
              .map((post) => (
                <PostCard key={`${post.post_type}-${post.id}`} post={post} onDelete={handlePostDelete} />
              ))}

            {posts.filter((p) => (activeTab === 'posts' ? p.post_type === 'post' : p.post_type === 'verbal')).length ===
              0 && (
              <div className="py-10 text-center text-gray-500 text-sm">
                Nothing here yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-3">
            {(projects || []).map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="block p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition"
              >
                <div className="font-medium text-gray-900">{project.title}</div>
                <div className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</div>
              </Link>
            ))}

            {(projects || []).length === 0 && (
              <div className="py-10 text-center text-gray-500 text-sm">
                No projects yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
