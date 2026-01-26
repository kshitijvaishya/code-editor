import { Contest, Participant, generateJoinCode, getContestStatus } from './contest';

// In-memory database (in production, use a real database)
class ContestDatabase {
  private contests: Map<string, Contest> = new Map();
  private joinCodeMap: Map<string, string> = new Map(); // joinCode -> contestId
  private rateLimit: Map<string, { attempts: number; lastAttempt: number }> = new Map();

  createContest(name: string, startTime: string, endTime: string, creatorId: string): { contest: Contest; joinCode: string } {
    const contestId = `contest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let joinCode: string;
    
    // Ensure unique join code
    do {
      joinCode = generateJoinCode();
    } while (this.joinCodeMap.has(joinCode));

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
        username: 'Contest Creator',
        joinedAt: new Date().toISOString(),
      }],
    };

    this.contests.set(contestId, contest);
    this.joinCodeMap.set(joinCode, contestId);

    return { contest, joinCode };
  }

  getContestByJoinCode(joinCode: string): Contest | null {
    const contestId = this.joinCodeMap.get(joinCode);
    if (!contestId) return null;
    
    const contest = this.contests.get(contestId);
    if (!contest) return null;

    // Update status
    contest.status = getContestStatus(contest.startTime, contest.endTime);
    return contest;
  }

  getContestById(contestId: string): Contest | null {
    const contest = this.contests.get(contestId);
    if (!contest) return null;

    // Update status
    contest.status = getContestStatus(contest.startTime, contest.endTime);
    return contest;
  }

  getUserContests(userId: string): Contest[] {
    const userContests: Contest[] = [];
    
    this.contests.forEach((contest) => {
      // Update status
      contest.status = getContestStatus(contest.startTime, contest.endTime);
      
      // Check if user is creator or participant
      if (contest.creatorId === userId || contest.participants.some(p => p.userId === userId)) {
        userContests.push(contest);
      }
    });

    return userContests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  joinContest(joinCode: string, userId: string, username: string): { success: boolean; message: string; contest?: Contest } {
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
    const contest = this.getContestByJoinCode(joinCode);
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

    contest.participants.push(participant);
    
    return { success: true, message: 'Successfully joined contest', contest };
  }

  // Clean up expired join codes (for contests that have ended)
  cleanupExpiredCodes(): void {
    const expiredCodes: string[] = [];
    
    this.joinCodeMap.forEach((contestId, joinCode) => {
      const contest = this.contests.get(contestId);
      if (contest && getContestStatus(contest.startTime, contest.endTime) === 'ended') {
        expiredCodes.push(joinCode);
      }
    });
    
    expiredCodes.forEach(code => this.joinCodeMap.delete(code));
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
