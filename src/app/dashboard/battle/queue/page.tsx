'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  Wifi, Clock, Swords, X, RefreshCw, CheckCircle2,
  AlertTriangle, ChevronRight, Users
} from 'lucide-react';
import { BattleLanguage, BATTLE_CONFIG } from '@/lib/battleTypes';

type QueueStatus = 'idle' | 'queued' | 'matched' | 'playing' | 'error';

interface QueueEntry {
  queueId: string;
  status: string;
  joinedAt: string;
  queueDeadlineAt: string;
  matchId?: string;
  language: BattleLanguage;
}

interface MatchInfo {
  matchId: string;
  status: string;
  player1: { userId: string; username: string; language?: string };
  player2: { userId: string; username: string; language?: string };
  introDeadlineAt?: string;
}

function QueueContent() {
  const router = useRouter();

  const [queueStatus, setQueueStatus] = useState<QueueStatus>('idle');
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [error, setError] = useState('');
  const [selectedLang, setSelectedLang] = useState<BattleLanguage>('python');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Countdown from joinedAt + 30s (queue notify timer)
  const [waitSeconds, setWaitSeconds] = useState(0);
  const pollRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  // ── Queue countdown timer ─────────────────────────────────────────────────
  const startWaitTimer = useCallback((joinedAt: string) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 1000);
      setWaitSeconds(secs);
    }, 1000);
  }, []);

  // ── Poll for status updates ───────────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/battle/queue');
      const data = await res.json();
      if (!data.success) return;

      const e: QueueEntry | null = data.data.entry;
      const m: MatchInfo | null = data.data.match;

      setEntry(e);
      setMatch(m);

      if (!e) {
        setQueueStatus('idle');
        clearInterval(timerRef.current);
        return;
      }

      if (e.status === 'QUEUED') {
        setQueueStatus('queued');
        startWaitTimer(e.joinedAt);
      } else if (e.status === 'MATCHED') {
        setQueueStatus('matched');
        clearInterval(timerRef.current);
        // Navigate to match as soon as it moves to INTRO/ROUND1
        if (m && m.status !== 'PENDING') {
          clearInterval(pollRef.current);
          router.push(`/dashboard/battle/match/${m.matchId}`);
        }
      } else if (e.status === 'PLAYING') {
        setQueueStatus('playing');
        if (m) {
          clearInterval(pollRef.current);
          router.push(`/dashboard/battle/match/${m.matchId}`);
        }
      }
    } catch {
      // ignore transient poll errors
    }
  }, [router, startWaitTimer]);

  useEffect(() => {
    // Check if already in queue on mount
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [poll]);

  const handleJoin = async () => {
    setIsJoining(true);
    setError('');
    try {
      const res = await fetch('/api/battle/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLang }),
      });
      const data = await res.json();
      if (data.success) {
        setEntry(data.data.entry);
        setQueueStatus('queued');
        startWaitTimer(data.data.entry.joinedAt);
      } else {
        setError(data.error || 'Failed to join queue');
      }
    } catch {
      setError('Network error — please try again');
    }
    setIsJoining(false);
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    setError('');
    try {
      const res = await fetch('/api/battle/queue', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQueueStatus('idle');
        setEntry(null);
        setMatch(null);
        clearInterval(timerRef.current);
        setWaitSeconds(0);
      } else {
        setError(data.error || 'Cannot leave queue right now');
      }
    } catch {
      setError('Network error — please try again');
    }
    setIsLeaving(false);
  };

  const formatWait = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  const langs: { id: BattleLanguage; label: string; emoji: string; desc: string }[] = [
    { id: 'python', label: 'Python', emoji: '🐍', desc: 'Python 3.10' },
    { id: 'cpp', label: 'C++', emoji: '⚡', desc: 'GCC 10.2' },
    { id: 'java', label: 'Java', emoji: '☕', desc: 'Java 15' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
          {/* ── Idle — join form ──────────────────────────────────────── */}
          {queueStatus === 'idle' && (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-primary text-sm font-medium mb-4">
                  <Swords className="h-4 w-4" />
                  Battle Queue
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Join the Queue</h1>
                <p className="text-muted-foreground">
                  Select your language and join. An admin will match you with an opponent.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Language selection */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-foreground mb-4">Choose Your Language</h2>
                <div className="grid grid-cols-3 gap-3">
                  {langs.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLang(l.id)}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                        ${selectedLang === l.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 bg-secondary/30'
                        }
                      `}
                    >
                      <span className="text-2xl">{l.emoji}</span>
                      <span className="font-medium text-sm text-foreground">{l.label}</span>
                      <span className="text-xs text-muted-foreground">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Match format preview */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Swords className="h-4 w-4 text-primary" />
                  What to expect
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Round 1: 15 output-prediction MCQs · 45s each
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Round 2: 5 debug tasks · 2:30 each · full code editor
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Winner determined by combined score
                  </div>
                </div>
              </div>

              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all btn-glow disabled:opacity-50 disabled:hover:scale-100"
              >
                <Swords className="h-5 w-5" />
                {isJoining ? 'Joining Queue...' : 'Join Battle Queue'}
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* ── Queued — waiting for admin to match ───────────────────── */}
          {(queueStatus === 'queued' || queueStatus === 'matched') && (
            <>
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-4 ${
                  queueStatus === 'matched'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-primary/10 border border-primary/30 text-primary'
                }`}>
                  {queueStatus === 'matched'
                    ? <><CheckCircle2 className="h-4 w-4" /> Opponent Found!</>
                    : <><Wifi className="h-4 w-4 animate-pulse" /> Searching for opponent...</>
                  }
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {queueStatus === 'matched' ? 'Match Found!' : 'You\'re in the Queue'}
                </h1>
                <p className="text-muted-foreground">
                  {queueStatus === 'matched'
                    ? 'Your match is being prepared. Redirecting...'
                    : 'An admin will match you with an opponent shortly.'
                  }
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Queue status card */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-xl">
                    <div className="text-3xl font-bold font-mono text-primary mb-1">
                      {formatWait(waitSeconds)}
                    </div>
                    <div className="text-xs text-muted-foreground">Waiting time</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-xl">
                    <div className="text-3xl font-mono font-bold text-foreground mb-1 uppercase">
                      {entry?.language || selectedLang}
                    </div>
                    <div className="text-xs text-muted-foreground">Your language</div>
                  </div>
                </div>

                {waitSeconds >= BATTLE_CONFIG.QUEUE_NOTIFY_AFTER && queueStatus === 'queued' && (
                  <div className="mt-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 text-yellow-400 text-xs">
                    <Clock className="h-3 w-3" />
                    Admin has been notified that you&apos;ve been waiting over 30 seconds.
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground text-xs">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Auto-refreshing every 3 seconds
                </div>
              </div>

              {/* Match found detail */}
              {queueStatus === 'matched' && match && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-2">
                        <span className="text-primary-foreground font-bold text-sm">
                          {match.player1.username.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground">{match.player1.username}</div>
                    </div>
                    <div className="text-2xl font-bold text-primary">VS</div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-2">
                        <span className="text-primary-foreground font-bold text-sm">
                          {match.player2.username.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground">{match.player2.username}</div>
                    </div>
                  </div>
                  <div className="text-center mt-3 text-xs text-muted-foreground">
                    <RefreshCw className="inline h-3 w-3 animate-spin mr-1" />
                    Waiting for match to start...
                  </div>
                </div>
              )}

              {/* Leave queue (only if QUEUED, not MATCHED) */}
              {queueStatus === 'queued' && (
                <div className="text-center">
                  <button
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all text-sm"
                  >
                    <X className="h-4 w-4" />
                    {isLeaving ? 'Leaving...' : 'Leave Queue'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function QueuePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-background items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <QueueContent />
    </Suspense>
  );
}
