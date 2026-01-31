import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, X, Trash2, Users, ChevronLeft } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import ProjectCalendar from '../components/projects/ProjectCalendar';
import Modal from '../components/ui/Modal';
import { projectAPI, profileAPI, manifestationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, differenceInDays } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [manifestations, setManifestations] = useState([]);

  // Photo upload
  const [uploading, setUploading] = useState(false);

  // Collaborator modal
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Status update
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const isOwner = user?.username === project?.creator?.username;
  const isCollaborator = project?.collaborators?.some((c) => c.username === user?.username);
  const canEdit = isOwner || isCollaborator;

  useEffect(() => {
    fetchProject();
    fetchManifestations();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getById(id);
      setProject(response.data);
      setNewStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManifestations = async () => {
    try {
      const response = await manifestationAPI.list();
      setManifestations(response.data || []);
    } catch (error) {
      console.error('Error fetching manifestations:', error);
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!project?.start_date || !project?.end_date) return null;
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const today = new Date();
    const totalDays = differenceInDays(end, start);
    if (totalDays <= 0) return 100;
    const elapsedDays = differenceInDays(today, start);
    const ratio = elapsedDays / totalDays;
    return Math.min(100, Math.max(0, Math.round(ratio * 100)));
  };

  const progressPercent = calculateProgress();

  // Build markers from calendar entries
  const buildMarkers = () => {
    if (!project?.start_date || !project?.end_date || !project?.calendar_entries) return [];
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const totalDays = differenceInDays(end, start);
    if (totalDays <= 0) return [];

    return project.calendar_entries
      .filter((e) => e.content)
      .map((e) => {
        const entryDate = new Date(e.date);
        const offsetDays = differenceInDays(entryDate, start);
        const pos = (offsetDays / totalDays) * 100;
        return {
          pos: Math.min(100, Math.max(0, pos)),
          date: e.date,
          label: e.content.length > 60 ? e.content.slice(0, 60) + '...' : e.content,
        };
      });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await projectAPI.uploadPhoto(id, formData);
      setProject((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), response.data],
      }));
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await projectAPI.deletePhoto(id, photoId);
      setProject((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p.id !== photoId),
      }));
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await profileAPI.search(query);
      setSearchResults(
        (response.data || []).filter(
          (u) =>
            u.username !== user?.username &&
            !project?.collaborators?.some((c) => c.username === u.username)
        )
      );
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleAddCollaborator = async (username) => {
    try {
      await projectAPI.addCollaborator(id, username);
      await fetchProject();
      setCollaboratorSearch('');
      setSearchResults([]);
      setShowCollabModal(false);
    } catch (error) {
      console.error('Error adding collaborator:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await projectAPI.update(id, { status: newStatus });
      setProject((prev) => ({ ...prev, status: newStatus }));
      setEditingStatus(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleToggleManifestation = async (manifestationId) => {
    const hasManifestation = project.manifestations?.some((m) => m.id === manifestationId);
    try {
      if (hasManifestation) {
        await projectAPI.removeManifestation(id, manifestationId);
        setProject((prev) => ({
          ...prev,
          manifestations: prev.manifestations.filter((m) => m.id !== manifestationId),
        }));
      } else {
        await projectAPI.addManifestation(id, manifestationId);
        const manifestation = manifestations.find((m) => m.id === manifestationId);
        setProject((prev) => ({
          ...prev,
          manifestations: [...(prev.manifestations || []), manifestation],
        }));
      }
    } catch (error) {
      console.error('Error toggling manifestation:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    try {
      await projectAPI.delete(id);
      navigate(`/profile/${user.username}`);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const statusOptions = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'development', label: 'In Development' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-6">
        <div className="max-w-3xl mx-auto px-6 animate-pulse">
          <div className="h-48 bg-gray-100 rounded-xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-full mb-2" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white pt-6">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-gray-500">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover photo */}
      {project.cover_photo && (
        <div className="w-full h-48 md:h-64 relative">
          <img
            src={project.cover_photo}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          to={`/profile/${project.creator?.username}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to profile
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-medium text-gray-900 mb-2">{project.title}</h1>
              <Link
                to={`/profile/${project.creator?.username}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <Avatar
                  src={project.creator?.profile?.profile_image}
                  name={project.creator?.username}
                  size="xs"
                />
                <span>by {project.creator?.username}</span>
              </Link>
            </div>
            {isOwner && (
              <button
                onClick={handleDeleteProject}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-4">{project.description}</p>

          {/* Status */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500">Status:</span>
            {editingStatus && isOwner ? (
              <div className="flex items-center gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-200 rounded bg-white"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button size="sm" onClick={handleUpdateStatus}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingStatus(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded capitalize">
                  {project.status?.replace('_', ' ')}
                </span>
                {isOwner && (
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Manifestations */}
          {project.manifestations?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.manifestations.map((m) => (
                <span
                  key={m.id}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {m.name}
                </span>
              ))}
            </div>
          )}

          {/* Collaborators */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            {project.collaborators?.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {project.collaborators.map((c) => (
                    <Link key={c.id} to={`/profile/${c.username}`}>
                      <Avatar
                        src={c.profile?.profile_image}
                        name={c.username}
                        size="xs"
                        className="border-2 border-white"
                      />
                    </Link>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {project.collaborators.length} collaborator
                  {project.collaborators.length > 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">No collaborators</span>
            )}
            {isOwner && (
              <button
                onClick={() => setShowCollabModal(true)}
                className="text-xs text-blue-500 hover:text-blue-600 ml-2"
              >
                + Add
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 mb-6">
          <div className="flex gap-6">
            {['overview', 'calendar', 'photos', ...(isOwner ? ['settings'] : [])].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Project Progress</h3>
              {progressPercent !== null ? (
                <>
                  <ProgressBar progress={progressPercent} markers={buildMarkers()} />
                  <div className="flex justify-between mt-3 text-xs text-gray-500">
                    <span>
                      Start: {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : '—'}
                    </span>
                    <span>
                      End: {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : '—'}
                    </span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-2xl font-light text-gray-900">{progressPercent}%</span>
                    <span className="text-sm text-gray-500 ml-2">complete</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  Set start and end dates to see progress
                </p>
              )}
            </div>

            {/* Project info */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Project Details</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Type:</span>{' '}
                  <span className="capitalize">{project.project_type}</span>
                </p>
                <p>
                  <span className="text-gray-500">Budget:</span>{' '}
                  <span className="capitalize">{project.budget_type?.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <ProjectCalendar
            projectId={id}
            isOwner={canEdit}
            startDate={project.start_date}
            endDate={project.end_date}
          />
        )}

        {activeTab === 'photos' && (
          <div>
            {canEdit && (
              <div className="mb-6">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{uploading ? 'Uploading...' : 'Add Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {project.photos?.map((photo) => (
                <div key={photo.id} className="relative group aspect-square">
                  <img
                    src={photo.image}
                    alt={photo.caption || 'Project photo'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {canEdit && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
              {(!project.photos || project.photos.length === 0) && (
                <p className="col-span-full text-center text-gray-400 py-12">
                  No photos yet
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && isOwner && (
          <div className="space-y-6">
            {/* Manifestations */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Art Forms</h3>
              <div className="flex flex-wrap gap-2">
                {manifestations.map((m) => {
                  const isSelected = project.manifestations?.some((pm) => pm.id === m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleToggleManifestation(m.id)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        isSelected
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-red-50 rounded-xl border border-red-100 p-4">
              <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Deleting this project is permanent and cannot be undone.
              </p>
              <Button variant="danger" onClick={handleDeleteProject}>
                Delete Project
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add collaborator modal */}
      <Modal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
        title="Add Collaborator"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={collaboratorSearch}
            onChange={(e) => {
              setCollaboratorSearch(e.target.value);
              searchUsers(e.target.value);
            }}
            placeholder="Search users..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
          />
          <div className="max-h-48 overflow-y-auto">
            {searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => handleAddCollaborator(u.username)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left"
              >
                <Avatar src={u.profile?.profile_image} name={u.username} size="sm" />
                <span className="text-sm">{u.username}</span>
              </button>
            ))}
            {collaboratorSearch && searchResults.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No users found</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
