import { getDatabase } from './mongodb';

/**
 * Initialize database indexes for optimal query performance
 */
export async function initializeDatabase() {
  try {
    const db = await getDatabase();
    const contests = db.collection('contests');
    const users = db.collection('users');
    const contestEntries = db.collection('contest_entries');

    // Create indexes for contests
    await contests.createIndex({ joinCode: 1 }, { unique: true });
    await contests.createIndex({ creatorId: 1 });
    await contests.createIndex({ 'participants.userId': 1 });
    await contests.createIndex({ createdAt: -1 });
    await contests.createIndex({ endTime: 1 });

    // Create indexes for users
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ id: 1 }, { unique: true });

    // Create indexes for contest entries
    await contestEntries.createIndex({ contestId: 1, userId: 1 }, { unique: true });
    await contestEntries.createIndex({ userId: 1 });
    await contestEntries.createIndex({ contestId: 1 });

    console.log('Database indexes initialized successfully');
  } catch (error) {
    console.error('Error initializing database indexes:', error);
  }
}
