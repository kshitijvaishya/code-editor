import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';
import { getCurrentUser } from '@/lib/auth';
import { getProblemById } from '@/lib/problems';

export const dynamic = 'force-dynamic';

// Get all submissions for a contest (only accessible by contest host)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contestId } = body;

    if (!contestId) {
      return NextResponse.json(
        { success: false, message: 'Contest ID is required' },
        { status: 400 }
      );
    }

    // Get contest
    const contest = await contestDb.getContestById(contestId);
    if (!contest) {
      return NextResponse.json(
        { success: false, message: 'Contest not found' },
        { status: 404 }
      );
    }

    // Verify user is the contest creator (host)
    if (contest.creatorId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Only the contest host can view submissions' },
        { status: 403 }
      );
    }

    // Get all submissions with additional problem information
    const submissionsWithDetails = (contest.submissions || []).map(submission => {
      const problem = getProblemById(submission.problemId);
      return {
        ...submission,
        problemTitle: problem?.title || 'Unknown Problem',
        problemDifficulty: problem?.difficulty || 'Unknown',
      };
    });

    // Group submissions by participant
    const submissionsByParticipant = contest.participants.map(participant => {
      const participantSubmissions = submissionsWithDetails.filter(
        sub => sub.userId === participant.userId
      );

      // Group by problem
      const submissionsByProblem: { [key: string]: any } = {};
      contest.problemIds.forEach(problemId => {
        const problemSubmissions = participantSubmissions.filter(
          sub => sub.problemId === problemId
        );
        const problem = getProblemById(problemId);
        submissionsByProblem[problemId] = {
          problemId,
          problemTitle: problem?.title || 'Unknown',
          problemDifficulty: problem?.difficulty || 'Unknown',
          submissions: problemSubmissions.sort((a, b) => 
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          ),
          bestSubmission: problemSubmissions.find(s => s.status === 'Accepted') || 
                         problemSubmissions.sort((a, b) => b.testsPassed - a.testsPassed)[0],
        };
      });

      return {
        userId: participant.userId,
        username: participant.username,
        score: participant.score || 0,
        problemsSolved: participant.problemsSolved || 0,
        totalSubmissions: participantSubmissions.length,
        submissionsByProblem,
      };
    });

    // Get contest problems details
    const problems = contest.problemIds.map(id => {
      const problem = getProblemById(id);
      if (!problem) return null;
      return {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        points: problem.points,
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        contest: {
          id: contest.id,
          name: contest.name,
          description: contest.description,
          startTime: contest.startTime,
          endTime: contest.endTime,
          status: contest.status,
        },
        problems,
        participants: submissionsByParticipant,
        totalSubmissions: contest.submissions?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching contest submissions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
