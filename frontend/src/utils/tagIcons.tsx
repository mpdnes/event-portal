import {
  ShoppingCartIcon,
  ArrowPathIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  SwatchIcon,
  UserGroupIcon,
  AcademicCapIcon,
  FilmIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

// Map tag names to Heroicon components
export const tagIconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Food Provided': ShoppingCartIcon,
  'Physical Activity': ArrowPathIcon,
  'Tour': MapPinIcon,
  'Workshop': WrenchScrewdriverIcon,
  'Wellness': SparklesIcon,
  'Technology': CpuChipIcon,
  'Cultural': GlobeAltIcon,
  'Career Development': ArrowTrendingUpIcon,
  'Creative': SwatchIcon,
  'Social': UserGroupIcon,
  'Educational': AcademicCapIcon,
  'Entertainment': FilmIcon,
  'Skill Building': BoltIcon,
};

// Fallback icon if tag name not found
export const DefaultIcon = AcademicCapIcon;

export const getTagIcon = (tagName: string) => {
  return tagIconMap[tagName] || DefaultIcon;
};
