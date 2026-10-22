// ─── Battle Mode Types (v2 — admin-matchmaker model) ────────────────────────

export type BattleLanguage = 'python' | 'cpp' | 'java';
export type BattleRound = 'round1' | 'round2' | 'final';

// ─── Queue ───────────────────────────────────────────────────────────────────
export type QueueStatus = 'QUEUED' | 'MATCHED' | 'PLAYING' | 'LEFT';

export interface QueueEntry {
  _id?: string;
  queueId: string;          // unique per entry
  userId: string;
  username: string;
  email: string;
  language: BattleLanguage;
  status: QueueStatus;
  joinedAt: string;         // ISO — server-issued
  queueDeadlineAt: string;  // joinedAt + 30 s — when admin is notified
  matchId?: string;         // set when MATCHED
  lastHeartbeatAt: string;  // updated on polls — for connection status
}

// ─── Match ───────────────────────────────────────────────────────────────────
export type MatchStatus =
  | 'PENDING'         // admin created, waiting for language selections
  | 'INTRO'           // both langs saved, 10-s server countdown running
  | 'ROUND1'
  | 'ROUND2'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FORFEITED';

export interface BattleMatch {
  _id?: string;
  matchId: string;
  groupLabel?: string;      // optional A/B/C/D cosmetic label
  player1: MatchPlayer;
  player2: MatchPlayer;
  status: MatchStatus;

  // Server-issued deadlines (ISO strings)
  introStartedAt?: string;
  introDeadlineAt?: string;   // introStartedAt + 10 s
  round1StartedAt?: string;
  round1DeadlineAt?: string;  // round1StartedAt + 15*45 s
  round2StartedAt?: string;
  round2DeadlineAt?: string;  // round2StartedAt + 5*150 s

  round1Finalized: boolean;
  round2Finalized: boolean;

  round1Scores: Record<string, number>;  // userId → score
  round2Scores: Record<string, number>;

  winnerId?: string;
  isDraw?: boolean;

  createdAt: string;
  startedAt?: string;
  endedAt?: string;

  // Admin metadata
  createdByAdmin?: string;
  cancelledReason?: string;
}

export interface MatchPlayer {
  userId: string;
  username: string;
  email: string;
  language?: BattleLanguage;
  langSavedAt?: string;
  forfeitedAt?: string;
}

// ─── Final Match ─────────────────────────────────────────────────────────────
export interface FinalMatch {
  _id?: string;
  matchId: string;
  tournamentId?: string;
  playerIds: [string, string];
  playerData: { userId: string; username: string }[];
  status: 'active' | 'completed';
  deadlineAt: string;
  finalScores: Record<string, number>;
  winnerId?: string;
  isDraw?: boolean;
  startedAt: string;
  endedAt?: string;
  problemIds: string[];
}

// ─── Questions ───────────────────────────────────────────────────────────────
export interface MCQQuestion {
  questionId: string;
  roundType: 'round1';
  language: BattleLanguage;
  prompt: string;
  options: string[];
  correctIndex: number;   // server-only
  points: number;
  order: number;
}

export interface DebugQuestion {
  questionId: string;
  roundType: 'round2';
  language: BattleLanguage;
  prompt: string;
  buggyCode: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string; isHidden?: boolean }[];
  points: number;
  order: number;
}

export interface DSAQuestion {
  questionId: string;
  roundType: 'final';
  title: string;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<BattleLanguage, string>;
  testCases: { input: string; expectedOutput: string; isHidden?: boolean }[];
  points: number;
  order: number;
}

// ─── Submissions ─────────────────────────────────────────────────────────────
export interface MCQSubmission {
  submissionId: string;
  matchId: string;
  userId: string;
  questionId: string;
  roundType: 'round1';
  selectedIndex: number;
  isCorrect: boolean;
  score: number;
  submittedAt: string;
}

