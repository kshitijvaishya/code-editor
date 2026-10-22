// ─── Battle DB v2 — queue-based, admin-matchmaker model ─────────────────────
import { getDatabase } from './mongodb';
import { v4 as uuidv4 } from 'uuid';
import {
  QueueEntry,
  BattleMatch,
  MatchPlayer,
  FinalMatch,
  MCQSubmission,
  CodeSubmission,
  MatchResult,
  BATTLE_CONFIG,
  BattleLanguage,
  MatchStatus,
} from './battleTypes';

// ─── Queue Operations ─────────────────────────────────────────────────────────
export const queueDb = {
  /** Add user to queue. Idempotent — returns existing entry if already queued. */
  async joinQueue(user: {
    userId: string;
    username: string;
    email: string;
    language: BattleLanguage;
  }): Promise<QueueEntry> {
    const db = await getDatabase();
    const col = db.collection<QueueEntry>('battleQueue');

    // Unique constraint: one QUEUED entry per user
    const existing = await col.findOne({
      userId: user.userId,
      status: { $in: ['QUEUED', 'MATCHED'] },
    });
    if (existing) {
      // refresh heartbeat
      await col.updateOne(
        { queueId: existing.queueId },
        { $set: { lastHeartbeatAt: new Date().toISOString() } }
      );
      return { ...existing, _id: existing._id?.toString() };
    }

    const now = new Date();
    const entry: QueueEntry = {
      queueId: uuidv4(),
      userId: user.userId,
      username: user.username,
      email: user.email,
      language: user.language,
      status: 'QUEUED',
      joinedAt: now.toISOString(),
      queueDeadlineAt: new Date(now.getTime() + BATTLE_CONFIG.QUEUE_NOTIFY_AFTER * 1000).toISOString(),
      lastHeartbeatAt: now.toISOString(),
    };

    await col.insertOne(entry as never);
    return entry;
  },

  /** Heartbeat — keep player connection status live */
  async heartbeat(userId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection<QueueEntry>('battleQueue').updateOne(
      { userId, status: { $in: ['QUEUED', 'MATCHED', 'PLAYING'] } },
      { $set: { lastHeartbeatAt: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  },

  /** Remove player from queue (only allowed if QUEUED, not MATCHED/PLAYING) */
  async leaveQueue(userId: string): Promise<{ ok: boolean; reason?: string }> {
    const db = await getDatabase();
    const entry = await db.collection<QueueEntry>('battleQueue').findOne({
      userId,
      status: { $in: ['QUEUED', 'MATCHED', 'PLAYING'] },
    });
    if (!entry) return { ok: true };
    if (entry.status === 'PLAYING') {
      return { ok: false, reason: 'Cannot leave queue while in an active match' };
    }
    // If MATCHED but match not yet INTRO/ROUND1, allow leave
    await db.collection<QueueEntry>('battleQueue').updateOne(
      { queueId: entry.queueId },
      { $set: { status: 'LEFT' } }
    );
    return { ok: true };
  },

  /** Get a user's current queue entry */
  async getMyEntry(userId: string): Promise<QueueEntry | null> {
    const db = await getDatabase();
    const entry = await db.collection<QueueEntry>('battleQueue').findOne({
      userId,
      status: { $in: ['QUEUED', 'MATCHED', 'PLAYING'] },
    });
    if (!entry) return null;
    return { ...entry, _id: entry._id?.toString() };
  },

  /** Admin: list all QUEUED players with computed waiting time */
  async listQueued(): Promise<QueueEntry[]> {
    const db = await getDatabase();
    const entries = await db
      .collection<QueueEntry>('battleQueue')
      .find({ status: 'QUEUED' })
      .sort({ joinedAt: 1 })
      .toArray();
    return entries.map(e => ({ ...e, _id: e._id?.toString() }));
  },

  /** Admin: list all active entries (QUEUED + MATCHED + PLAYING) */
  async listActive(): Promise<QueueEntry[]> {
    const db = await getDatabase();
    const entries = await db
      .collection<QueueEntry>('battleQueue')
      .find({ status: { $in: ['QUEUED', 'MATCHED', 'PLAYING'] } })
      .sort({ joinedAt: 1 })
      .toArray();
    return entries.map(e => ({ ...e, _id: e._id?.toString() }));
  },

  /** Admin: force-remove a queued entry */
  async removeEntry(queueId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection<QueueEntry>('battleQueue').updateOne(
      { queueId, status: 'QUEUED' },
      { $set: { status: 'LEFT' } }
    );
    return result.modifiedCount > 0;
  },
};

// ─── Match Operations ─────────────────────────────────────────────────────────
export const matchDb = {
  /** Admin creates a match from two QUEUED players. Atomic check + create. */
  async createMatch(
    player1Id: string,
    player2Id: string,
    adminId: string,
    groupLabel?: string
  ): Promise<BattleMatch> {
    const db = await getDatabase();
    const queueCol = db.collection<QueueEntry>('battleQueue');
    const matchCol = db.collection<BattleMatch>('battleMatches');

    // Validate both players are QUEUED (not already in a match)
    const [p1Entry, p2Entry] = await Promise.all([
      queueCol.findOne({ userId: player1Id, status: 'QUEUED' }),
      queueCol.findOne({ userId: player2Id, status: 'QUEUED' }),
    ]);

    if (!p1Entry) throw new Error(`Player ${player1Id} is not in QUEUED status`);
    if (!p2Entry) throw new Error(`Player ${player2Id} is not in QUEUED status`);
    if (player1Id === player2Id) throw new Error('Cannot match a player against themselves');

    // Check neither is already in an active match
    const activeCheck = await matchCol.findOne({
      'status': { $in: ['PENDING', 'INTRO', 'ROUND1', 'ROUND2'] },
      $or: [
        { 'player1.userId': { $in: [player1Id, player2Id] } },
        { 'player2.userId': { $in: [player1Id, player2Id] } },
      ],
    });
    if (activeCheck) {
      throw new Error('One or both players already have an active match');
    }

    const matchId = uuidv4();
    const now = new Date().toISOString();

    const match: BattleMatch = {
      matchId,
      groupLabel: groupLabel || undefined,
      player1: {
        userId: p1Entry.userId,
        username: p1Entry.username,
        email: p1Entry.email,
        language: p1Entry.language,
      },
      player2: {
        userId: p2Entry.userId,
        username: p2Entry.username,
        email: p2Entry.email,
        language: p2Entry.language,
      },
      status: 'PENDING',
      round1Finalized: false,
      round2Finalized: false,
      round1Scores: {},
      round2Scores: {},
      createdAt: now,
      createdByAdmin: adminId,
    };

    await matchCol.insertOne(match as never);

    // Mark both queue entries as MATCHED
    await queueCol.updateMany(
      { userId: { $in: [player1Id, player2Id] }, status: 'QUEUED' },
      { $set: { status: 'MATCHED', matchId } }
    );

    return { ...match };
  },

  async getMatchById(matchId: string): Promise<BattleMatch | null> {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (!match) return null;
    return { ...match, _id: match._id?.toString() };
  },

  async getMatchForUser(userId: string): Promise<BattleMatch | null> {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({
      status: { $in: ['PENDING', 'INTRO', 'ROUND1', 'ROUND2'] },
      $or: [{ 'player1.userId': userId }, { 'player2.userId': userId }],
    });
    if (!match) return null;
    return { ...match, _id: match._id?.toString() };
  },

  /** Admin: list all matches */
  async listMatches(filter?: { status?: MatchStatus[] }): Promise<BattleMatch[]> {
    const db = await getDatabase();
    const query = filter?.status ? { status: { $in: filter.status } } : {};
    const matches = await db
      .collection<BattleMatch>('battleMatches')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return matches.map(m => ({ ...m, _id: m._id?.toString() }));
  },

  /** Save a player's language selection */
  async saveLanguage(matchId: string, userId: string, language: BattleLanguage): Promise<boolean> {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (!match) return false;
    if (match.status !== 'PENDING') return false;

    const field = match.player1.userId === userId ? 'player1.language' : 'player2.language';
    const savedField = match.player1.userId === userId ? 'player1.langSavedAt' : 'player2.langSavedAt';
    const now = new Date().toISOString();

    await db.collection<BattleMatch>('battleMatches').updateOne(
      { matchId },
      { $set: { [field]: language, [savedField]: now } }
    );

    // Check if both players have saved — start intro
    const updated = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (updated?.player1.langSavedAt && updated?.player2.langSavedAt) {
      await this.startIntro(matchId);
    }
    return true;
  },

  /** Start the 10-second intro countdown */
  async startIntro(matchId: string): Promise<void> {
    const now = new Date();
    const introDeadline = new Date(now.getTime() + BATTLE_CONFIG.INTRO_DURATION * 1000).toISOString();
    await getDatabase().then(db =>
      db.collection<BattleMatch>('battleMatches').updateOne(
        { matchId, status: 'PENDING' },
        {
          $set: {
            status: 'INTRO',
            introStartedAt: now.toISOString(),
            introDeadlineAt: introDeadline,
          },
        }
      )
    );
  },

  /** Admin manually starts intro (skipping lang-save requirement) */
  async adminStartMatch(matchId: string): Promise<BattleMatch | null> {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (!match || !['PENDING'].includes(match.status)) return null;

    const now = new Date();
    const introDeadline = new Date(now.getTime() + BATTLE_CONFIG.INTRO_DURATION * 1000).toISOString();

    await db.collection<BattleMatch>('battleMatches').updateOne(
      { matchId },
      {
        $set: {
          status: 'INTRO',
          introStartedAt: now.toISOString(),
          introDeadlineAt: introDeadline,
          startedAt: now.toISOString(),
        },
      }
    );

    // Mark queue entries as PLAYING
    await db.collection<QueueEntry>('battleQueue').updateMany(
      {
        userId: { $in: [match.player1.userId, match.player2.userId] },
        status: 'MATCHED',
      },
      { $set: { status: 'PLAYING' } }
    );

    return this.getMatchById(matchId);
  },

  /** Called by player or by deadline — transition INTRO → ROUND1 */
  async startRound1(matchId: string): Promise<void> {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (!match || match.status !== 'INTRO') return;

    const now = new Date();
    const deadline = new Date(
      now.getTime() + BATTLE_CONFIG.ROUND1_QUESTIONS * BATTLE_CONFIG.ROUND1_TIME_PER_Q * 1000
    ).toISOString();

    await db.collection<BattleMatch>('battleMatches').updateOne(
      { matchId, status: 'INTRO' },
      {
        $set: {
          status: 'ROUND1',
          round1StartedAt: now.toISOString(),
          round1DeadlineAt: deadline,
        },
      }
    );
  },

  /** Called when round1 is done */
  async startRound2(matchId: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date();
    const deadline = new Date(
      now.getTime() + BATTLE_CONFIG.ROUND2_QUESTIONS * BATTLE_CONFIG.ROUND2_TIME_PER_Q * 1000
    ).toISOString();

    await db.collection<BattleMatch>('battleMatches').updateOne(
      { matchId, status: 'ROUND1' },
      {
        $set: {
          status: 'ROUND2',
          round2StartedAt: now.toISOString(),
          round2DeadlineAt: deadline,
        },
      }
    );
  },

  /** Finalize round 1 — compute scores from submissions */
  async finalizeRound1(matchId: string): Promise<void> {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (!match || match.round1Finalized) return;

    const scores: Record<string, number> = {};
    for (const uid of [match.player1.userId, match.player2.userId]) {
      const subs = await db
        .collection<MCQSubmission>('battleSubmissions')
        .find({ matchId, userId: uid, roundType: 'round1' })
        .toArray();
      scores[uid] = subs.reduce((acc, s) => acc + (s.score || 0), 0);
    }

    await db.collection<BattleMatch>('battleMatches').updateOne(
      { matchId },
      { $set: { round1Scores: scores, round1Finalized: true } }
    );
  },

  /** Finalize round 2 — compute scores and determine winner */
  async finalizeRound2(matchId: string): Promise<void> {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (!match || match.round2Finalized) return;

    const scores: Record<string, number> = {};
    for (const uid of [match.player1.userId, match.player2.userId]) {
      const subs = await db
        .collection<CodeSubmission>('battleSubmissions')
        .find({ matchId, userId: uid, roundType: 'round2' })
        .toArray();
      scores[uid] = subs.reduce((acc, s) => acc + (s.score || 0), 0);
    }

    const p1 = match.player1.userId;
    const p2 = match.player2.userId;
    const total1 = (match.round1Scores[p1] || 0) + scores[p1];
    const total2 = (match.round1Scores[p2] || 0) + scores[p2];

    let winnerId: string | undefined;
    let isDraw = false;

    if (total1 > total2) winnerId = p1;
    else if (total2 > total1) winnerId = p2;
    else {
      // Tiebreak: round2 score
      if (scores[p1] > scores[p2]) winnerId = p1;
      else if (scores[p2] > scores[p1]) winnerId = p2;
      else {
        // Tiebreak: round1 score
        const r1p1 = match.round1Scores[p1] || 0;
        const r1p2 = match.round1Scores[p2] || 0;
        if (r1p1 > r1p2) winnerId = p1;
        else if (r1p2 > r1p1) winnerId = p2;
        else isDraw = true;
      }
    }

    const now = new Date().toISOString();
    await db.collection<BattleMatch>('battleMatches').updateOne(
      { matchId },
      {
        $set: {
          round2Scores: scores,
          round2Finalized: true,
          status: 'COMPLETED',
          winnerId,
          isDraw,
          endedAt: now,
        },
      }
    );

    // Save match results
    const result1: MatchResult = {
      matchId,
      userId: p1,
      username: match.player1.username,
      opponentId: p2,
      opponentUsername: match.player2.username,
      round1Score: match.round1Scores[p1] || 0,
      round2Score: scores[p1] || 0,
      totalScore: total1,
      isWinner: winnerId === p1,
      isDraw,
      completedAt: now,
    };
    const result2: MatchResult = {
      matchId,
      userId: p2,
      username: match.player2.username,
      opponentId: p1,
      opponentUsername: match.player1.username,
      round1Score: match.round1Scores[p2] || 0,
      round2Score: scores[p2] || 0,
      totalScore: total2,
      isWinner: winnerId === p2,
      isDraw,
      completedAt: now,
    };

    await db.collection<MatchResult>('battleResults').insertMany([result1, result2] as never[]);

    // Free up queue entries
    await db.collection<QueueEntry>('battleQueue').updateMany(
      { userId: { $in: [p1, p2] }, status: 'PLAYING' },
      { $set: { status: 'LEFT' } }
    );
  },

  /** Admin: cancel a match */
  async cancelMatch(matchId: string, adminId: string, reason: string): Promise<boolean> {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (!match) return false;
    if (['COMPLETED', 'CANCELLED', 'FORFEITED'].includes(match.status)) return false;

    await db.collection<BattleMatch>('battleMatches').updateOne(
      { matchId },
      {
        $set: {
          status: 'CANCELLED',
          cancelledReason: reason,
          endedAt: new Date().toISOString(),
        },
      }
    );

    // Re-queue both players (or set to LEFT depending on reason)
    await db.collection<QueueEntry>('battleQueue').updateMany(
      { userId: { $in: [match.player1.userId, match.player2.userId] } },
      { $set: { status: 'LEFT' } }
    );

    return true;
  },

  /** Deadline reconciliation — auto-finalize expired matches */
  async reconcileExpiredMatches(): Promise<void> {
    const db = await getDatabase();
    const now = new Date();

    // INTRO expired → start round1
    const expiredIntro = await db
      .collection<BattleMatch>('battleMatches')
      .find({
        status: 'INTRO',
        introDeadlineAt: { $lt: now.toISOString() },
      })
      .toArray();

    for (const m of expiredIntro) {
      await this.startRound1(m.matchId);
    }

    // ROUND1 expired → finalize + start round2
    const expiredR1 = await db
      .collection<BattleMatch>('battleMatches')
      .find({
        status: 'ROUND1',
        round1DeadlineAt: { $lt: now.toISOString() },
        round1Finalized: false,
      })
      .toArray();

    for (const m of expiredR1) {
      await this.finalizeRound1(m.matchId);
      await this.startRound2(m.matchId);
    }

    // ROUND2 expired → finalize
    const expiredR2 = await db
      .collection<BattleMatch>('battleMatches')
      .find({
        status: 'ROUND2',
        round2DeadlineAt: { $lt: now.toISOString() },
        round2Finalized: false,
      })
      .toArray();

    for (const m of expiredR2) {
      await this.finalizeRound2(m.matchId);
    }
  },
};

// ─── Submission DB ────────────────────────────────────────────────────────────
export const submissionDb = {
  async saveMCQ(sub: Omit<MCQSubmission, 'submissionId'>): Promise<string> {
    const db = await getDatabase();
    // Idempotent: one submission per user+question+match
    const existing = await db.collection<MCQSubmission>('battleSubmissions').findOne({
      matchId: sub.matchId,
      userId: sub.userId,
      questionId: sub.questionId,
      roundType: 'round1',
    });
    if (existing) return existing.submissionId;

    const submissionId = uuidv4();
    await db.collection('battleSubmissions').insertOne({ ...sub, submissionId });
    return submissionId;
  },

  async saveCode(sub: Omit<CodeSubmission, 'submissionId'>): Promise<string> {
    const db = await getDatabase();
    const existing = await db.collection<CodeSubmission>('battleSubmissions').findOne({
      matchId: sub.matchId,
      userId: sub.userId,
      questionId: sub.questionId,
      roundType: sub.roundType,
    });
    if (existing) {
      await db.collection('battleSubmissions').updateOne(
        { submissionId: existing.submissionId },
        { $set: { ...sub } }
      );
      return existing.submissionId;
    }
    const submissionId = uuidv4();
    await db.collection('battleSubmissions').insertOne({ ...sub, submissionId });
    return submissionId;
  },

  async getForMatch(matchId: string, userId: string, roundType: string) {
    const db = await getDatabase();
    return db
      .collection('battleSubmissions')
      .find({ matchId, userId, roundType })
      .toArray();
  },
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const leaderboardDb = {
  async getMatchResults(matchId: string): Promise<MatchResult[]> {
    const db = await getDatabase();
    return db
      .collection<MatchResult>('battleResults')
      .find({ matchId })
      .toArray();
  },

  async getMatchLeaderboard(matchId: string) {
    const db = await getDatabase();
    const match = await db.collection<BattleMatch>('battleMatches').findOne({ matchId });
    if (!match) return null;

    const results = await this.getMatchResults(matchId);
    return { match: { ...match, _id: match._id?.toString() }, results };
  },
};

// ─── Admin helpers ────────────────────────────────────────────────────────────
export const adminDb = {
  async isAdmin(userId: string): Promise<boolean> {
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ id: userId });
    return !!(user?.isAdmin);
  },

  async getDashboardData() {
    const db = await getDatabase();
    const [queued, activeMatches, recentMatches] = await Promise.all([
      queueDb.listActive(),
      db
        .collection<BattleMatch>('battleMatches')
        .find({ status: { $in: ['PENDING', 'INTRO', 'ROUND1', 'ROUND2'] } })
        .sort({ createdAt: -1 })
        .toArray(),
      db
        .collection<BattleMatch>('battleMatches')
        .find({ status: { $in: ['COMPLETED', 'CANCELLED', 'FORFEITED'] } })
        .sort({ endedAt: -1 })
        .limit(20)
        .toArray(),
    ]);

    return {
      queuedCount: queued.filter(e => e.status === 'QUEUED').length,
      queued: queued.map(e => ({ ...e, _id: e._id?.toString() })),
      activeMatches: activeMatches.map(m => ({ ...m, _id: m._id?.toString() })),
      recentMatches: recentMatches.map(m => ({ ...m, _id: m._id?.toString() })),
    };
  },

  /** Promote a user to admin. Call directly in DB or add a seed script. */
  async setAdmin(userId: string, isAdmin: boolean): Promise<void> {
    const db = await getDatabase();
    await db.collection('users').updateOne({ id: userId }, { $set: { isAdmin } });
  },
};
