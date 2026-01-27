import { NextRequest, NextResponse } from 'next/server';
import { contestDb } from '@/lib/contestDb';
import { getCurrentUser } from '@/lib/auth';
import { getProblemById } from '@/lib/problems';
import { runTestCases, filterHiddenTestResults } from '@/lib/testRunner';

export const dynamic = 'force-dynamic';

// Submit a solution to a contest problem
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
    const { contestId, problemId, code, language } = body;

    if (!contestId || !problemId || !code || !language) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    // Check if user is participant
    const isParticipant = contest.participants.some(p => p.userId === user.userId);
    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: 'You are not a participant in this contest' },
        { status: 403 }
      );
    }

    // Check contest status
    if (contest.status !== 'live') {
      return NextResponse.json(
        { success: false, message: 'Contest is not active' },
        { status: 400 }
      );
    }

    // Get problem
    const problem = getProblemById(problemId);
    if (!problem) {
      return NextResponse.json(
        { success: false, message: 'Problem not found' },
        { status: 404 }
      );
    }

    // Check if problem is in contest
    if (!contest.problemIds.includes(problemId)) {
      return NextResponse.json(
        { success: false, message: 'Problem not in this contest' },
        { status: 400 }
      );
    }

    // Run code against all test cases
    const executeApiUrl = `${request.nextUrl.origin}/api/execute`;
    const executionResult = await runTestCases(
      code,
      language,
      problem.testCases,
      problem.timeLimit,
      executeApiUrl
    );

    // Calculate points (only full points for Accepted)
    const points = executionResult.status === 'Accepted' ? problem.points : 0;

    // Record submission
    await contestDb.submitSolution(
      contestId,
      user.userId,
      user.username,
      problemId,
      code,
      language,
      executionResult.status,
      executionResult.passedTests,
      executionResult.totalTests,
      executionResult.totalExecutionTime,
      points
    );

    // Filter hidden test cases before returning to user
    const filteredTestResults = filterHiddenTestResults(executionResult.testResults);

    return NextResponse.json({
      success: true,
      submission: {
        status: executionResult.status,
        testsPassed: executionResult.passedTests,
        totalTests: executionResult.totalTests,
        executionTime: executionResult.totalExecutionTime,
        points,
        testResults: filteredTestResults, // Include test case details
      },
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
