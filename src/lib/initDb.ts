import { getDatabase } from './mongodb';

/**
 * Initialize database indexes for optimal query performance
 */
export async function initializeDatabase() {
  try {
    const db = await getDatabase();
    const contests = db.collection('contests');
    const users = db.collection('users');

    // Create indexes for contests
    await contests.createIndex({ joinCode: 1 }, { unique: true });
    await contests.createIndex({ creatorId: 1 });
    await contests.createIndex({ 'participants.userId': 1 });
    await contests.createIndex({ createdAt: -1 });
    await contests.createIndex({ endTime: 1 });

    // Create indexes for users
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ id: 1 }, { unique: true });

    console.log('Database indexes initialized successfully');
  } catch (error) {
    console.error('Error initializing database indexes:', error);
  }
}
