import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, UserPlus, UserMinus, Image, Type, Search, Home, User, FolderKanban, Mail, Bell, Settings, Calendar, DollarSign, Users, Clock, CheckCircle2, Pause, Pencil, ChevronRight, X, Send, Plus, Camera } from 'lucide-react';

// ============================================
// MOCK DATA
// ============================================
const mockUsers = {
  currentUser: {
    id: 1,
    username: 'sama',
    name: 'Sama Yahyazadeh',
    email: 'sama@midart.com',
    userType: 'artist',
    bio: 'Digital artist exploring the intersection of technology and traditional art forms. Currently working on generative art projects.',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    followerCount: 1247,
    followingCount: 89,
    postCount: 34,
    projectCount: 5
  },
  users: [
    { id: 2, username: 'artcollector', name: 'James Chen', userType: 'collector', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', bio: 'Passionate art collector. Supporting emerging artists.' },
    { id: 3, username: 'modernvisions', name: 'Gallery Modern', userType: 'gallery', profileImage: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=150&h=150&fit=crop', bio: 'Contemporary art gallery in NYC.' },
    { id: 4, username: 'paintedworld', name: 'Elena Rodriguez', userType: 'artist', profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', bio: 'Oil painter. Nature and portraits.' },
  ]
};

const mockPosts = [
  { id: 1, type: 'image', user: mockUsers.currentUser, image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=400&fit=crop', caption: 'New piece from my "Digital Dreams" series. Exploring the boundaries between reality and imagination.', likes: 234, comments: 18, liked: false, createdAt: '2h ago' },
  { id: 2, type: 'verbal', user: mockUsers.users[2], content: 'Just finished setting up my studio for the winter season. The natural light coming through the north-facing windows is absolutely perfect for painting. Can\'t wait to start my new series! 🎨', likes: 89, comments: 7, liked: true, createdAt: '4h ago' },
  { id: 3, type: 'image', user: mockUsers.users[1], image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop', caption: 'Added this stunning piece to my collection today. The depth and emotion in this work is incredible.', likes: 456, comments: 32, liked: false, createdAt: '6h ago' },
  { id: 4, type: 'verbal', user: mockUsers.currentUser, content: 'Working on something special for the upcoming group exhibition. Stay tuned for the reveal next week! The collaboration with @paintedworld has been amazing.', likes: 167, comments: 23, liked: false, createdAt: '1d ago' },
];

const mockProjects = [
  {
    id: 1,
    title: 'Digital Dreams Collection',
    creator: mockUsers.currentUser,
    description: 'A 12-piece generative art collection exploring the intersection of AI and human creativity. Each piece is unique and tells a story of collaboration between artist and machine.',
    coverImage: 'https://images.unsplash.com/photo-1634017839464-5c339ez2l264f?w=800&h=400&fit=crop',
    projectType: 'solo',
    status: 'ongoing',
    budgetType: 'seeking',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    progress: 65,
    collaborators: [],
    manifestations: ['Digital Art', 'Generative', 'NFT'],
    funding: { goal: 15000, raised: 9750, supporterCount: 47 },
    photos: 8,
    calendarEntries: 12
  },
  {
    id: 2,
    title: 'Urban Echoes',
    creator: mockUsers.users[2],
    description: 'A collaborative mural project bringing together 5 artists to transform an abandoned warehouse into a living gallery.',
    coverImage: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=400&fit=crop',
    projectType: 'collaborative',
    status: 'in_development',
    budgetType: 'grant-funded',
    startDate: '2024-02-01',
    endDate: '2024-08-15',
    progress: 35,
    collaborators: [mockUsers.currentUser, mockUsers.users[0]],
    manifestations: ['Mural', 'Installation', 'Community Art'],
    funding: { goal: 50000, raised: 50000, supporterCount: 128 },
    photos: 24,
    calendarEntries: 8
  },
  {
    id: 3,
    title: 'Portraits of Light',
    creator: mockUsers.users[2],
    description: 'A series of oil paintings capturing the essence of natural light in everyday moments.',
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=400&fit=crop',
    projectType: 'solo',
    status: 'completed',
    budgetType: 'self-funded',
    startDate: '2023-06-01',
    endDate: '2023-12-15',
    progress: 100,
    collaborators: [],
    manifestations: ['Oil Painting', 'Portraits', 'Realism'],
    funding: null,
    photos: 15,
    calendarEntries: 20
  }
];

const mockMessages = [
  { id: 1, sender: mockUsers.users[0], subject: 'Interested in your work', preview: 'Hi Sama, I came across your Digital Dreams collection and...', unread: true, createdAt: '1h ago' },
  { id: 2, sender: mockUsers.users[1], subject: 'Exhibition Opportunity', preview: 'We would love to feature your work in our upcoming...', unread: true, createdAt: '3h ago' },
  { id: 3, sender: mockUsers.users[2], subject: 'Re: Collaboration idea', preview: 'That sounds amazing! Let\'s set up a call to discuss...', unread: false, createdAt: '1d ago' },
];

// ============================================
// COMPONENTS
// ============================================

// Progress Bar Component
const ProgressBar = ({ percentage, color = 'blue', size = 'md', showLabel = true }) => {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{percentage}% complete</span>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    ongoing: 'bg-green-100 text-green-700',
    in_development: 'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
    paused: 'bg-gray-100 text-gray-600'
  };
  const labels = {
    ongoing: 'Ongoing',
    in_development: 'In Development',
    completed: 'Completed',
    paused: 'Paused'
  };
  const icons = {
    ongoing: <Clock className="w-3 h-3" />,
    in_development: <Pencil className="w-3 h-3" />,
    completed: <CheckCircle2 className="w-3 h-3" />,
    paused: <Pause className="w-3 h-3" />
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {icons[status]} {labels[status]}
    </span>
  );
};

// User Avatar Component
const Avatar = ({ user, size = 'md', showType = false }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14', xl: 'w-20 h-20' };
  const typeColors = { artist: 'bg-purple-500', collector: 'bg-blue-500', gallery: 'bg-amber-500' };

  return (
    <div className="relative">
      <img src={user.profileImage} alt={user.name} className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`} />
      {showType && (
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${typeColors[user.userType]} border-2 border-white`} />
      )}
    </div>
  );
};

// Navigation Component
const Navigation = ({ currentPage, setCurrentPage, unreadCount }) => {
  const navItems = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'messages', icon: Mail, label: 'Messages', badge: unreadCount },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:relative md:border-t-0 md:border-r md:h-screen md:w-64 md:py-6">
      <div className="hidden md:block px-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">MidArt</h1>
        <p className="text-sm text-gray-500">Art Community Platform</p>
      </div>
      <div className="flex justify-around md:flex-col md:gap-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              currentPage === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Post Card Component
const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <Avatar user={post.user} showType />
        <div className="flex-1">
          <div className="font-medium text-gray-900">{post.user.name}</div>
          <div className="text-sm text-gray-500">@{post.user.username} · {post.createdAt}</div>
        </div>
      </div>

      {post.type === 'image' && (
        <img src={post.image} alt="Post" className="w-full aspect-video object-cover" />
      )}

      <div className="p-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.type === 'image' ? post.caption : post.content}</p>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likes}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, onClick }) => {
  const fundingPercentage = project.funding
    ? Math.round((project.funding.raised / project.funding.goal) * 100)
    : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="relative">
        <img src={project.coverImage} alt={project.title} className="w-full h-48 object-cover" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar user={project.creator} size="sm" />
          <span className="text-sm text-gray-600">@{project.creator.username}</span>
        </div>

        <h3 className="font-semibold text-gray-900 text-lg">{project.title}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>

        <div className="flex flex-wrap gap-1 mt-3">
          {project.manifestations.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
          ))}
        </div>

        {/* Project Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <ProgressBar percentage={project.progress} color="purple" size="sm" showLabel={false} />
        </div>

        {/* Funding Progress */}
        {project.funding && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Funding</span>
              <span className="font-medium text-green-600">${project.funding.raised.toLocaleString()} / ${project.funding.goal.toLocaleString()}</span>
            </div>
            <ProgressBar
              percentage={fundingPercentage}
              color={fundingPercentage >= 100 ? 'green' : 'blue'}
              size="sm"
              showLabel={false}
            />
            <div className="text-xs text-gray-500 mt-1">{project.funding.supporterCount} supporters</div>
          </div>
        )}

        {project.collaborators.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {project.collaborators.slice(0, 3).map(collab => (
                <img key={collab.id} src={collab.profileImage} alt={collab.name} className="w-6 h-6 rounded-full border-2 border-white" />
              ))}
            </div>
            <span className="text-xs text-gray-500">+{project.collaborators.length} collaborators</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Project Detail Modal
const ProjectDetailModal = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const fundingPercentage = project.funding
    ? Math.round((project.funding.raised / project.funding.goal) * 100)
    : null;

  const budgetItems = [
    { category: 'Materials', amount: 3500, description: 'Canvas, paints, brushes' },
    { category: 'Equipment', amount: 2000, description: 'Lighting and display' },
    { category: 'Marketing', amount: 1500, description: 'Promotion and outreach' },
    { category: 'Venue', amount: 5000, description: 'Exhibition space rental' },
    { category: 'Contingency', amount: 3000, description: 'Unexpected expenses' },
  ];

  const recentSupporters = [
    { name: 'Anonymous', amount: 500, message: 'Love this project! Can\'t wait to see the final result.' },
    { name: 'Art Lover', amount: 250, message: 'Supporting emerging artists is so important.' },
    { name: 'Creative Fund', amount: 1000, message: '' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          <img src={project.coverImage} alt={project.title} className="w-full h-64 object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4">
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Avatar user={project.creator} size="sm" showType />
                <span className="text-gray-600">by @{project.creator.username}</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
              Support Project
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {['overview', 'funding', 'gallery', 'timeline'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About this project</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-semibold capitalize">{project.projectType}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="font-semibold capitalize">{project.budgetType.replace('-', ' ')}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Photos</div>
                  <div className="font-semibold">{project.photos}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500">Milestones</div>
                  <div className="font-semibold">{project.calendarEntries}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Project Progress</h3>
                <ProgressBar percentage={project.progress} color="purple" size="lg" />
              </div>

              <div className="flex flex-wrap gap-2">
                {project.manifestations.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">{tag}</span>
                ))}
              </div>

              {project.collaborators.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Collaborators</h3>
                  <div className="flex gap-3">
                    {project.collaborators.map(collab => (
                      <div key={collab.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <Avatar user={collab} size="sm" showType />
                        <div>
                          <div className="font-medium text-sm">{collab.name}</div>
                          <div className="text-xs text-gray-500">@{collab.username}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'funding' && project.funding && (
            <div className="space-y-6">
              {/* Funding Progress */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">${project.funding.raised.toLocaleString()}</div>
                    <div className="text-gray-600">raised of ${project.funding.goal.toLocaleString()} goal</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{fundingPercentage}%</div>
                    <div className="text-gray-600">{project.funding.supporterCount} supporters</div>
                  </div>
                </div>
                <ProgressBar
                  percentage={fundingPercentage}
                  color={fundingPercentage >= 100 ? 'green' : 'blue'}
                  size="lg"
                  showLabel={false}
                />
              </div>

              {/* Budget Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
                <div className="space-y-3">
                  {budgetItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium">{item.category}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                      <div className="font-semibold">${item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Supporters */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recent Supporters</h3>
                <div className="space-y-3">
                  {recentSupporters.map((supporter, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{supporter.name}</span>
                          <span className="text-green-600 font-semibold">${supporter.amount}</span>
                        </div>
                        {supporter.message && (
                          <p className="text-sm text-gray-600 mt-1">{supporter.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Button */}
              <button className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Support This Project
              </button>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${1549490349 + i * 1000}-8643362247b5?w=300&h=300&fit=crop`}
                    alt={`Gallery ${i}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
              <button className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm">Add Photo</span>
              </button>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {[
                { date: 'Jan 15, 2024', title: 'Project Started', description: 'Initial concept development and planning phase begins.' },
                { date: 'Feb 1, 2024', title: 'First Prototype', description: 'Completed the first generative art algorithm prototype.' },
                { date: 'Mar 10, 2024', title: 'Funding Goal 50%', description: 'Reached 50% of our funding goal!' },
                { date: 'Apr 5, 2024', title: 'Collection Preview', description: 'Released preview of 3 pieces from the collection.' },
                { date: 'May 15, 2024', title: 'Exhibition Confirmed', description: 'Secured venue for the final exhibition.' },
              ].map((entry, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    {i < 4 && <div className="w-0.5 h-full bg-gray-200" />}
                  </div>
                  <div className="pb-6">
                    <div className="text-sm text-gray-500">{entry.date}</div>
                    <div className="font-semibold text-gray-900">{entry.title}</div>
                    <div className="text-gray-600 text-sm">{entry.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Feed Page
const FeedPage = () => {
  const [postType, setPostType] = useState('image');
  const [newPost, setNewPost] = useState('');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar user={mockUsers.currentUser} />
          <div className="flex gap-2">
            <button
              onClick={() => setPostType('image')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${postType === 'image' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Image className="w-4 h-4" /> Image
            </button>
            <button
              onClick={() => setPostType('verbal')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${postType === 'verbal' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Type className="w-4 h-4" /> Verbalise
            </button>
          </div>
        </div>

        {postType === 'image' ? (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Click to upload or drag and drop</p>
            </div>
            <textarea
              placeholder="Add a caption..."
              className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
              rows={2}
            />
          </div>
        ) : (
          <div>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind? Verbalise it..."
              className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
              rows={3}
              maxLength={280}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{newPost.length}/280</span>
            </div>
          </div>
        )}

        <button className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
          Post
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {mockPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

// Projects Page
const ProjectsPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredProjects = filter === 'all'
    ? mockProjects
    : mockProjects.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Discover and support art projects</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'ongoing', 'in_development', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All Projects' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

// Messages Page
const MessagesPage = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Message List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {mockMessages.map(msg => (
            <div
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedMessage?.id === msg.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar user={msg.sender} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className={`font-medium ${msg.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                      {msg.sender.name}
                    </span>
                    <span className="text-xs text-gray-500">{msg.createdAt}</span>
                  </div>
                  <div className={`text-sm ${msg.unread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {msg.subject}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{msg.preview}</div>
                </div>
                {msg.unread && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail */}
      <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar user={selectedMessage.sender} />
                <div>
                  <div className="font-semibold text-gray-900">{selectedMessage.sender.name}</div>
                  <div className="text-sm text-gray-500">{selectedMessage.subject}</div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-gray-100 rounded-2xl p-4 max-w-[80%]">
                <p className="text-gray-800">{selectedMessage.preview} This is a placeholder for the full message content. In the real app, this would show the complete message with proper formatting and any attachments.</p>
                <div className="text-xs text-gray-500 mt-2">{selectedMessage.createdAt}</div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a message to read
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  const user = mockUsers.currentUser;
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-400 to-blue-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
            <Avatar user={user} size="xl" showType />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">@{user.username} · <span className="capitalize">{user.userType}</span></p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          <p className="mt-4 text-gray-700">{user.bio}</p>

          <div className="flex gap-6 mt-4">
            <div><span className="font-semibold">{user.postCount}</span> <span className="text-gray-500">posts</span></div>
            <div><span className="font-semibold">{user.followerCount.toLocaleString()}</span> <span className="text-gray-500">followers</span></div>
            <div><span className="font-semibold">{user.followingCount}</span> <span className="text-gray-500">following</span></div>
            <div><span className="font-semibold">{user.projectCount}</span> <span className="text-gray-500">projects</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200">
        {['posts', 'projects'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-4">
          {mockPosts.filter(p => p.user.id === user.id).map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {mockProjects.filter(p => p.creator.id === user.id).map(project => (
            <ProjectCard key={project.id} project={project} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function MidArtPrototype() {
  const [currentPage, setCurrentPage] = useState('feed');
  const unreadMessages = mockMessages.filter(m => m.unread).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        unreadCount={unreadMessages}
      />

      <main className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto">
        {currentPage === 'feed' && <FeedPage />}
        {currentPage === 'projects' && <ProjectsPage />}
        {currentPage === 'messages' && <MessagesPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
}
