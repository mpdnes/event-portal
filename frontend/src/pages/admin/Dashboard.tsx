import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { sessionService } from '../../services/sessionService';
import { AdminStats } from '../../types';
import { ChartBarIcon as BarChart3, UserGroupIcon as Users, ExclamationCircleIcon as AlertCircle, ArrowTrendingUpIcon as TrendingUp, CalendarIcon as Calendar, UserCircleIcon as UserCog, DocumentTextIcon as FileText, CheckCircleIcon, ClipboardDocumentCheckIcon as Survey, EnvelopeIcon as Email } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/common/Sidebar';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await sessionService.getAdminStats();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className={`flex-1 pt-16 transition-all duration-300 overflow-y-auto min-h-screen bg-gray-50 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="px-8 py-12 mr-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 text-lg">
            Professional Development Management Dashboard
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-elevated bg-gradient-to-br from-white to-primary-50 border border-primary-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Published Sessions</p>
                </div>
                <p className="text-4xl font-bold text-primary-700">
                  {stats?.published_sessions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card-elevated bg-gradient-to-br from-white to-success-50 border border-success-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-success-600" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Participants</p>
                </div>
                <p className="text-4xl font-bold text-success-700">
                  {stats?.total_participants || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card-elevated bg-gradient-to-br from-white to-accent-50 border border-accent-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-accent-600" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Avg Rating</p>
                </div>
                <p className="text-4xl font-bold text-accent-700">
                  {stats?.average_rating ? parseFloat(stats.average_rating.toFixed(1)) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card-elevated bg-gradient-to-br from-white to-red-50 border border-red-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Needs Attention</p>
                </div>
                <p className="text-4xl font-bold text-red-700">
                  {stats?.low_signup_sessions?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Alerts Section */}
        {stats && stats.low_signup_sessions && stats.low_signup_sessions.length > 0 && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <button
              onClick={() => setShowAlerts(true)}
              className="w-full flex items-center justify-between hover:bg-yellow-100 transition-colors rounded py-2 px-2"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {stats.low_signup_sessions.length} session{stats.low_signup_sessions.length !== 1 ? 's' : ''} need attention
                  </p>
                  <p className="text-xs text-gray-600">Low signup counts - click to view and manage</p>
                </div>
              </div>
              <div className="text-yellow-600 font-medium text-sm flex-shrink-0">
                View →
              </div>
            </button>
          </div>
        )}

        {stats && (!stats.low_signup_sessions || stats.low_signup_sessions.length === 0) && (
          <div className="mb-8 bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-success-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">All Systems Go!</p>
                <p className="text-xs text-gray-600">All sessions have healthy signup numbers</p>
              </div>
            </div>
          </div>
        )}

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Link to="/admin/sessions" className="card-interactive group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Sessions</h3>
              <p className="text-sm text-gray-600">Create & manage PD sessions</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/users" className="card-interactive group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 rounded-lg group-hover:bg-success-200 transition-colors">
              <Users className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Users</h3>
              <p className="text-sm text-gray-600">Manage user accounts</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/tags" className="card-interactive group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-100 rounded-lg group-hover:bg-accent-200 transition-colors">
              <FileText className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Tags</h3>
              <p className="text-sm text-gray-600">Manage session tags</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/presenters" className="card-interactive group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <UserCog className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Presenters</h3>
              <p className="text-sm text-gray-600">Manage presenters</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/emails" className="card-interactive group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Email className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Email Management</h3>
              <p className="text-sm text-gray-600">Send & track emails</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/sessions" className="card-interactive group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Survey className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Surveys</h3>
              <p className="text-sm text-gray-600">Manage session surveys</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Session Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                <span className="text-gray-700 font-medium">Published</span>
              </div>
              <span className="text-lg font-bold text-primary-600">{stats?.published_sessions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span className="text-gray-700 font-medium">Drafts</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats?.draft_sessions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success-600"></div>
                <span className="text-gray-700 font-medium">Completed</span>
              </div>
              <span className="text-lg font-bold text-success-600">{stats?.completed_sessions || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <p className="text-gray-600 text-sm">
            Activity tracking coming soon. This will show recent registrations, session creations, and participant feedback.
          </p>
        </div>
      </div>

      {/* Alerts Modal */}
      {showAlerts && stats?.low_signup_sessions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card w-full max-w-2xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Sessions Needing Attention
              </h3>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {stats.low_signup_sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{session.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(session.session_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-yellow-700 font-medium mt-2">
                        {session.signup_count} signup{session.signup_count !== 1 ? 's' : ''} (low for capacity)
                      </p>
                    </div>
                    <Link
                      to={`/admin/sessions`}
                      className="btn-tertiary text-sm py-2 px-3 whitespace-nowrap ml-4"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAlerts(false)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
