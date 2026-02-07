/**
 * Timezone Utilities for Contest System
 * 
 * All contest times are stored as UTC ISO strings in the database.
 * These utilities help:
 * 1. Convert user local time to UTC before sending to backend
 * 2. Display UTC times in user's local timezone
 * 3. Validate timezone-safe operations
 */

/**
 * Convert datetime-local input value to UTC ISO string
 * @param localDateTimeValue - Value from <input type="datetime-local">
 * @returns UTC ISO string (e.g., "2024-01-15T10:30:00.000Z")
 */
export function localDateTimeToUTC(localDateTimeValue: string): string {
  if (!localDateTimeValue) {
    throw new Error('Invalid datetime value');
  }
  
  // datetime-local gives us a string like "2024-01-15T10:30"
  // Create Date object (interprets as local time)
  const localDate = new Date(localDateTimeValue);
  
  if (isNaN(localDate.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // Convert to UTC ISO format
  return localDate.toISOString();
}

/**
 * Convert UTC ISO string to datetime-local input format
 * @param utcISOString - UTC ISO string (e.g., "2024-01-15T10:30:00.000Z")
 * @returns Local datetime string for input (e.g., "2024-01-15T16:00" for IST)
 */
export function utcToLocalDateTime(utcISOString: string): string {
  const date = new Date(utcISOString);
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid UTC timestamp');
  }
  
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Format UTC timestamp for display in user's timezone
 * @param utcISOString - UTC ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted string in user's local timezone
 */
export function formatUTCInLocalTimezone(
  utcISOString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(utcISOString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };
  
  return date.toLocaleString('en-US', defaultOptions);
}

/**
 * Format UTC timestamp for a specific timezone
 * @param utcISOString - UTC ISO string
 * @param timezone - IANA timezone (e.g., 'Asia/Kolkata', 'America/New_York')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted string in specified timezone
 */
export function formatUTCInTimezone(
  utcISOString: string,
  timezone: string = 'Asia/Kolkata',
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(utcISOString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };
  
  return date.toLocaleString('en-US', defaultOptions);
}

/**
 * Get current UTC time as ISO string
 * @returns Current UTC time (e.g., "2024-01-15T10:30:00.000Z")
 */
export function getCurrentUTC(): string {
  return new Date().toISOString();
}

/**
 * Validate that a string is a valid UTC ISO timestamp
 * @param timestamp - String to validate
 * @returns true if valid UTC ISO format
 */
export function isValidUTCTimestamp(timestamp: string): boolean {
  // Check if string matches ISO 8601 format with Z (UTC) indicator
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  
  if (!isoRegex.test(timestamp)) {
    return false;
  }
  
  // Validate it's a valid date
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Ensure the ISO string matches (prevents timezone shifts)
  return date.toISOString() === timestamp;
}

/**
 * Calculate time remaining from now to a UTC timestamp
 * @param utcISOString - UTC ISO target time
 * @returns Object with days, hours, minutes, seconds
 */
export function getTimeRemaining(utcISOString: string): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const target = new Date(utcISOString);
  const now = new Date();
  const total = target.getTime() - now.getTime();
  
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return { total, days, hours, minutes, seconds };
}

/**
 * Get user's detected timezone
 * @returns IANA timezone string (e.g., 'Asia/Kolkata')
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
