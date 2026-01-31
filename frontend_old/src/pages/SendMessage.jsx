import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { messageAPI, profileAPI } from '../services/api';

export default function SendMessage() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const replyToId = searchParams.get('reply');

  const [recipient, setRecipient] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipient();
  }, [username]);

  const fetchRecipient = async () => {
    try {
      const response = await profileAPI.get(username);
      setRecipient(response.data);

      // If replying, set subject prefix
      if (replyToId) {
        setFormData((prev) => ({
          ...prev,
          subject: prev.subject || 'Re: ',
        }));
      }
    } catch (error) {
      console.error('Error fetching recipient:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.subject.trim() || !formData.body.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await messageAPI.send({
        recipient: username,
        subject: formData.subject,
        body: formData.body,
        parent_id: replyToId || null,
      });
      navigate('/messages');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          to="/messages"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to messages
        </Link>

        {/* Recipient */}
        {recipient && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <Avatar
              src={recipient.profile?.profile_image}
              name={recipient.username}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-900">{recipient.username}</p>
              <p className="text-sm text-gray-500">Sending message to</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Message subject"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Message</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={6}
              placeholder="Write your message..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
              required
            />
          </div>

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
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
