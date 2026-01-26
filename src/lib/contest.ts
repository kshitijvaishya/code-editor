// Contest Types
export type ContestStatus = 'upcoming' | 'live' | 'ended';

export interface Contest {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: ContestStatus;
  joinCode: string;
  creatorId: string;
  createdAt: string;
  participants: Participant[];
  participantLimit?: number;
}

export interface Participant {
  userId: string;
  username: string;
  joinedAt: string;
}

export interface CreateContestRequest {
  name: string;
  startTime: string;
  endTime: string;
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
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
}

export function formatDateTime(dateString: string): string {
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
