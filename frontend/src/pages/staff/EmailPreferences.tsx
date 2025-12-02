import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  BellIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface EmailPreferences {
  id: string;
  user_id: string;
  receive_session_reminders: boolean;
  receive_new_sessions: boolean;
  receive_feedback_requests: boolean;
  receive_admin_notifications: boolean;
}

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      const response = await axios.get(`/api/email/preferences/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreferences(response.data);
    } catch (error: any) {
      toast.error('Failed to load preferences');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof Omit<EmailPreferences, 'id' | 'user_id'>) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      await axios.put(
        `/api/email/preferences/${userId}`,
        {
          receive_session_reminders: preferences.receive_session_reminders,
          receive_new_sessions: preferences.receive_new_sessions,
          receive_feedback_requests: preferences.receive_feedback_requests,
          receive_admin_notifications: preferences.receive_admin_notifications,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Preferences saved!');
    } catch (error: any) {
      toast.error('Failed to save preferences');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <p className="text-gray-600">Failed to load preferences</p>
        </div>
      </div>
    );
  }

  const preferenceList = [
    {
      key: 'receive_session_reminders' as const,
      title: 'Session Reminders',
      description: 'Receive reminders 24 hours before sessions you\'ve registered for',
      icon: BellIcon,
    },
    {
      key: 'receive_new_sessions' as const,
      title: 'New Session Announcements',
      description: 'Be notified when new professional development sessions are published',
      icon: EnvelopeIcon,
    },
    {
      key: 'receive_feedback_requests' as const,
      title: 'Feedback & Survey Requests',
      description: 'Receive requests to provide feedback on sessions you\'ve attended',
      icon: BellIcon,
    },
    {
      key: 'receive_admin_notifications' as const,
      title: 'Administrative Notifications',
      description: 'Receive important notifications from administrators',
      icon: EnvelopeIcon,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preferences</h1>
        <p className="text-gray-600">Manage which emails you'd like to receive</p>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {preferenceList.map((pref) => {
          const Icon = pref.icon;
          const isEnabled = preferences[pref.key];

          return (
            <div key={pref.key} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Icon className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pref.title}</h3>
                    <p className="text-gray-600 mt-1">{pref.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(pref.key)}
                  className={`ml-4 relative inline-flex flex-shrink-0 h-8 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ${
                    isEnabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white transform ring-0 transition ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {isEnabled ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Disabled</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> We'll always send you important notifications about sessions you've registered for, regardless of these settings.
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        <button
          onClick={fetchPreferences}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
