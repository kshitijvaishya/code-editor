import { Contest, Participant, generateJoinCode, getContestStatus } from './contest';
import { getDatabase } from './mongodb';

// MongoDB-based database
class ContestDatabase {
  private rateLimit: Map<string, { attempts: number; lastAttempt: number }> = new Map();

  private async getContestsCollection() {
    const db = await getDatabase();
    return db.collection<Contest>('contests');
  }

  async createContest(name: string, startTime: string, endTime: string, creatorId: string, creatorUsername: string): Promise<{ contest: Contest; joinCode: string }> {
    const contestId = `contest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let joinCode: string;
    const collection = await this.getContestsCollection();
    
    // Ensure unique join code
    do {
      joinCode = generateJoinCode();
      const existing = await collection.findOne({ joinCode });
      if (!existing) break;
    } while (true);

    const contest: Contest = {
      id: contestId,
      name,
      startTime,
      endTime,
      status: getContestStatus(startTime, endTime),
      joinCode,
      creatorId,
      createdAt: new Date().toISOString(),
      participants: [{
        userId: creatorId,
        username: creatorUsername,
        joinedAt: new Date().toISOString(),
      }],
    };

    await collection.insertOne(contest as any);

    return { contest, joinCode };
  }

  async getContestByJoinCode(joinCode: string): Promise<Contest | null> {
    const collection = await this.getContestsCollection();
    const contest = await collection.findOne({ joinCode });
    
    if (!contest) return null;

    // Update status
    contest.status = getContestStatus(contest.startTime, contest.endTime);
    return contest;
  }

  async getContestById(contestId: string): Promise<Contest | null> {
    const collection = await this.getContestsCollection();
    const contest = await collection.findOne({ id: contestId });
    
    if (!contest) return null;

    // Update status
    contest.status = getContestStatus(contest.startTime, contest.endTime);
    return contest;
  }

  async getUserContests(userId: string): Promise<Contest[]> {
    const collection = await this.getContestsCollection();
    const contests = await collection.find({
      $or: [
        { creatorId: userId },
        { 'participants.userId': userId }
      ]
    }).toArray();
    
    // Update status for each contest
    contests.forEach(contest => {
      contest.status = getContestStatus(contest.startTime, contest.endTime);
    });

    return contests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async joinContest(joinCode: string, userId: string, username: string): Promise<{ success: boolean; message: string; contest?: Contest }> {
    // Rate limiting check
    const rateLimitKey = `${userId}_join`;
    const rateLimitData = this.rateLimit.get(rateLimitKey);
    const now = Date.now();

    if (rateLimitData) {
      const timeSinceLastAttempt = now - rateLimitData.lastAttempt;
      
      // Reset if more than 1 minute has passed
      if (timeSinceLastAttempt > 60000) {
        this.rateLimit.set(rateLimitKey, { attempts: 1, lastAttempt: now });
      } else {
        // Check if too many attempts
        if (rateLimitData.attempts >= 5) {
          return { success: false, message: 'Too many attempts. Please try again later.' };
        }
        rateLimitData.attempts++;
        rateLimitData.lastAttempt = now;
      }
    } else {
      this.rateLimit.set(rateLimitKey, { attempts: 1, lastAttempt: now });
    }

    // Validate join code exists
    const contest = await this.getContestByJoinCode(joinCode);
    if (!contest) {
      return { success: false, message: 'Invalid join code' };
    }

    // Check contest status
    if (contest.status === 'ended') {
      return { success: false, message: 'Contest has ended' };
    }

    // Check if user already joined
    if (contest.participants.some(p => p.userId === userId)) {
      return { success: false, message: 'You have already joined this contest' };
    }

    // Check participant limit
    if (contest.participantLimit && contest.participants.length >= contest.participantLimit) {
      return { success: false, message: 'Contest is full' };
    }

    // Add user as participant
    const participant: Participant = {
      userId,
      username,
      joinedAt: new Date().toISOString(),
    };

    const collection = await this.getContestsCollection();
    await collection.updateOne(
      { joinCode },
      { $push: { participants: participant } }
    );

    contest.participants.push(participant);
    
    return { success: true, message: 'Successfully joined contest', contest };
  }

  // Clean up expired join codes (for contests that have ended)
  async cleanupExpiredCodes(): Promise<void> {
    const collection = await this.getContestsCollection();
    const now = new Date();
    
    // Delete contests that have ended more than 30 days ago
    await collection.deleteMany({
      endTime: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() }
    });
  }
}

// Export singleton instance
export const contestDb = new ContestDatabase();

// Cleanup expired codes every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    contestDb.cleanupExpiredCodes();
  }, 3600000);
}
