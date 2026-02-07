// Contest Types
export type ContestStatus = 'upcoming' | 'live' | 'ended';

// Database contest type (without computed status field)
export interface StoredContest {
  id: string;
  name: string;
  description?: string;
  startTime: string; // Must be UTC ISO format
  endTime: string; // Must be UTC ISO format
  joinCode: string;
  creatorId: string;
  createdAt: string;
  participants: Participant[];
  participantLimit?: number;
  problemIds: string[];
  submissions?: ContestSubmission[];
  resultsPublished?: boolean;
}

// Public-facing contest type (with computed status)
export interface Contest extends StoredContest {
  status: ContestStatus; // Computed dynamically, never stored
}

export interface Participant {
  userId: string;
  username: string;
  joinedAt: string;
  score?: number;
  problemsSolved?: number;
  totalTestsPassed?: number;  // Total test cases passed across all problems
  totalExecutionTime?: number; // Total execution time in milliseconds
}

export interface ContestSubmission {
  id: string;
  userId: string;
  username: string;
  problemId: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  language: string;
  code: string;
  testsPassed: number;
  totalTests: number;
  submittedAt: string;
  executionTime?: number;
  points: number;
}

export interface CreateContestRequest {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  problemIds: string[];
}

export interface JoinContestRequest {
  joinCode: string;
}

export interface ContestResponse {
  success: boolean;
  message?: string;
  contest?: Contest;
  joinCode?: string;
}

// Utility Functions
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getContestStatus(startTime: string, endTime: string): ContestStatus {
  // CRITICAL: All time comparisons must be done in UTC
  // new Date() returns UTC time when comparing Date objects
  const now = new Date(); // Current UTC time
  const start = new Date(startTime); // Parse UTC ISO string
  const end = new Date(endTime); // Parse UTC ISO string

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}

export function formatDateTime(dateString: string): string {
  // Takes UTC ISO string and displays in user's local timezone
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = end.getTime() - start.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Validate that timestamp is in UTC ISO format
export function isValidUTCTimestamp(timestamp: string): boolean {
  // Check if string matches ISO 8601 format with Z (UTC) indicator
  // Example: 2024-01-15T10:30:00.000Z
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

// Format UTC timestamp for display in user's timezone
export function formatDateTimeInTimezone(utcTimestamp: string, timezone: string = 'Asia/Kolkata'): string {
  const date = new Date(utcTimestamp);
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
