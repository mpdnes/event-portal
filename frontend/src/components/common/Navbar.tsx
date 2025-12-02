import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeftOnRectangleIcon, UserIcon, CalendarIcon, HomeIcon, Cog6ToothIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-all duration-300 border-b border-gray-200 ${
      isScrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-300">
            <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">
              PD Portal
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
              title="Dashboard"
            >
              <HomeIcon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>

            <Link
              to="/sessions"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
              title="Browse Sessions"
            >
              <CalendarIcon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Browse</span>
            </Link>

            <Link
              to="/my-registrations"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
              title="My PDs"
            >
              <UserIcon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">My PDs</span>
            </Link>

            <Link
              to="/calendar"
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-accent-600 bg-accent-50 hover:bg-accent-100 rounded-lg transition-all duration-250"
              title="Calendar"
            >
              <CalendarIcon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Calendar</span>
            </Link>

            <Link
              to="/email-preferences"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
              title="Email Preferences"
            >
              <EnvelopeIcon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline">Preferences</span>
            </Link>

            {(isAdmin || isManager) && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-250"
                title="Admin"
              >
                <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {/* Divider */}
            <div className="hidden md:block h-6 w-px bg-gray-200 mx-2" />

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm text-gray-600 font-medium">
                {user?.first_name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-250"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
