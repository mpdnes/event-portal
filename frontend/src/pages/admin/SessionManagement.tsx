import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionService } from '../../services/sessionService';
import { tagService } from '../../services/tagService';
import { PDSession, Tag } from '../../types';
import { getTagIcon } from '../../utils/tagIcons';
import toast from 'react-hot-toast';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function SessionManagement() {
  const [sessions, setSessions] = useState<PDSession[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [tagFormData, setTagFormData] = useState<Partial<Tag>>({
    name: '',
    color: '#3b82f6',
    description: '',
  });

  // Helper function to determine if a color is light
  const isColorLight = (hexColor: string): boolean => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  const [formData, setFormData] = useState<Partial<PDSession>>({
    title: '',
    description: '',
    location: '',
    session_date: '',
    start_time: '',
    end_time: '',
    presenter_name: '',
    capacity: 30,
    is_published: false,
    requires_password: false,
    session_password: '',
    notes: '',
  });

  useEffect(() => {
    fetchSessions();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const tags = await tagService.getAll();
      setAllTags(tags);
    } catch (error) {
      toast.error('Failed to load tags');
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getAllSessions();
      setSessions(data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        tags: selectedTags.map(id => ({ id }))
      };
      if (editingId) {
        await sessionService.updateSession(editingId, dataToSubmit);
        toast.success('Session updated successfully');
      } else {
        await sessionService.createSession(dataToSubmit);
        toast.success('Session created successfully');
      }
      resetForm();
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save session');
    }
  };

  const handleEdit = (session: PDSession) => {
    setFormData(session);
    setEditingId(session.id);
    setSelectedTags(session.tags?.map(t => t.id) || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await sessionService.deleteSession(id);
        toast.success('Session deleted');
        fetchSessions();
      } catch (error: any) {
        toast.error('Failed to delete session');
      }
    }
  };

  const handleTogglePublish = async (session: PDSession) => {
    try {
      await sessionService.updateSession(session.id, {
        is_published: !session.is_published,
      });
      toast.success(`Session ${!session.is_published ? 'published' : 'unpublished'}`);
      fetchSessions();
    } catch (error: any) {
      toast.error('Failed to update session');
    }
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await tagService.update(editingTag.id, tagFormData);
        toast.success('Tag updated successfully');
      } else {
        await tagService.create(tagFormData);
        toast.success('Tag created successfully');
      }
      resetTagForm();
      fetchTags();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save tag');
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagFormData(tag);
  };

  const handleDeleteTag = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await tagService.delete(id);
        toast.success('Tag deleted');
        fetchTags();
      } catch (error: any) {
        toast.error('Failed to delete tag');
      }
    }
  };

  const resetTagForm = () => {
    setTagFormData({
      name: '',
      color: '#3b82f6',
      description: '',
    });
    setEditingTag(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      session_date: '',
      start_time: '',
      end_time: '',
      presenter_name: '',
      capacity: 30,
      is_published: false,
      requires_password: false,
      session_password: '',
      notes: '',
    });
    setSelectedTags([]);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && session.is_published) ||
      (filterStatus === 'draft' && !session.is_published);
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      session.title.toLowerCase().includes(searchLower) ||
      session.description?.toLowerCase().includes(searchLower) ||
      session.presenter_name?.toLowerCase().includes(searchLower) ||
      session.location?.toLowerCase().includes(searchLower);
    
    const matchesTags = tagFilters.length === 0 || 
      session.tags?.some(tag => tagFilters.includes(tag.id));

    return matchesStatus && matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Session Management</h1>
              <p className="text-gray-600 mt-2">Create, edit, and manage PD sessions</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              New Session
            </button>
          </div>

          {/* Filter Tabs and Search */}
          <div className="space-y-4">
            {/* Status Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              {['all', 'published', 'draft'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-3 font-medium transition-colors ${
                    filterStatus === status
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-2 text-sm text-gray-500">
                    ({
                      status === 'all'
                        ? sessions.length
                        : status === 'published'
                        ? sessions.filter(s => s.is_published).length
                        : sessions.filter(s => !s.is_published).length
                    })
                  </span>
                </button>
              ))}
            </div>

            {/* Search and Tag Filters */}
            <div className="card space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, presenter, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-10"
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                      const isSelected = tagFilters.includes(tag.id);
                      const textColor = isColorLight(tag.color) ? '#000000' : '#ffffff';
                      return (
                        <button
                          key={tag.id}
                          onClick={() => {
                            setTagFilters(prev =>
                              prev.includes(tag.id)
                                ? prev.filter(id => id !== tag.id)
                                : [...prev, tag.id]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isSelected ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: tag.color,
                            color: textColor,
                            boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${tag.color}` : 'none'
                          }}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing <strong>{filteredSessions.length}</strong> of <strong>{sessions.length}</strong> sessions
                </span>
                {(searchTerm || filterStatus !== 'all' || tagFilters.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setTagFilters([]);
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="mb-8 card border-l-4 border-primary-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Session' : 'Create New Session'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Advanced React Patterns"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                    placeholder="Describe what this session covers..."
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.session_date || ''}
                    onChange={e => setFormData({ ...formData, session_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time || ''}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time || ''}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Room 101"
                  />
                </div>

                {/* Presenter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Presenter Name
                  </label>
                  <input
                    type="text"
                    value={formData.presenter_name || ''}
                    onChange={e => setFormData({ ...formData, presenter_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., John Doe"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity || 30}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                {/* Publish Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.is_published ? 'published' : 'draft'}
                    onChange={e => setFormData({ ...formData, is_published: e.target.value === 'published' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Requires Password */}
                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requires_password || false}
                      onChange={e => setFormData({ ...formData, requires_password: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Requires Password</span>
                  </label>
                </div>

                {/* Session Password */}
                {formData.requires_password && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Session Password
                    </label>
                    <input
                      type="text"
                      value={formData.session_password || ''}
                      onChange={e => setFormData({ ...formData, session_password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
                    placeholder="Internal notes..."
                  />
                </div>

                {/* Tag Management */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Tags
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTagManager(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Manage Tags
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => {
                      const TagIcon = getTagIcon(tag.name);
                      const isSelected = selectedTags.includes(tag.id);
                      const textColor = isColorLight(tag.color) ? '#000000' : '#ffffff';
                      
                      return (
                        <button
                          key={tag.id}
                          onClick={() => {
                            setSelectedTags(prev =>
                              prev.includes(tag.id)
                                ? prev.filter(id => id !== tag.id)
                                : [...prev, tag.id]
                            );
                          }}
                          type="button"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium ${
                            isSelected
                              ? 'ring-2 ring-offset-2 shadow-md scale-105'
                              : 'border-2 border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: tag.color,
                            color: textColor,
                            borderColor: isSelected ? tag.color : '#e5e7eb',
                            boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${tag.color}` : 'none'
                          }}
                        >
                          {TagIcon && <TagIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'scale-125' : ''}`} />}
                          <span>{tag.name}</span>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 flex-shrink-0 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {editingId ? 'Update Session' : 'Create Session'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tag Manager Sidebar */}
        {showTagManager && (
          <div className="fixed right-8 top-24 w-[500px] max-h-[calc(100vh-120px)] bg-white shadow-lg border border-gray-200 rounded-lg flex flex-col overflow-hidden z-40">
            {/* Header */}
            <div className="p-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Tag Manager</h2>
                <button
                  onClick={() => {
                    setShowTagManager(false);
                    resetTagForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Form Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingTag ? 'Edit Tag' : 'Create New Tag'}
                </h3>
                <form onSubmit={handleSaveTag} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tag Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={tagFormData.name || ''}
                      onChange={e => setTagFormData({ ...tagFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="e.g., Workshop"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={tagFormData.color || '#3b82f6'}
                        onChange={e => setTagFormData({ ...tagFormData, color: e.target.value })}
                        className="w-12 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <span className="text-sm text-gray-600 font-mono">{tagFormData.color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={tagFormData.description || ''}
                      onChange={e => setTagFormData({ ...tagFormData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-16 text-sm"
                      placeholder="Optional description..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
                    >
                      {editingTag ? 'Update' : 'Create'}
                    </button>
                    {editingTag && (
                      <button
                        type="button"
                        onClick={() => resetTagForm()}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Tags List */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  All Tags ({allTags.length})
                </h3>
                <div className="space-y-2">
                  {allTags.length === 0 ? (
                    <p className="text-gray-600 text-center py-8 text-sm">No tags yet. Create one!</p>
                  ) : (
                    allTags.map(tag => {
                      const TagIcon = getTagIcon(tag.name);
                      const textColor = isColorLight(tag.color) ? '#000000' : '#ffffff';
                      
                      return (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tag.color }}
                            >
                              {TagIcon && (
                                <TagIcon 
                                  className="w-3.5 h-3.5" 
                                  style={{ color: textColor }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">{tag.name}</p>
                              {tag.description && (
                                <p className="text-xs text-gray-600 truncate">{tag.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditTag(tag)}
                              className="p-1.5 hover:bg-blue-100 rounded transition-colors text-blue-600"
                              title="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              className="p-1.5 hover:bg-red-100 rounded transition-colors text-red-600"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Loading sessions...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' ? 'No sessions yet.' : `No ${filterStatus} sessions.`}
              </p>
              {filterStatus === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create First Session
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Presenter</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSessions.map(session => (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{session.title}</p>
                          {session.description && (
                            <p className="text-xs text-gray-600 mt-1 truncate max-w-xs">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          {new Date(session.session_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {session.start_time} - {session.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {session.location ? (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            {session.location}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {session.presenter_name ? (
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            {session.presenter_name}
                          </div>
                        ) : (
                          <span className="text-gray-400">TBD</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                          <span>{session.registration_count || 0}/{session.capacity || '∞'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {session.is_published ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              Published
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/admin/sessions/${session.id}/surveys`}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
                            title="Manage Surveys"
                          >
                            <ChartBarIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(session)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title={session.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {session.is_published ? (
                              <EyeIcon className="w-4 h-4" />
                            ) : (
                              <EyeSlashIcon className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(session)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
