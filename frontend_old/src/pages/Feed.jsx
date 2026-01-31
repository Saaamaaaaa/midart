import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Type, Folder } from 'lucide-react';
import PostCard from '../components/posts/PostCard';
import Button from '../components/ui/Button';
import { feedAPI } from '../services/api';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await feedAPI.getFeed();
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-6">
        <div className="max-w-lg mx-auto px-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-64 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Quick create buttons */}
        <div className="flex gap-2 mb-6">
          <Link to="/create/post?type=image" className="flex-1">
            <Button variant="secondary" className="w-full text-sm">
              <Image className="w-4 h-4 mr-2" />
              Image
            </Button>
          </Link>
          <Link to="/create/post?type=verbal" className="flex-1">
            <Button variant="secondary" className="w-full text-sm">
              <Type className="w-4 h-4 mr-2" />
              Verbalise
            </Button>
          </Link>
          <Link to="/create/project" className="flex-1">
            <Button variant="secondary" className="w-full text-sm">
              <Folder className="w-4 h-4 mr-2" />
              Project
            </Button>
          </Link>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={`${post.post_type}-${post.id}`}
                post={post}
                onDelete={handlePostDelete}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Your feed is empty</p>
              <p className="text-sm text-gray-400">Follow some artists to see their work here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
