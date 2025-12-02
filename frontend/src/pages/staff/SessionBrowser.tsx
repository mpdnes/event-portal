import { useEffect, useState } from 'react';
import { sessionService } from '../../services/sessionService';
import { PDSession } from '../../types';
import SessionCard from '../../components/sessions/SessionCard';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SessionBrowser() {
  const [sessions, setSessions] = useState<PDSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionService.getAllSessions({
        tag: selectedTag || undefined,
      });
      setSessions(data);
    } catch (error: any) {
      toast.error('Failed to load sessions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedTag]);

  // Client-side search filter
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchTerm === '' ||
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get unique tags from all sessions
  const allTags = sessions.reduce((tags, session) => {
    session.tags?.forEach((tag) => {
      if (!tags.find((t) => t.id === tag.id)) {
        tags.push(tag);
      }
    });
    return tags;
  }, [] as any[]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse PD Sessions</h1>
        <p className="text-gray-600">
          Discover and register for professional development opportunities
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="input pl-10"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag.id} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedTag) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="tag bg-primary-100 text-primary-700 border-primary-300">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-primary-900 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            )}
            {selectedTag && (
              <span className="tag bg-primary-100 text-primary-700 border-primary-300">
                Tag: {selectedTag}
                <button
                  onClick={() => setSelectedTag('')}
                  className="ml-2 text-primary-900 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSessions.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg mb-2">No sessions found</p>
          <p className="text-gray-500 text-sm">
            {sessions.length === 0
              ? 'Check back soon for new professional development opportunities!'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      )}

      {/* Session Grid */}
      {!loading && filteredSessions.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRegister={fetchSessions}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
