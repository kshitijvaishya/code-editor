import { Contest, Participant, generateJoinCode, getContestStatus } from './contest';
import { getDatabase } from './mongodb';

// MongoDB-based database
class ContestDatabase {
  private rateLimit: Map<string, { attempts: number; lastAttempt: number }> = new Map();

  private async getContestsCollection() {
    const db = await getDatabase();
    return db.collection<Contest>('contests');
  }

  async createContest(name: string, startTime: string, endTime: string, creatorId: string, creatorUsername: string, problemIds: string[] = [], description?: string): Promise<{ contest: Contest; joinCode: string }> {
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
      description,
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
        score: 0,
        problemsSolved: 0,
      }],
      problemIds: problemIds.length > 0 ? problemIds : [],
      submissions: [],
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
      score: 0,
      problemsSolved: 0,
    };

    const collection = await this.getContestsCollection();
    await collection.updateOne(
      { joinCode },
      { $push: { participants: participant } }
    );

    contest.participants.push(participant);
    
    return { success: true, message: 'Successfully joined contest', contest };
  }

  async submitSolution(contestId: string, userId: string, username: string, problemId: string, code: string, language: string, status: string, testsPassed: number, totalTests: number, executionTime: number, points: number): Promise<{ success: boolean; message: string }> {
    const collection = await this.getContestsCollection();
    const contest = await this.getContestById(contestId);

    if (!contest) {
      return { success: false, message: 'Contest not found' };
    }

    if (contest.status !== 'live') {
      return { success: false, message: 'Contest is not active' };
    }

    const submission: any = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      problemId,
      status,
      language,
      code,
      testsPassed,
      totalTests,
      submittedAt: new Date().toISOString(),
      executionTime,
      points: status === 'Accepted' ? points : 0,
    };

    // Add submission to contest
    await collection.updateOne(
      { id: contestId },
      { 
        $push: { submissions: submission }
      }
    );

    // Update participant score if accepted
    if (status === 'Accepted') {
      const participant = contest.participants.find(p => p.userId === userId);
      if (participant) {
        // Check if this is a new problem solved
        const existingAccepted = contest.submissions?.filter(
          s => s.userId === userId && s.problemId === problemId && s.status === 'Accepted'
        );
        
        const isFirstAccepted = !existingAccepted || existingAccepted.length === 0;
        
        await collection.updateOne(
          { id: contestId, 'participants.userId': userId },
          { 
            $inc: { 
              'participants.$.score': points,
              'participants.$.problemsSolved': isFirstAccepted ? 1 : 0
            }
          }
        );
      }
    }

    return { success: true, message: 'Submission recorded' };
  }

  async getContestSubmissions(contestId: string, userId?: string): Promise<any[]> {
    const contest = await this.getContestById(contestId);
    if (!contest || !contest.submissions) return [];

    if (userId) {
      return contest.submissions.filter(s => s.userId === userId);
    }

    return contest.submissions;
  }

  async getContestLeaderboard(contestId: string): Promise<Participant[]> {
    const contest = await this.getContestById(contestId);
    if (!contest) return [];

    // Sort participants by score (descending), then by problems solved
    return [...contest.participants].sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) {
        return (b.score || 0) - (a.score || 0);
      }
      return (b.problemsSolved || 0) - (a.problemsSolved || 0);
    });
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

  async deleteContest(contestId: string): Promise<boolean> {
    const collection = await this.getContestsCollection();
    const result = await collection.deleteOne({ id: contestId });
    return result.deletedCount > 0;
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
