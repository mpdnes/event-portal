import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, CalendarIcon, UserGroupIcon, StarIcon, SparklesIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/outline';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  highlight?: boolean;
}

interface SidebarProps {
  onSectionChange?: (section: string) => void;
  currentSection?: string;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ onSectionChange, currentSection, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const items: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      onClick: () => onSectionChange?.('dashboard'),
    },
    {
      id: 'stats',
      label: 'Quick Stats',
      icon: <CalendarIcon className="w-5 h-5" />,
      onClick: () => onSectionChange?.('stats'),
    },
    {
      id: 'upcoming',
      label: 'Upcoming Sessions',
      icon: <UserGroupIcon className="w-5 h-5" />,
      onClick: () => onSectionChange?.('upcoming'),
    },
    {
      id: 'progression',
      label: 'Progression & Pet',
      icon: <SparklesIcon className="w-5 h-5" />,
      onClick: () => onSectionChange?.('progression'),
      highlight: true,
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <TrophyIcon className="w-5 h-5" />,
      onClick: () => onSectionChange?.('achievements'),
      highlight: true,
    },
    {
      id: 'streaks',
      label: 'Streaks',
      icon: <FireIcon className="w-5 h-5" />,
      onClick: () => onSectionChange?.('streaks'),
      highlight: true,
    },
    {
      id: 'featured',
      label: 'Featured PD',
      icon: <StarIcon className="w-5 h-5" />,
      onClick: () => onSectionChange?.('featured'),
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40 shadow-sm ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <button
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-6 bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-1.5 transition-all duration-300 shadow-sm"
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <nav className="pt-2 px-2 space-y-1 overflow-y-auto h-full pb-20">
        {items.map((item) => {
          const isActive = currentSection === item.id;
          const isLink = !!item.href;

          const baseClasses = `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
            isActive
              ? 'bg-primary-100 text-primary-700'
              : item.highlight
                ? 'text-gray-700 hover:bg-accent-50 hover:text-accent-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`;

          const buttonClasses = `${baseClasses} text-left cursor-pointer`;

          return (
            <div key={item.id}>
              {isLink ? (
                <Link to={item.href!} className={baseClasses} title={item.label}>
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className={buttonClasses}
                  title={item.label}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Click items to navigate
          </p>
        </div>
      )}
    </aside>
  );
}
