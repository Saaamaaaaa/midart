import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Inbox, Send, PenSquare } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { messageAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = activeTab === 'inbox'
        ? await messageAPI.getInbox()
        : await messageAPI.getOutbox();
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-light text-gray-900">Messages</h1>
          <Link to="/messages/compose">
            <Button size="sm">
              <PenSquare className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'inbox'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Inbox
          </button>
          <button
            onClick={() => setActiveTab('outbox')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'outbox'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent
          </button>
        </div>

        {/* Messages list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-3 p-4 border border-gray-100 rounded-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message) => {
              const otherUser = activeTab === 'inbox' ? message.sender : message.recipient;
              return (
                <Link
                  key={message.id}
                  to={`/messages/send/${otherUser?.username}?reply=${message.id}`}
                  className={`flex items-start gap-3 p-4 border rounded-xl transition-colors hover:bg-gray-50 ${
                    !message.is_read && activeTab === 'inbox'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-100'
                  }`}
                >
                  <Avatar
                    src={otherUser?.profile?.profile_image}
                    name={otherUser?.username}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {otherUser?.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {message.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{message.body}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {activeTab === 'inbox' ? 'No messages in your inbox' : 'No sent messages'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
