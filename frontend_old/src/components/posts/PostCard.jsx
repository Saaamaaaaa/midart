import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { postAPI, verbalPostAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isImagePost = post.post_type === 'post' || post.image;
  const isOwner = user?.username === post.user?.username;
  const api = isImagePost ? postAPI : verbalPostAPI;

  const handleLike = async () => {
    try {
      if (liked) {
        await api.unlike(post.id);
        setLikeCount((prev) => prev - 1);
      } else {
        await api.like(post.id);
        setLikeCount((prev) => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.addComment(post.id, newComment);
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(post.id, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(post.id);
      onDelete?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.user?.username}`} className="flex items-center gap-3">
          <Avatar
            src={post.user?.profile?.profile_image}
            name={post.user?.username}
            size="sm"
          />
          <div>
            <p className="font-medium text-sm text-gray-900">{post.user?.username}</p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {isImagePost ? (
        <>
          {post.image && (
            <img
              src={post.image}
              alt={post.caption || 'Post image'}
              className="w-full aspect-square object-cover"
            />
          )}
          {post.caption && (
            <p className="px-4 py-3 text-sm text-gray-700">{post.caption}</p>
          )}
        </>
      ) : (
        <div className="px-4 py-6 bg-gray-50">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm ${
            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-50">
          {/* Comment list */}
          <div className="py-3 space-y-3 max-h-48 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar
                    src={comment.user?.profile?.profile_image}
                    name={comment.user?.username}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <Link
                        to={`/profile/${comment.user?.username}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {comment.user?.username}
                      </Link>{' '}
                      <span className="text-gray-600">{comment.content}</span>
                    </p>
                  </div>
                  {user?.username === comment.user?.username && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No comments yet</p>
            )}
          </div>

          {/* Add comment */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