export interface CodeSubmission {
  submissionId: string;
  matchId: string;
  userId: string;
  questionId: string;
  roundType: 'round2' | 'final';
  language: BattleLanguage;
  code: string;
  status: 'pending' | 'evaluated' | 'timeout';
  testsPassed: number;
  totalTests: number;
  score: number;
  submittedAt: string;
  evaluatedAt?: string;
}

// ─── Results ─────────────────────────────────────────────────────────────────
export interface MatchResult {
  matchId: string;
  userId: string;
  username: string;
  opponentId: string;
  opponentUsername: string;
  round1Score: number;
  round2Score: number;
  totalScore: number;
  isWinner: boolean;
  isDraw: boolean;
  completedAt: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

// ─── Shared config ────────────────────────────────────────────────────────────
export const BATTLE_CONFIG = {
  ROUND1_QUESTIONS: 15,
  ROUND1_TIME_PER_Q: 45,           // seconds
  ROUND2_QUESTIONS: 5,
  ROUND2_TIME_PER_Q: 150,          // seconds
  FINAL_DURATION: 1800,            // seconds
  ROUND1_POINTS_PER_Q: 100,
  ROUND2_POINTS_PER_TASK: 200,
  FINAL_POINTS_PER_PROBLEM: 500,
  INTRO_DURATION: 10,              // seconds
  QUEUE_NOTIFY_AFTER: 30,          // seconds — admin notified
  HEARTBEAT_TIMEOUT: 60,           // seconds — player considered disconnected
  LANGUAGES: ['python', 'cpp', 'java'] as BattleLanguage[],
} as const;

export interface BattleApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Legacy aliases kept for pages that still import them
export type Tournament = BattleMatch;
export type PlayerSlot = MatchPlayer;
export type GroupId = 'A' | 'B' | 'C' | 'D';
export interface GroupAssignment {
  groupId: GroupId;
  matchId: string;
  playerIds: [string, string];
}
export interface TournamentRules {
  maxPlayers: 8;
  round1Questions: 15;
  round1TimePerQ: 45;
  round2Questions: 5;
  round2TimePerQ: 150;
  finalDuration: 1800;
  round1PointsPerQ: 100;
  round2PointsPerTask: 200;
  finalPointsPerProblem: 500;
  languages: BattleLanguage[];
  tieBreakPolicy: 'round2_then_round1' | 'timestamp';
}
export interface PlayerResult {
  tournamentId: string;
  userId: string;
  username: string;
  groupId: GroupId;
  matchId: string;
  opponentId: string;
  opponentUsername: string;
  round1Score: number;
  round2Score: number;
  qualifierScore: number;
  finalScore?: number;
  rank?: number;
  qualified: boolean;
  finalist: boolean;
  matchWinner: boolean;
  finalPlacement?: number;
}
export interface LeaderboardEntry {
  userId: string;
  username: string;
  groupId: GroupId;
  opponentUsername: string;
  round1Score: number;
  round2Score: number;
  qualifierScore: number;
  finalScore?: number;
  rank: number;
  matchStatus: string;
  qualified: boolean;
  finalist: boolean;
  finalPlacement?: number;
  isFinalized: boolean;
}
// Match alias with old field names for legacy pages
export interface Match {
  _id?: string;
  matchId: string;
  tournamentId: string;
  groupId: GroupId;
  playerIds: [string, string];
  playerData: PlayerSlot[];
  status: 'waiting' | 'intro' | 'round1' | 'round2' | 'completed';
  round1DeadlineAt?: string;
  round2DeadlineAt?: string;
  round1Finalized: boolean;
  round2Finalized: boolean;
  winnerId?: string;
  round1Scores: Record<string, number>;
  round2Scores: Record<string, number>;
  startedAt?: string;
  endedAt?: string;
  introDeadlineAt?: string;
}
export type TournamentStatus = 'waiting' | 'starting' | 'round1' | 'round2' | 'qualifying' | 'final' | 'completed';
