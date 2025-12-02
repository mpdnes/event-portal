import { useEffect, useState } from 'react';
import {
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  PlusIcon,
  PencilIcon,
} from '@heroicons/react/24/solid';
import { petService } from '../../services/petService';
import { ProgressSummary } from '../../types/progression';

interface ProgressionDashboardProps {
  userId?: string;
}

export default function ProgressionDashboard({
  userId,
}: ProgressionDashboardProps) {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newPetName, setNewPetName] = useState('');

  useEffect(() => {
    loadProgressSummary();
  }, [userId]);

  const loadProgressSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petService.getProgressSummary();
      setProgress(data);
      setNewPetName(data.pet.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load progression data';
      setError(message);
      console.error('Error loading progression:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePetName = async () => {
    if (!newPetName.trim() || newPetName === progress?.pet.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const updated = await petService.updatePetName(newPetName);
      setProgress((prev: ProgressSummary | null) =>
        prev ? { ...prev, pet: updated } : null
      );
      setIsEditingName(false);
    } catch (err) {
      console.error('Error updating pet name:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading progression data...</p>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Progression</h3>
        <p className="text-red-700 text-sm">{error || 'Failed to load progression data'}</p>
        <button
          onClick={loadProgressSummary}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { pet, achievements, streak, summary } = progress;
  const progressPercentage = summary.progressToNextLevel;

  return (
    <div className="space-y-6">
      {/* Pet Card - Under Construction */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 p-6 relative">
        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
          🚧 Coming Soon
        </div>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
              <SparklesIcon className="w-8 h-8" />
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdatePetName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    autoFocus
                    className="px-3 py-1 border border-purple-300 rounded-lg"
                  />
                  <button
                    onClick={handleUpdatePetName}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  {pet.name}
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-purple-600 hover:text-purple-800 p-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </span>
              )}
            </h2>
            <p className="text-purple-700 text-sm mt-1">Your Companion</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-white bg-opacity-60 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Level</p>
            <p className="text-3xl font-bold text-purple-600">{pet.level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Type</p>
            <p className="text-lg font-semibold text-purple-700 capitalize">{pet.pet_type}</p>
          </div>
        </div>
      </div>

      {/* XP Progress Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Experience Progress</h3>

        <div className="space-y-4">
          {/* Current XP Display */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Level {pet.level}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {summary.nextLevelXP === 0
                ? 'Max Level'
                : `${summary.nextLevelXP} XP to Level ${pet.level + 1}`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* XP Stats */}
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>{summary.totalXP} / {summary.totalXP + summary.nextLevelXP} XP</span>
            <span>{Math.round(progressPercentage)}% to next level</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sessions Card */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sessions Attended</p>
              <p className="text-3xl font-bold text-blue-600">{summary.totalSessions}</p>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-600 p-3 rounded-lg">
              <FireIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600">{streak.current_streak}</p>
              <p className="text-xs text-gray-500">
                Best: {streak.longest_streak}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-yellow-500" />
          Achievements
        </h3>

        {achievements && achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement: { id: string; title: string; description?: string; badge_color?: string; unlocked_at: string }) => (
              <div
                key={achievement.id}
                className="p-3 rounded-lg border-2"
                style={{
                  backgroundColor: `${achievement.badge_color || '#e5e7eb'}20`,
                  borderColor: achievement.badge_color || '#9ca3af',
                }}
              >
                <p className="font-semibold text-gray-900">{achievement.title}</p>
                <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No achievements yet</p>
            <p className="text-xs text-gray-400">
              Register for sessions and attend events to unlock achievements!
            </p>
          </div>
        )}
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          Coming Soon
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Visual pet avatar and customization
          </li>
          <li className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Pet interactions and daily activities
          </li>
          <li className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Pet evolution and special forms
          </li>
          <li className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Leaderboards and community features
          </li>
        </ul>
      </div>
    </div>
  );
}
