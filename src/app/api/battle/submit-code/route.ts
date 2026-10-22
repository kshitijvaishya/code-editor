// POST /api/battle/submit-code — submit code for Round 2 or Final
// Executes via Piston API, evaluates against server-side test cases
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { matchDb, submissionDb } from '@/lib/battleDb';
import { getDebugQsForLanguage, getFinalDSAProblems } from '@/lib/battleQuestions';
import { BattleLanguage } from '@/lib/battleTypes';

export const dynamic = 'force-dynamic';

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANG_CFG: Record<BattleLanguage, { language: string; version: string; file: string }> = {
  python: { language: 'python', version: '3.10.0', file: 'main.py' },
  cpp:    { language: 'c++',    version: '10.2.0', file: 'main.cpp' },
  java:   { language: 'java',   version: '15.0.2', file: 'Main.java' },
};

async function runCodeInSandbox(
  lang: BattleLanguage,
  code: string,
  stdin: string
): Promise<{ stdout: string; stderr: string; timedOut: boolean }> {
  const cfg = LANG_CFG[lang];
  try {
    const res = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: cfg.language,
        version: cfg.version,
        files: [{ name: cfg.file, content: code }],
        stdin,
        run_timeout: 10000,  // 10s CPU limit
        compile_timeout: 15000,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return { stdout: '', stderr: `Piston error: ${res.status}`, timedOut: false };
    }

    const data = await res.json();
    const run = data?.run || {};
    return {
      stdout: (run.stdout || '').trim(),
      stderr: (run.stderr || run.output || '').trim(),
      timedOut: run.signal === 'SIGKILL' || run.code === 124,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Execution failed';
    return { stdout: '', stderr: msg, timedOut: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { matchId, questionId, language, code, roundType, runOnly } = body;

    if (!matchId || !questionId || !language || code === undefined || !roundType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const validLangs: BattleLanguage[] = ['python', 'cpp', 'java'];
    if (!validLangs.includes(language)) {
      return NextResponse.json({ success: false, error: 'Invalid language' }, { status: 400 });
    }

    const match = await matchDb.getMatchById(matchId);
    if (!match) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });

    if (match.player1.userId !== user.userId && match.player2.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Deadline check
    if (roundType === 'round2' && match.round2DeadlineAt) {
      if (new Date(match.round2DeadlineAt).getTime() < Date.now()) {
        return NextResponse.json({ success: false, error: 'Round 2 deadline has passed' }, { status: 400 });
      }
    }

    // Load test cases from server
    let testCases: { input: string; expectedOutput: string; isHidden?: boolean }[] = [];

    if (roundType === 'round2') {
      const qs = getDebugQsForLanguage(language as BattleLanguage);
      const q = qs.find(q => q.questionId === questionId);
      if (!q) return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
      testCases = q.testCases;
    } else if (roundType === 'final') {
      const problems = getFinalDSAProblems();
      const q = problems.find(q => q.questionId === questionId);
      if (!q) return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404 });
      testCases = q.testCases;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid roundType' }, { status: 400 });
    }

    // For runOnly, only run visible test cases
    const casesToRun = runOnly ? testCases.filter(tc => !tc.isHidden) : testCases;

    const results = [];
    let passed = 0;

    for (const tc of casesToRun) {
      const { stdout, stderr, timedOut } = await runCodeInSandbox(language as BattleLanguage, code, tc.input);
      const expected = tc.expectedOutput.trim();
      const actual = timedOut ? '[TIME LIMIT EXCEEDED]' : (stderr ? `[ERROR] ${stderr.slice(0, 200)}` : stdout);
      const isPass = !stderr && !timedOut && actual === expected;

      if (isPass) passed++;

      results.push({
        // Never expose hidden inputs/outputs to client
        input: tc.isHidden ? '[hidden]' : tc.input,
        expectedOutput: tc.isHidden ? '[hidden]' : expected,
        actualOutput: actual,
        passed: isPass,
        isHidden: tc.isHidden || false,
      });
    }

    if (runOnly) {
      return NextResponse.json({
        success: true,
        data: { results, passed, total: casesToRun.length },
      });
    }

    // Full submission — compute score and persist
    const maxPoints = roundType === 'round2'
      ? 200   // per task
      : 500;  // per DSA problem

    const score = testCases.length > 0
      ? Math.round((passed / testCases.length) * maxPoints)
      : 0;

    await submissionDb.saveCode({
      matchId,
      userId: user.userId,
      questionId,
      roundType: roundType as 'round2' | 'final',
      language: language as BattleLanguage,
      code,
      status: 'evaluated',
      testsPassed: passed,
      totalTests: testCases.length,
      score,
      submittedAt: new Date().toISOString(),
      evaluatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { results, passed, total: testCases.length, score },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
