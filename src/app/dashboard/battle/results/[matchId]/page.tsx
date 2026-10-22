'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  Trophy, Crown, Medal, Swords, CheckCircle2, XCircle,
  RefreshCw, ChevronLeft, Award, Star
} from 'lucide-react';

interface MatchResult {
  matchId: string;
  userId: string;
  username: string;
  opponentId: string;
  opponentUsername: string;
  round1Score: number;
  round2Score: number;
  totalScore: number;
  isWinner: boolean;
  isDraw: boolean;
  completedAt: string;
}

interface BattleMatch {
  matchId: string;
  status: string;
  player1: { userId: string; username: string; language?: string };
  player2: { userId: string; username: string; language?: string };
  round1Scores: Record<string, number>;
  round2Scores: Record<string, number>;
  winnerId?: string;
  isDraw?: boolean;
  endedAt?: string;
}

function ResultsContent() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<BattleMatch | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [myUserId, setMyUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/battle/leaderboard?matchId=${matchId}`);
      const data = await res.json();
      if (data.success) {
        setMatch(data.data.match);
        setResults(data.data.results || []);
      } else {
        setError(data.error || 'Failed to load results');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    fetchData();
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setMyUserId(d.user?.userId || d.user?.id || '');
    });
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Match not found'}</p>
          <button onClick={() => router.push('/dashboard/battle')} className="text-primary underline">
            Back to Battle
          </button>
        </div>
      </div>
    );
  }

  const p1 = match.player1;
  const p2 = match.player2;
  const p1r1 = match.round1Scores?.[p1.userId] || 0;
  const p2r1 = match.round1Scores?.[p2.userId] || 0;
  const p1r2 = match.round2Scores?.[p1.userId] || 0;
  const p2r2 = match.round2Scores?.[p2.userId] || 0;
  const p1Total = p1r1 + p1r2;
  const p2Total = p2r1 + p2r2;

  const winner = match.winnerId === p1.userId ? p1 : match.winnerId === p2.userId ? p2 : null;
  const myResult = results.find(r => r.userId === myUserId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/3 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.push('/dashboard/battle')}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Battle Home
            </button>
          </div>

          {/* Your outcome */}
          {myResult && (
            <div className={`text-center mb-8 p-6 rounded-2xl border ${
              myResult.isWinner
                ? 'bg-yellow-400/10 border-yellow-400/30'
                : myResult.isDraw
                ? 'bg-primary/10 border-primary/30'
                : 'bg-secondary/30 border-border'
            }`}>
              <div className="text-4xl mb-2">
                {myResult.isWinner ? '🏆' : myResult.isDraw ? '🤝' : '💪'}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {myResult.isWinner ? 'You Won!' : myResult.isDraw ? "It's a Draw!" : 'You Lost'}
              </h1>
              <p className="text-muted-foreground text-sm">
                vs {myResult.opponentUsername} · Your score: {myResult.totalScore} pts
              </p>
            </div>
          )}

          {/* VS card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
            {/* Match header */}
            <div className="px-6 py-4 border-b border-border bg-secondary/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono uppercase">
                  Match Result
                </span>
                {match.isDraw && (
                  <span className="text-xs bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                    Draw
                  </span>
                )}
                {winner && (
                  <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {winner.username} wins
                  </span>
                )}
              </div>
            </div>

            {/* Player comparison */}
            <div className="grid grid-cols-3 divide-x divide-border">
              {/* Player 1 */}
              <div className={`p-6 text-center ${match.winnerId === p1.userId ? 'bg-yellow-400/5' : ''}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl text-primary-foreground ${
                  match.winnerId === p1.userId
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                    : 'bg-gradient-to-br from-primary to-accent'
                }`}>
                  {p1.username.slice(0, 2).toUpperCase()}
                </div>
                {match.winnerId === p1.userId && <Crown className="h-4 w-4 text-yellow-400 mx-auto mb-1" />}
                <div className="font-bold text-foreground text-sm">{p1.username}</div>
                <div className="text-xs text-muted-foreground mt-1 uppercase font-mono">{p1.language || '?'}</div>
                {p1.userId === myUserId && (
                  <div className="mt-1 text-xs text-primary">You</div>
                )}
                <div className="mt-3 text-2xl font-bold text-foreground">{p1Total}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>

              {/* Scores breakdown */}
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { label: 'Round 1', s1: p1r1, s2: p2r1 },
                    { label: 'Round 2', s1: p1r2, s2: p2r2 },
                    { label: 'Total', s1: p1Total, s2: p2Total, bold: true },
                  ].map(row => (
                    <div key={row.label} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">{row.label}</div>
                      <div className={`flex items-center justify-between text-sm ${row.bold ? 'font-bold text-primary' : 'text-foreground'}`}>
                        <span>{row.s1}</span>
                        <span className="text-muted-foreground text-xs">vs</span>
                        <span>{row.s2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player 2 */}
              <div className={`p-6 text-center ${match.winnerId === p2.userId ? 'bg-yellow-400/5' : ''}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl text-primary-foreground ${
                  match.winnerId === p2.userId
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                    : 'bg-gradient-to-br from-primary to-accent'
                }`}>
                  {p2.username.slice(0, 2).toUpperCase()}
                </div>
                {match.winnerId === p2.userId && <Crown className="h-4 w-4 text-yellow-400 mx-auto mb-1" />}
                <div className="font-bold text-foreground text-sm">{p2.username}</div>
                <div className="text-xs text-muted-foreground mt-1 uppercase font-mono">{p2.language || '?'}</div>
                {p2.userId === myUserId && (
                  <div className="mt-1 text-xs text-primary">You</div>
                )}
                <div className="mt-3 text-2xl font-bold text-foreground">{p2Total}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
            </div>
          </div>

          {/* Score breakdown table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Score Breakdown
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/20">
                <tr>
                  <th className="px-5 py-2 text-left text-xs text-muted-foreground">Player</th>
                  <th className="px-4 py-2 text-right text-xs text-muted-foreground">Round 1</th>
                  <th className="px-4 py-2 text-right text-xs text-muted-foreground">Round 2</th>
                  <th className="px-4 py-2 text-right text-xs text-muted-foreground">Total</th>
                  <th className="px-4 py-2 text-center text-xs text-muted-foreground">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[p1, p2].map(pl => {
                  const r1 = match.round1Scores?.[pl.userId] || 0;
                  const r2 = match.round2Scores?.[pl.userId] || 0;
                  const tot = r1 + r2;
                  const isW = match.winnerId === pl.userId;
                  return (
                    <tr key={pl.userId} className={`${pl.userId === myUserId ? 'bg-primary/5' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                            {pl.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{pl.username}</span>
                          {pl.userId === myUserId && (
                            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{r1}</td>
                      <td className="px-4 py-3 text-right font-mono">{r2}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-primary">{tot}</td>
                      <td className="px-4 py-3 text-center">
                        {isW ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded-full px-2 py-0.5">
                            <Crown className="h-3 w-3" />Winner
                          </span>
                        ) : match.isDraw ? (
                          <span className="text-xs text-muted-foreground">Draw</span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <XCircle className="h-3 w-3" />Lost
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard/battle/queue')}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all btn-glow"
            >
              <Swords className="h-5 w-5" />
              Play Again
            </button>
            <button
              onClick={() => router.push('/dashboard/battle')}
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Battle Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-background items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
