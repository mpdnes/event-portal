import { PDSession } from '../../types';
import { CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { registrationService } from '../../services/sessionService';
import { useState } from 'react';

interface SessionCardProps {
  session: PDSession;
  onRegister?: () => void;
  showActions?: boolean;
}

export default function SessionCard({ session, onRegister, showActions = true }: SessionCardProps) {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(session.user_registered);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registrationService.register(session.id);
      setRegistered(true);
      toast.success('Successfully registered! 🎉');
      onRegister?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await registrationService.cancel(session.id);
      setRegistered(false);
      toast.success('Registration cancelled');
      onRegister?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  const isFull = session.capacity && session.registration_count && session.registration_count >= session.capacity;
  const spotsLeft = session.capacity && session.registration_count
    ? session.capacity - session.registration_count
    : null;

  return (
    <div className="card hover:shadow-xl transition-all">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{session.title}</h3>

        {/* Tags */}
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {session.tags.map((tag) => (
              <span
                key={tag.id}
                className="tag text-sm"
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

      {/* Description */}
      {session.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{session.description}</p>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center text-gray-700">
          <CalendarIcon className="w-4 h-4 mr-2 text-primary-600" />
          <span>{format(new Date(session.session_date), 'EEEE, MMMM d, yyyy')}</span>
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

        {session.presenter_name && (
          <div className="flex items-center text-gray-700">
            <UserGroupIcon className="w-4 h-4 mr-2 text-primary-600" />
            <span>Presented by {session.presenter_name}</span>
          </div>
        )}

        {session.external_presenter_name && (
          <div className="flex items-center text-gray-700">
            <UserGroupIcon className="w-4 h-4 mr-2 text-primary-600" />
            <span>Presented by {session.external_presenter_name}</span>
          </div>
        )}
      </div>

      {/* Capacity Info */}
      {session.capacity && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">
              {session.registration_count || 0} / {session.capacity} registered
            </span>
            {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5 && (
              <span className="text-orange-600 font-medium">{spotsLeft} spots left!</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isFull ? 'bg-red-500' : 'bg-primary-500'
              }`}
              style={{
                width: `${Math.min(
                  ((session.registration_count || 0) / session.capacity) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div>
          {registered ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center text-green-600 font-medium text-sm">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                You're registered!
              </div>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="btn-secondary text-sm ml-auto"
              >
                Cancel
              </button>
            </div>
          ) : isFull ? (
            <button disabled className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg font-semibold cursor-not-allowed">
              Session Full
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Registering...' : 'Sign Up Now'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
