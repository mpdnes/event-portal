import { useEffect, useState } from 'react';
import { registrationService } from '../../services/sessionService';
import { Registration } from '../../types';
import { CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, isPast, isFuture } from 'date-fns';
import toast from 'react-hot-toast';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await registrationService.getMyRegistrations();
      setRegistrations(data);
    } catch (error: any) {
      toast.error('Failed to load registrations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      await registrationService.cancel(sessionId);
      toast.success('Registration cancelled');
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel');
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    if (!reg.session) return false;
    const sessionDate = new Date(reg.session.session_date);

    if (filter === 'upcoming') return isFuture(sessionDate);
    if (filter === 'past') return isPast(sessionDate);
    return true;
  });

  // Group by status
  const upcomingCount = registrations.filter(
    (r) => r.session && isFuture(new Date(r.session.session_date))
  ).length;
  const pastCount = registrations.filter(
    (r) => r.session && isPast(new Date(r.session.session_date))
  ).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Registrations</h1>
        <p className="text-gray-600">
          View and manage your professional development registrations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-600 text-sm">Total Registered</p>
          <p className="text-3xl font-bold text-primary-600">{registrations.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Upcoming</p>
          <p className="text-3xl font-bold text-green-600">{upcomingCount}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-gray-600">{pastCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({registrations.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'past'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Past ({pastCount})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRegistrations.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg mb-2">No registrations found</p>
          <p className="text-gray-500 text-sm mb-4">
            {registrations.length === 0
              ? "You haven't registered for any sessions yet."
              : `No ${filter} sessions found.`}
          </p>
          {registrations.length === 0 && (
            <a href="/sessions" className="btn-primary inline-block">
              Browse Sessions
            </a>
          )}
        </div>
      )}

      {/* Registrations List */}
      {!loading && filteredRegistrations.length > 0 && (
        <div className="space-y-4">
          {filteredRegistrations.map((registration) => {
            const session = registration.session!;
            const sessionDate = new Date(session.session_date);
            const isUpcoming = isFuture(sessionDate);

            return (
              <div
                key={registration.id}
                className={`card ${isUpcoming ? 'border-l-4 border-l-primary-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Title and Tags */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {session.title}
                      </h3>
                      {session.tags && session.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {session.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="tag text-xs"
                              style={{
                                backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                                color: tag.color || '#374151',
                                borderColor: tag.color || '#d1d5db',
                                borderWidth: '1px',
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-700">
                        <CalendarIcon className="w-4 h-4 mr-2 text-primary-600" />
                        <span>{format(sessionDate, 'EEEE, MMMM d, yyyy')}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <ClockIcon className="w-4 h-4 mr-2 text-primary-600" />
                        <span>
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>

                      {session.location && (
                        <div className="flex items-center text-gray-700">
                          <MapPinIcon className="w-4 h-4 mr-2 text-primary-600" />
                          <span>{session.location}</span>
                        </div>
                      )}

                      {(session.presenter_name || session.external_presenter_name) && (
                        <div className="flex items-center text-gray-700">
                          <UserGroupIcon className="w-4 h-4 mr-2 text-primary-600" />
                          <span>
                            {session.presenter_name || session.external_presenter_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {session.description && (
                      <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    {/* Registration Info */}
                    <div className="mt-3 text-xs text-gray-500">
                      Registered on {format(new Date(registration.registered_at), 'MMM d, yyyy')}
                    </div>
                  </div>

                  {/* Actions */}
                  {isUpcoming && (
                    <button
                      onClick={() => handleCancel(session.id)}
                      className="btn-secondary flex items-center gap-2 ml-4"
                      title="Cancel Registration"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
