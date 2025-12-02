export interface UserPet {
  id: string;
  user_id: string;
  name: string;
  pet_type: string;
  level: number;
  experience: number;
  total_sessions_attended: number;
  created_at: string;
  updated_at: string;
}

export interface PetExperienceLog {
  id: string;
  user_pet_id: string;
  session_id?: string;
  experience_gained: number;
  reason: 'registration' | 'attendance' | 'interaction';
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description?: string;
  badge_color?: string;
  unlocked_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_session_date?: string;
  updated_at: string;
}

export interface UserProgress {
  pet: UserPet;
  achievements: UserAchievement[];
  streak: UserStreak;
  totalSessions: number;
  totalXP: number;
}

export interface ProgressSummary {
  pet: UserPet;
  achievements: UserAchievement[];
  streak: UserStreak;
  summary: {
    totalSessions: number;
    totalXP: number;
    currentLevel: number;
    nextLevelXP: number;
    progressToNextLevel: number;
  };
}

// XP Configuration
export const XP_REWARDS = {
  SESSION_REGISTRATION: 10,
  SESSION_ATTENDANCE: 50,
  DAILY_INTERACTION: 5,
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700,
} as const;

export const calculateLevelFromXP = (xp: number): number => {
  for (let level = 10; level >= 1; level--) {
    if (xp >= LEVEL_THRESHOLDS[level as keyof typeof LEVEL_THRESHOLDS]) {
      return level;
    }
  }
  return 1;
};

export const getXPToNextLevel = (
  currentXP: number,
  currentLevel: number
): number => {
  const nextLevel = (currentLevel + 1) as keyof typeof LEVEL_THRESHOLDS;
  if (!LEVEL_THRESHOLDS[nextLevel]) {
    return 0; // Max level reached
  }
  return LEVEL_THRESHOLDS[nextLevel] - currentXP;
};

export const getProgressToNextLevel = (
  currentXP: number,
  currentLevel: number
): number => {
  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS];
  const nextLevel = (currentLevel + 1) as keyof typeof LEVEL_THRESHOLDS;
  const nextLevelThreshold = LEVEL_THRESHOLDS[nextLevel];

  if (!nextLevelThreshold) {
    return 100; // Max level, show full bar
  }

  const progress =
    ((currentXP - currentLevelThreshold) /
      (nextLevelThreshold - currentLevelThreshold)) *
    100;
  return Math.min(100, Math.max(0, progress));
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = {
  FIRST_SESSION: {
    type: 'first_session',
    title: '🎓 First Steps',
    description: 'Registered for your first PD session',
    badge_color: '#3b82f6',
  },
  FIVE_SESSIONS: {
    type: 'five_sessions',
    title: 'Learner',
    description: 'Registered for 5 PD sessions',
    badge_color: '#8b5cf6',
  },
  TEN_SESSIONS: {
    type: 'ten_sessions',
    title: 'Scholar',
    description: 'Registered for 10 PD sessions',
    badge_color: '#ec4899',
  },
  LEVEL_5: {
    type: 'level_5',
    title: 'Rising Star',
    description: 'Reached level 5',
    badge_color: '#f59e0b',
  },
  LEVEL_10: {
    type: 'level_10',
    title: 'Master',
    description: 'Reached level 10',
    badge_color: '#fbbf24',
  },
  WEEKLY_STREAK: {
    type: 'weekly_streak',
    title: 'On Fire',
    description: 'Maintained a 7-day attendance streak',
    badge_color: '#ef4444',
  },
  PERFECT_ATTENDANCE: {
    type: 'perfect_attendance',
    title: '⚡ Perfect',
    description: 'Attended all offered sessions in a month',
    badge_color: '#10b981',
  },
} as const;
