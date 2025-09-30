import Constants from 'expo-constants';

export const generateAPIUrl = (relativePath: string) => {
  const origin = Constants.experienceUrl?.replace('exp://', 'http://') || 'http://localhost:8081';

  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === 'development') {
    return origin.concat(path);
  }

  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL environment variable is not defined',
    );
  }

  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};

/**
 * Slugify function to normalize day names for image mapping
 * Converts strings like "Push Day", "Pull Workout", "Legs & Glutes" to "push", "pull", "legs"
 */
export const slugifyDayName = (dayName: string): string => {
  return dayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .split('-')[0] // Take first word only (e.g., "push-day" -> "push")
    .trim();
};

/**
 * Map day names to available dayname images
 * Available images: arms.png, back.png, chest.png, core.png, full-body.png, 
 * hypertrophy.png, legs.png, lower.png, pull.png, push.png, recovery.png, 
 * shoulders.png, uper.png
 */
export const getDayNameImage = (dayName: string): string => {
  const slugified = slugifyDayName(dayName);
  
  // Direct mapping for exact matches
  const imageMap: { [key: string]: string } = {
    'push': 'push.png',
    'pull': 'pull.png',
    'legs': 'legs.png',
    'arms': 'arms.png',
    'back': 'back.png',
    'chest': 'chest.png',
    'core': 'core.png',
    'abs': 'core.png', // Map abs to core
    'shoulders': 'shoulders.png',
    'lower': 'lower.png',
    'upper': 'uper.png', // Note: the file is named "uper.png" not "upper.png"
    'hypertrophy': 'hypertrophy.png',
    'recovery': 'recovery.png',
    'rest': 'recovery.png', // Map rest to recovery
    'fullbody': 'full-body.png',
    'full': 'full-body.png', // Map "full" to full-body
  };

  // Check for direct match
  if (imageMap[slugified]) {
    return imageMap[slugified];
  }

  // Check for partial matches in the original day name
  const lowerDayName = dayName.toLowerCase();
  
  if (lowerDayName.includes('push')) return 'push.png';
  if (lowerDayName.includes('pull')) return 'pull.png';
  if (lowerDayName.includes('leg')) return 'legs.png';
  if (lowerDayName.includes('arm')) return 'arms.png';
  if (lowerDayName.includes('back')) return 'back.png';
  if (lowerDayName.includes('chest')) return 'chest.png';
  if (lowerDayName.includes('core') || lowerDayName.includes('ab')) return 'core.png';
  if (lowerDayName.includes('shoulder')) return 'shoulders.png';
  if (lowerDayName.includes('lower')) return 'lower.png';
  if (lowerDayName.includes('upper')) return 'uper.png';
  if (lowerDayName.includes('hypertrophy')) return 'hypertrophy.png';
  if (lowerDayName.includes('recovery') || lowerDayName.includes('rest')) return 'recovery.png';
  if (lowerDayName.includes('full')) return 'full-body.png';

  // Default fallback
  return 'full-body.png';
};