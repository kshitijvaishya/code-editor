// MongoDB index setup for Battle Mode collections
// Run once: npx ts-node --project tsconfig.json src/lib/battleIndexes.ts
// Or call ensureBattleIndexes() from a route during first startup

import { getDatabase } from './mongodb';

export async function ensureBattleIndexes(): Promise<void> {
  const db = await getDatabase();

  // battleQueue: unique QUEUED entry per user
  await db.collection('battleQueue').createIndexes([
    { key: { userId: 1, status: 1 }, background: true },
    { key: { status: 1, joinedAt: 1 }, background: true },
    { key: { queueId: 1 }, unique: true, background: true },
  ]);

  // battleMatches
  await db.collection('battleMatches').createIndexes([
    { key: { matchId: 1 }, unique: true, background: true },
    { key: { 'player1.userId': 1, status: 1 }, background: true },
    { key: { 'player2.userId': 1, status: 1 }, background: true },
    { key: { status: 1, createdAt: -1 }, background: true },
  ]);

  // battleSubmissions: idempotency
  await db.collection('battleSubmissions').createIndexes([
    { key: { matchId: 1, userId: 1, questionId: 1, roundType: 1 }, unique: true, background: true },
    { key: { matchId: 1, userId: 1, roundType: 1 }, background: true },
  ]);

  // battleResults
  await db.collection('battleResults').createIndexes([
    { key: { matchId: 1, userId: 1 }, unique: true, background: true },
    { key: { userId: 1 }, background: true },
  ]);
}
