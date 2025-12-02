import { useAuth } from '../../contexts/AuthContext';
import { CalendarIcon, UserGroupIcon, StarIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import ProgressionDashboard from '../../components/common/ProgressionDashboard';
import Sidebar from '../../components/common/Sidebar';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        onSectionChange={setCurrentSection} 
        currentSection={currentSection}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className={`flex-1 pt-16 transition-all duration-300 overflow-y-auto min-h-screen bg-gray-50 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <div className="container mx-auto px-6 py-8">
          {/* Welcome Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Here's your Professional Development dashboard
            </p>
          </div>

          {/* Quick Stats Section */}
          {(currentSection === 'dashboard' || currentSection === 'stats') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card-elevated bg-gradient-to-br from-white to-primary-50 border border-primary-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarIcon className="w-5 h-5 text-primary-600" />
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Registered Sessions</p>
                    </div>
                    <p className="text-4xl font-bold text-primary-700">0</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated bg-gradient-to-br from-white to-success-50 border border-success-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircleIcon className="w-5 h-5 text-success-600" />
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                    </div>
                    <p className="text-4xl font-bold text-success-700">0</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated bg-gradient-to-br from-white to-accent-50 border border-accent-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <UserGroupIcon className="w-5 h-5 text-accent-600" />
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Available</p>
                    </div>
                    <p className="text-4xl font-bold text-accent-700">0</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Sessions Section */}
          {(currentSection === 'dashboard' || currentSection === 'upcoming') && (
            <div className="card mb-8">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Your Upcoming Sessions
                </h2>
              </div>
              <div className="p-12 text-center">
                <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  No upcoming sessions yet
                </p>
                <p className="text-sm text-gray-500">
                  Browse available sessions to register!
                </p>
              </div>
            </div>
          )}

          {/* Progression Section */}
          {(currentSection === 'dashboard' || currentSection === 'progression' || currentSection === 'achievements' || currentSection === 'streaks') && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <SparklesIcon className="w-6 h-6 text-accent-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Progression</h2>
              </div>
              <ProgressionDashboard userId={user?.id} />
            </div>
          )}

          {/* Featured Sessions Section */}
          {(currentSection === 'dashboard' || currentSection === 'featured') && (
            <div className="card mb-8">
              <div className="flex items-center gap-2 mb-6">
                <StarIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Featured Professional Development
                </h2>
              </div>
              <div className="p-12 text-center">
                <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  Check back soon for featured sessions!
                </p>
              </div>
            </div>
          )}

          {/* Development Note */}
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-900">
              <strong>✨ Ready for data!</strong> Once sessions are created, they'll appear here automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
