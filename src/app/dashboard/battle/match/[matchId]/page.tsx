'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import {
  Clock, CheckCircle2, XCircle, ChevronRight, Play, Send,
  Swords, Code2, AlertTriangle, RefreshCw, Zap
} from 'lucide-react';
import { BattleLanguage, BattleMatch, MCQQuestion, DebugQuestion, BATTLE_CONFIG } from '@/lib/battleTypes';
import { getMCQsForLanguage, getDebugQsForLanguage, sanitizeMCQ, sanitizeDebugQ } from '@/lib/battleQuestions';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Phase =
  | 'loading'
  | 'intro'          // 10-second countdown
  | 'lang-select'    // language picker
  | 'round1'
  | 'round2'
  | 'completed'
  | 'error';

interface TestResult {
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  input: string;
  isHidden: boolean;
}

function MatchContent() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<BattleMatch | null>(null);
  const [myUserId, setMyUserId] = useState('');
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // Language
  const [language, setLanguage] = useState<BattleLanguage>('python');
  const [langSaved, setLangSaved] = useState(false);

  // Intro countdown
  const [introCountdown, setIntroCountdown] = useState<number>(BATTLE_CONFIG.INTRO_DURATION);

  // Round 1
  const [mcqQuestions, setMcqQuestions] = useState<Omit<MCQQuestion, 'correctIndex'>[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [qTimer, setQTimer] = useState(45);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResults, setAnswerResults] = useState<Record<string, { score: number; answered: boolean }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Round 2
  const [debugQuestions, setDebugQuestions] = useState<DebugQuestion[]>([]);
  const [currentDebugIdx, setCurrentDebugIdx] = useState(0);
  const [debugCode, setDebugCode] = useState('');
  const [r2Timer, setR2Timer] = useState<number>(BATTLE_CONFIG.ROUND2_TIME_PER_Q);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [r2Score, setR2Score] = useState(0);

  const timerRef = useRef<NodeJS.Timeout>();
  const pollRef = useRef<NodeJS.Timeout>();

  // ── Get my user ID once ───────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setMyUserId(d.user?.userId || d.user?.id || ''));
  }, []);

  // ── Fetch match ───────────────────────────────────────────────────────────
  const fetchMatch = useCallback(async () => {
    try {
      const res = await fetch(`/api/battle/match?matchId=${matchId}`);
      const data = await res.json();
      if (data.success) {
        return data.data.match as BattleMatch;
      }
    } catch { /* ignore */ }
    return null;
  }, [matchId]);

  // ── Determine my language ─────────────────────────────────────────────────
  const getMyLanguage = (m: BattleMatch, uid: string): BattleLanguage => {
    if (m.player1.userId === uid) return m.player1.language || 'python';
    return m.player2.language || 'python';
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  const initialize = useCallback(async (uid: string) => {
    const m = await fetchMatch();
    if (!m) { setPhase('error'); setErrorMsg('Match not found'); return; }

    setMatch(m);
    const myLang = getMyLanguage(m, uid);
    setLanguage(myLang);

    switch (m.status) {
      case 'PENDING':
        setPhase('lang-select');
        break;
      case 'INTRO':
        setPhase('intro');
        startIntroTimer(m);
        break;
      case 'ROUND1':
        setPhase('round1');
        loadRound1(m, uid);
        break;
      case 'ROUND2':
        setPhase('round2');
        loadRound2(m, uid);
        break;
      case 'COMPLETED':
      case 'CANCELLED':
      case 'FORFEITED':
        setPhase('completed');
        break;
    }
  }, [fetchMatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (myUserId) initialize(myUserId);
  }, [myUserId, initialize]);

  // ── Poll for status transitions ───────────────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const m = await fetchMatch();
      if (!m || !myUserId) return;
      setMatch(m);

      if (m.status === 'INTRO' && phase === 'lang-select') {
        setPhase('intro');
        startIntroTimer(m);
      }
      if (m.status === 'ROUND1' && (phase === 'lang-select' || phase === 'intro')) {
        clearInterval(timerRef.current);
        setPhase('round1');
        loadRound1(m, myUserId);
      }
      if (m.status === 'ROUND2' && phase === 'round1') {
        clearInterval(timerRef.current);
        setPhase('round2');
        loadRound2(m, myUserId);
      }
      if (['COMPLETED', 'CANCELLED', 'FORFEITED'].includes(m.status) && phase !== 'completed') {
        clearInterval(timerRef.current);
        setPhase('completed');
      }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [phase, myUserId, fetchMatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Intro timer ───────────────────────────────────────────────────────────
  const startIntroTimer = (m: BattleMatch) => {
    clearInterval(timerRef.current);
    if (!m.introDeadlineAt) { setPhase('lang-select'); return; }

    const tick = () => {
      const rem = Math.max(0, Math.ceil((new Date(m.introDeadlineAt!).getTime() - Date.now()) / 1000));
      setIntroCountdown(rem);
      if (rem <= 0) {
        clearInterval(timerRef.current);
        // Server will auto-transition to ROUND1
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  // ── Round 1 ───────────────────────────────────────────────────────────────
  const loadRound1 = (m: BattleMatch, uid: string) => {
    const lang = getMyLanguage(m, uid);
    const qs = getMCQsForLanguage(lang).map(sanitizeMCQ);
    setMcqQuestions(qs);

    // Derive remaining time from server deadline
    if (m.round1DeadlineAt) {
      const rem = Math.max(45, Math.min(45, Math.ceil((new Date(m.round1DeadlineAt).getTime() - Date.now()) / 1000 / qs.length)));
      startQTimer(rem);
    } else {
      startQTimer(45);
    }
  };

  const startQTimer = (secs: number) => {
    clearInterval(timerRef.current);
    setQTimer(secs);
    let rem = secs;
    timerRef.current = setInterval(() => {
      rem--;
      setQTimer(rem);
      if (rem <= 0) {
        clearInterval(timerRef.current);
        advanceQuestion();
      }
    }, 1000);
  };

  const advanceQuestion = () => {
    setCurrentQIdx(prev => {
      const next = prev + 1;
      if (next >= mcqQuestions.length) {
        finishRound1();
        return prev;
      }
      setSelectedAnswer(null);
      startQTimer(45);
      return next;
    });
  };

  const handleSelectAnswer = async (optionIdx: number) => {
    if (isSubmitting || selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);
    setIsSubmitting(true);

    const q = mcqQuestions[currentQIdx];
    try {
      const res = await fetch('/api/battle/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, questionId: q.questionId, selectedIndex: optionIdx, language }),
      });
      const data = await res.json();
      if (data.success) {
        setAnswerResults(prev => ({ ...prev, [q.questionId]: { score: data.data.score, answered: true } }));
      }
    } catch { /* continue */ }
    setIsSubmitting(false);
  };

  const handleNextQ = () => {
    clearInterval(timerRef.current);
    const next = currentQIdx + 1;
    if (next >= mcqQuestions.length) { finishRound1(); return; }
    setCurrentQIdx(next);
    setSelectedAnswer(null);
    startQTimer(45);
  };

  const finishRound1 = async () => {
    clearInterval(timerRef.current);
    setPhase('loading');
    try {
      await fetch('/api/battle/finalize-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, round: 'round1' }),
      });
    } catch { /* continue */ }
    // Poll will pick up ROUND2 transition
  };

  // ── Round 2 ───────────────────────────────────────────────────────────────
  const loadRound2 = (m: BattleMatch, uid: string) => {
    const lang = getMyLanguage(m, uid);
    const qs = getDebugQsForLanguage(lang).map(sanitizeDebugQ);
    setDebugQuestions(qs);
    if (qs.length > 0) setDebugCode(qs[0].starterCode);

    // Per-task timer from server deadline
    if (m.round2DeadlineAt) {
      const totalRem = Math.max(0, Math.ceil((new Date(m.round2DeadlineAt).getTime() - Date.now()) / 1000));
      const perTask = Math.min(BATTLE_CONFIG.ROUND2_TIME_PER_Q, Math.ceil(totalRem / qs.length));
      startR2Timer(perTask);
    } else {
      startR2Timer(BATTLE_CONFIG.ROUND2_TIME_PER_Q);
    }
  };

  const startR2Timer = (secs: number) => {
    clearInterval(timerRef.current);
    setR2Timer(secs);
    let rem = secs;
    timerRef.current = setInterval(() => {
      rem--;
      setR2Timer(rem);
      if (rem <= 0) {
        clearInterval(timerRef.current);
        advanceDebug();
      }
    }, 1000);
  };

  const advanceDebug = () => {
    setCurrentDebugIdx(prev => {
      const next = prev + 1;
      if (next >= debugQuestions.length) { finishRound2(); return prev; }
      setDebugCode(debugQuestions[next].starterCode);
      setTestResults([]);
      startR2Timer(BATTLE_CONFIG.ROUND2_TIME_PER_Q);
      return next;
    });
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTestResults([]);
    const q = debugQuestions[currentDebugIdx];
    try {
      const res = await fetch('/api/battle/submit-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, questionId: q.questionId, language, code: debugCode, roundType: 'round2', runOnly: true }),
      });
      const data = await res.json();
      if (data.success) setTestResults(data.data.results);
    } catch { /* continue */ }
    setIsRunning(false);
  };

  const handleSubmitDebug = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    clearInterval(timerRef.current);
    const q = debugQuestions[currentDebugIdx];
    try {
      const res = await fetch('/api/battle/submit-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, questionId: q.questionId, language, code: debugCode, roundType: 'round2', runOnly: false }),
      });
      const data = await res.json();
      if (data.success) {
        setR2Score(prev => prev + (data.data.score || 0));
        setTestResults(data.data.results);
      }
    } catch { /* continue */ }
    setIsSubmitting(false);
    const next = currentDebugIdx + 1;
    if (next >= debugQuestions.length) {
      finishRound2();
    } else {
      setCurrentDebugIdx(next);
      setDebugCode(debugQuestions[next].starterCode);
      setTestResults([]);
      startR2Timer(BATTLE_CONFIG.ROUND2_TIME_PER_Q);
    }
  };

  const finishRound2 = async () => {
    clearInterval(timerRef.current);
    setPhase('loading');
    try {
      await fetch('/api/battle/finalize-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, round: 'round2' }),
      });
    } catch { /* continue */ }
    // Poll will pick up COMPLETED
  };

  // ── Language selection ────────────────────────────────────────────────────
  const handleLangSelect = async (lang: BattleLanguage) => {
    setLanguage(lang);
    try {
      await fetch('/api/battle/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action: 'select-language', language: lang }),
      });
      setLangSaved(true);
    } catch { /* continue */ }
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(pollRef.current); }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  const p1 = match?.player1;
  const p2 = match?.player2;

  if (phase === 'error') {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-foreground">{errorMsg}</p>
          <button onClick={() => router.push('/dashboard/battle')} className="mt-4 text-primary underline">
            Back to Battle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* ── Loading ── */}
        {phase === 'loading' && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading match...</p>
            </div>
          </div>
        )}

        {/* ── Lang select ── */}
        {phase === 'lang-select' && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-lg w-full px-6">
              <div className="inline-block bg-primary/10 border border-primary/30 rounded-full px-4 py-1 text-primary text-sm font-mono mb-6">
                {p1?.username || '?'} vs {p2?.username || '?'}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Confirm Your Language</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Match will start automatically once both players confirm.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {([
                  { id: 'python' as BattleLanguage, label: 'Python', emoji: '🐍' },
                  { id: 'cpp' as BattleLanguage, label: 'C++', emoji: '⚡' },
                  { id: 'java' as BattleLanguage, label: 'Java', emoji: '☕' },
                ]).map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleLangSelect(l.id)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      language === l.id
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <span className="text-3xl">{l.emoji}</span>
                    <span className="font-medium text-foreground">{l.label}</span>
                    {language === l.id && langSaved && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {langSaved ? '✓ Language saved. Waiting for opponent...' : 'Click a language to confirm your selection.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Intro countdown ── */}
        {phase === 'intro' && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md">
              <div className="flex items-center justify-center gap-8 mb-8">
                <PlayerBubble name={p1?.username || '?'} lang={p1?.language} />
                <div className="text-primary text-3xl font-bold">VS</div>
                <PlayerBubble name={p2?.username || '?'} lang={p2?.language} />
              </div>
              <div className="text-8xl font-bold text-primary font-mono mb-4">
                {String(introCountdown).padStart(2, '0')}
              </div>
              <p className="text-muted-foreground">Battle begins in {introCountdown} second{introCountdown === 1 ? '' : 's'}...</p>
            </div>
          </div>
        )}

        {/* ── Round 1 ── */}
        {phase === 'round1' && (
          <Round1View
            questions={mcqQuestions}
            currentIdx={currentQIdx}
            timer={qTimer}
            selectedAnswer={selectedAnswer}
            answerResults={answerResults}
            isSubmitting={isSubmitting}
            onSelect={handleSelectAnswer}
            onNext={handleNextQ}
          />
        )}

        {/* ── Round 2 ── */}
        {phase === 'round2' && (
          <Round2View
            questions={debugQuestions}
            currentIdx={currentDebugIdx}
            timer={r2Timer}
            code={debugCode}
            language={language}
            testResults={testResults}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            score={r2Score}
            onCodeChange={setDebugCode}
            onRun={handleRunCode}
            onSubmit={handleSubmitDebug}
          />
        )}

        {/* ── Completed ── */}
        {phase === 'completed' && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-sm">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Match Complete!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Both rounds are done. Check the results below.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push(`/dashboard/battle/results/${matchId}`)}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
                >
                  View Results
                </button>
                <button
                  onClick={() => router.push('/dashboard/battle')}
                  className="px-5 py-2 border border-border text-muted-foreground hover:text-foreground rounded-lg text-sm"
                >
                  Back to Battle
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PlayerBubble({ name, lang }: { name: string; lang?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <span className="text-sm font-medium text-foreground">{name}</span>
      {lang && <span className="text-xs text-primary font-mono uppercase">{lang}</span>}
    </div>
  );
}

function Round1View({
  questions, currentIdx, timer, selectedAnswer, answerResults,
  isSubmitting, onSelect, onNext
}: {
  questions: Omit<MCQQuestion, 'correctIndex'>[];
  currentIdx: number;
  timer: number;
  selectedAnswer: number | null;
  answerResults: Record<string, { score: number; answered: boolean }>;
  isSubmitting: boolean;
  onSelect: (i: number) => void;
  onNext: () => void;
}) {
  const q = questions[currentIdx];
  const answered = q ? !!answerResults[q.questionId]?.answered : false;
  const pct = (timer / 45) * 100;
  const timerColor = timer <= 10 ? 'bg-destructive' : timer <= 20 ? 'bg-yellow-500' : 'bg-primary';

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary text-sm font-mono px-3 py-1 rounded-lg">Round 1 · MCQ</span>
          <span className="text-muted-foreground text-sm">{currentIdx + 1} / {questions.length}</span>
        </div>
        <span className={`font-mono font-bold text-lg flex items-center gap-1 ${timer <= 10 ? 'text-destructive' : 'text-foreground'}`}>
          <Clock className="h-4 w-4" />{String(timer).padStart(2, '0')}s
        </span>
      </div>

      <div className="w-full h-2 bg-secondary rounded-full mb-5">
        <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex gap-1 mb-5 flex-wrap">
        {questions.map((q2, i) => (
          <div key={i} className={`h-2 rounded-full flex-1 min-w-[16px] max-w-[32px] transition-colors ${
            i === currentIdx ? 'bg-primary' : answerResults[q2.questionId]?.answered ? 'bg-primary/40' : 'bg-secondary'
          }`} />
        ))}
      </div>

      {q && (
        <>
          <div className="bg-card border border-border rounded-xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <Code2 className="h-3 w-3" />
              <span className="font-mono">Predict the output</span>
            </div>
            <pre className="text-sm text-foreground font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto select-none">
              {q.prompt}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !answered && onSelect(i)}
                disabled={answered || isSubmitting}
                className={`p-4 rounded-xl border-2 text-left transition-all font-mono text-sm ${
                  selectedAnswer === i
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 bg-card text-foreground'
                } ${answered ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
              >
                <span className="text-xs text-muted-foreground mr-2 font-sans">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>

          {answered && (
            <div className={`flex items-center gap-2 mb-4 text-sm ${answerResults[q.questionId]?.score > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              {answerResults[q.questionId]?.score > 0
                ? <><CheckCircle2 className="h-4 w-4" /> +{answerResults[q.questionId].score} points</>
                : <><XCircle className="h-4 w-4" /> 0 points</>
              }
            </div>
          )}

          <button onClick={onNext} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:scale-105 transition-all text-sm">
            {currentIdx + 1 >= questions.length ? 'Finish Round 1' : 'Next Question'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      <div className="mt-5 p-3 bg-secondary/30 rounded-lg text-xs text-muted-foreground">
        Score: {Object.values(answerResults).reduce((a, r) => a + r.score, 0)} pts ·
        Answered: {Object.keys(answerResults).length} / {questions.length}
      </div>
    </div>
  );
}

function Round2View({
  questions, currentIdx, timer, code, language, testResults,
  isRunning, isSubmitting, score, onCodeChange, onRun, onSubmit
}: {
  questions: DebugQuestion[];
  currentIdx: number;
  timer: number;
  code: string;
  language: BattleLanguage;
  testResults: TestResult[];
  isRunning: boolean;
  isSubmitting: boolean;
  score: number;
  onCodeChange: (c: string) => void;
  onRun: () => void;
  onSubmit: () => void;
}) {
  const q = questions[currentIdx];
  const mins = Math.floor(timer / 60);
  const secs = timer % 60;
  const monacoLang = language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'python';
  const timerColor = timer <= 30 ? 'text-destructive' : timer <= 60 ? 'text-yellow-500' : 'text-foreground';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary text-sm font-mono px-3 py-1 rounded-lg">Round 2 · Debug</span>
          <span className="text-muted-foreground text-sm">Task {currentIdx + 1} / {questions.length}</span>
        </div>
        <span className={`font-mono font-bold flex items-center gap-1 ${timerColor}`}>
          <Clock className="h-4 w-4" />{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        <span className="text-xs text-muted-foreground">Score: <span className="text-primary font-bold">{score}</span> pts</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto p-4 space-y-4">
          {q && (
            <>
              <div>
                <h3 className="font-bold text-foreground text-sm mb-2">Task {currentIdx + 1}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{q.prompt}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Buggy Code</h4>
                <pre className="text-xs font-mono bg-secondary/50 rounded-lg p-3 text-foreground leading-relaxed overflow-x-auto">{q.buggyCode}</pre>
              </div>
              {testResults.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Test Results</h4>
                  {testResults.map((r, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs mb-1.5 ${r.passed ? 'text-primary' : 'text-destructive'}`}>
                      {r.passed ? <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" /> : <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                      <div>
                        <div>{r.isHidden ? 'Hidden test' : `Test ${i + 1}`}: {r.passed ? 'PASS' : 'FAIL'}</div>
                        {!r.passed && !r.isHidden && (
                          <div className="text-muted-foreground">Got: {r.actualOutput.slice(0, 40)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language={monacoLang}
              value={code}
              onChange={v => onCodeChange(v || '')}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true }}
            />
          </div>
          <div className="flex items-center gap-3 p-3 border-t border-border bg-card/50">
            <button onClick={onRun} disabled={isRunning || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/50 text-primary hover:bg-primary/10 transition-all text-sm disabled:opacity-50">
              <Play className="h-4 w-4" />{isRunning ? 'Running...' : 'Run Tests'}
            </button>
            <button onClick={onSubmit} disabled={isRunning || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:scale-105 transition-all text-sm btn-glow disabled:opacity-50">
              <Send className="h-4 w-4" />{isSubmitting ? 'Submitting...' : 'Submit & Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-background items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <MatchContent />
    </Suspense>
  );
}
