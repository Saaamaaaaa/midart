import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { postAPI, verbalPostAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreatePost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const postType = searchParams.get('type') || 'image';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Image post state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');

  // Verbal post state
  const [content, setContent] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (postType === 'image') {
        if (!image) {
          setError('Please select an image');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('image', image);
        if (caption) formData.append('caption', caption);
        await postAPI.create(formData);
      } else {
        if (!content.trim()) {
          setError('Please enter some content');
          setLoading(false);
          return;
        }
        await verbalPostAPI.create({ content });
      }
      navigate(`/profile/${user.username}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-2xl font-light text-gray-900 text-center mb-8">
          {postType === 'image' ? 'Upload Image' : 'Verbalise Thoughts'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          {postType === 'image' ? (
            <>
              {/* Image upload */}
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block w-full aspect-square border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Upload className="w-12 h-12 mb-3" />
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs mt-1">JPG, PNG, GIF up to 10MB</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Caption */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Caption (optional)</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  placeholder="Write a caption..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Verbal content */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Your thoughts</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  maxLength={280}
                  placeholder="Share your thoughts, ideas, or reflections..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  {content.length}/280 characters
                </p>
              </div>

              {/* Preview */}
              {content && (
                <div className="p-6 rounded-xl bg-gray-50 text-center">
                  <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
                </div>
              )}
            </>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
