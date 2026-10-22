'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  Users, Swords, Shield, Clock, CheckCircle2, XCircle,
  RefreshCw, Play, Trash2, Search, AlertTriangle, Zap,
  X, ChevronRight, Activity
} from 'lucide-react';

interface QueueEntry {
  queueId: string;
  userId: string;
  username: string;
  email: string;
  language: string;
  status: string;
  joinedAt: string;
  queueDeadlineAt: string;
  lastHeartbeatAt: string;
  matchId?: string;
}

interface BattleMatch {
  matchId: string;
  groupLabel?: string;
  status: string;
  player1: { userId: string; username: string; email: string; language?: string };
  player2: { userId: string; username: string; email: string; language?: string };
  round1Scores: Record<string, number>;
  round2Scores: Record<string, number>;
  winnerId?: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  round1DeadlineAt?: string;
  round2DeadlineAt?: string;
}

type Tab = 'queue' | 'active' | 'history';

function formatWait(joinedAt: string): string {
  const secs = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 1000);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

function formatTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function isConnected(lastHeartbeat: string): boolean {
  return Date.now() - new Date(lastHeartbeat).getTime() < 60_000;
}

function getMatchCountdown(deadline?: string): string {
  if (!deadline) return '—';
  const rem = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000));
  const m = Math.floor(rem / 60);
  const s = rem % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AdminMatchmakerPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('queue');
  const [queued, setQueued] = useState<QueueEntry[]>([]);
  const [activeMatches, setActiveMatches] = useState<BattleMatch[]>([]);
  const [recentMatches, setRecentMatches] = useState<BattleMatch[]>([]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Selection for matchmaking
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Search/filter
  const [search, setSearch] = useState('');

  // Cancel/remove modal
  const [confirmModal, setConfirmModal] = useState<{
    type: 'cancel-match' | 'remove-queue';
    id: string;
    name: string;
  } | null>(null);

  const pollRef = useRef<NodeJS.Timeout>();
  const [tickCounter, setTickCounter] = useState(0);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/battle/admin');
      if (res.status === 401) { router.push('/dashboard'); return; }
      if (res.status === 403) { setError('Access denied — admin only'); setLoading(false); return; }
      const data = await res.json();
      if (data.success) {
        setQueued(data.data.queued || []);
        setActiveMatches(data.data.activeMatches || []);
        setRecentMatches(data.data.recentMatches || []);
        setQueuedCount(data.data.queuedCount || 0);
        setError('');
      } else {
        setError(data.error || 'Failed to load');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchDashboard();
    pollRef.current = setInterval(() => {
      fetchDashboard();
      setTickCounter(t => t + 1); // force countdown re-render
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchDashboard]);

  const showFeedback = (success: string | null, err: string | null) => {
    if (success) { setActionSuccess(success); setTimeout(() => setActionSuccess(''), 3000); }
    if (err) { setActionError(err); setTimeout(() => setActionError(''), 5000); }
  };

  const handleCreateMatch = async () => {
    const ids = Array.from(selected);
    if (ids.length !== 2) return;
    setActionLoading('create');
    try {
      const res = await fetch('/api/battle/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-match', player1Id: ids[0], player2Id: ids[1] }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('Match created successfully!', null);
        setSelected(new Set());
        fetchDashboard();
      } else {
        showFeedback(null, data.error || 'Failed to create match');
      }
    } catch {
      showFeedback(null, 'Network error');
    }
    setActionLoading('');
  };

  const handleStartMatch = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      const res = await fetch('/api/battle/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start-match', matchId }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('Match started! Players see 10-second countdown.', null);
        fetchDashboard();
      } else {
        showFeedback(null, data.error || 'Failed to start match');
      }
    } catch {
      showFeedback(null, 'Network error');
    }
    setActionLoading('');
  };

  const handleCancelMatch = async (matchId: string, reason = 'Cancelled by admin') => {
    setActionLoading(matchId);
    try {
      const res = await fetch('/api/battle/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel-match', matchId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('Match cancelled.', null);
        fetchDashboard();
      } else {
        showFeedback(null, data.error || 'Failed to cancel');
      }
    } catch {
      showFeedback(null, 'Network error');
    }
    setActionLoading('');
    setConfirmModal(null);
  };

  const handleRemoveQueue = async (queueId: string) => {
    setActionLoading(queueId);
    try {
      const res = await fetch('/api/battle/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove-queue', queueId }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback('Player removed from queue.', null);
        setSelected(prev => { const s = new Set(prev); s.delete(queueId); return s; });
        fetchDashboard();
      } else {
        showFeedback(null, data.error || 'Failed to remove');
      }
    } catch {
      showFeedback(null, 'Network error');
    }
    setActionLoading('');
    setConfirmModal(null);
  };

  const handleReconcile = async () => {
    setActionLoading('reconcile');
    await fetch('/api/battle/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reconcile' }),
    });
    showFeedback('Reconciled expired matches.', null);
    fetchDashboard();
    setActionLoading('');
  };

  const toggleSelect = (userId: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      if (s.has(userId)) s.delete(userId);
      else if (s.size < 2) s.add(userId);
      return s;
    });
  };

  const filteredQueue = queued.filter(e =>
    e.status === 'QUEUED' &&
    (search === '' ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.userId.toLowerCase().includes(search.toLowerCase()))
  );

  const matchedInQueue = queued.filter(e => e.status === 'MATCHED' || e.status === 'PLAYING');

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error === 'Access denied — admin only') {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-4">This page requires admin privileges.</p>
          <button onClick={() => router.push('/dashboard')} className="text-primary underline">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-xs text-primary font-mono uppercase tracking-wider">Admin</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Battle Matchmaker</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReconcile}
                disabled={actionLoading === 'reconcile'}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${actionLoading === 'reconcile' ? 'animate-spin' : ''}`} />
                Reconcile
              </button>
              <button
                onClick={fetchDashboard}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Feedback toasts */}
          {actionSuccess && (
            <div className="mb-4 flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg text-sm">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {actionSuccess}
            </div>
          )}
          {actionError && (
            <div className="mb-4 flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {actionError}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Queued', value: queuedCount, icon: Users, color: 'text-primary' },
              { label: 'Matched', value: matchedInQueue.length, icon: Swords, color: 'text-yellow-400' },
              { label: 'Active Matches', value: activeMatches.length, icon: Activity, color: 'text-green-400' },
              { label: 'Completed', value: recentMatches.filter(m => m.status === 'COMPLETED').length, icon: CheckCircle2, color: 'text-muted-foreground' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6">
            {([
              { id: 'queue', label: 'Queue', count: queuedCount },
              { id: 'active', label: 'Active Matches', count: activeMatches.length },
              { id: 'history', label: 'History', count: recentMatches.length },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-mono ${
                  tab === t.id ? 'bg-primary-foreground/20' : 'bg-secondary'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* ── QUEUE TAB ─────────────────────────────────────────────────────── */}
          {tab === 'queue' && (
            <div>
              {/* Matchmaking toolbar */}
              {selected.size > 0 && (
                <div className="mb-4 flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-xl px-5 py-3">
                  <span className="text-primary text-sm font-medium">
                    {selected.size} player{selected.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex-1" />
                  {selected.size === 2 && (
                    <button
                      onClick={handleCreateMatch}
                      disabled={!!actionLoading}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:scale-105 transition-all btn-glow disabled:opacity-50"
                    >
                      <Swords className="h-4 w-4" />
                      {actionLoading === 'create' ? 'Creating...' : 'Create Match'}
                    </button>
                  )}
                  {selected.size < 2 && (
                    <span className="text-muted-foreground text-sm">Select one more player to create a match</span>
                  )}
                  <button onClick={() => setSelected(new Set())} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Players table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-secondary/20">
                  <div className="grid grid-cols-[28px_1fr_1fr_80px_100px_80px_80px_80px] gap-3 text-xs text-muted-foreground font-medium uppercase">
                    <div />
                    <div>Player</div>
                    <div>Email</div>
                    <div>Language</div>
                    <div>Wait Time</div>
                    <div>Connection</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                </div>

                {filteredQueue.length === 0 ? (
                  <div className="px-5 py-12 text-center text-muted-foreground text-sm">
                    <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    {search ? 'No players match your search.' : 'No players in queue.'}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredQueue.map(entry => {
                      const isWaiting30 = Date.now() - new Date(entry.joinedAt).getTime() > 30_000;
                      const connected = isConnected(entry.lastHeartbeatAt);
                      const isSelected = selected.has(entry.userId);

                      return (
                        <div
                          key={entry.queueId}
                          className={`px-5 py-3 grid grid-cols-[28px_1fr_1fr_80px_100px_80px_80px_80px] gap-3 items-center transition-colors ${
                            isSelected ? 'bg-primary/5' : 'hover:bg-secondary/30'
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleSelect(entry.userId)}
                            disabled={!isSelected && selected.size >= 2}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-border hover:border-primary/50'
                            } disabled:opacity-40`}
                          >
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                          </button>

                          {/* Name */}
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                                {entry.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{entry.username}</div>
                                <div className="text-xs text-muted-foreground font-mono">{entry.userId.slice(0, 12)}...</div>
                              </div>
                            </div>
                          </div>

                          {/* Email */}
                          <div className="text-xs text-muted-foreground truncate">{entry.email}</div>

                          {/* Language */}
                          <div className="text-xs font-mono text-foreground uppercase">{entry.language}</div>

                          {/* Wait */}
                          <div className={`text-xs font-mono ${isWaiting30 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                            {formatWait(entry.joinedAt)}
                            {isWaiting30 && ' ⚠'}
                          </div>

                          {/* Connection */}
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                            <span className={`text-xs ${connected ? 'text-green-400' : 'text-muted-foreground'}`}>
                              {connected ? 'Live' : 'Idle'}
                            </span>
                          </div>

                          {/* Status */}
                          <div>
                            <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
                              {entry.status}
                            </span>
                          </div>

                          {/* Actions */}
                          <div>
                            <button
                              onClick={() => setConfirmModal({ type: 'remove-queue', id: entry.queueId, name: entry.username })}
                              disabled={!!actionLoading}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Remove from queue"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Matched/Playing section */}
              {matchedInQueue.length > 0 && (
                <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-border bg-secondary/20">
                    <h3 className="text-sm font-bold text-foreground">Matched / Playing</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {matchedInQueue.map(e => (
                      <div key={e.queueId} className="px-5 py-3 flex items-center gap-4">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {e.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{e.username}</div>
                          <div className="text-xs text-muted-foreground">{e.email}</div>
                        </div>
                        <span className={`text-xs border rounded-full px-2 py-0.5 ${
                          e.status === 'PLAYING'
                            ? 'text-green-400 border-green-400/30 bg-green-400/10'
                            : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                        }`}>
                          {e.status}
                        </span>
                        {e.matchId && (
                          <span className="text-xs text-muted-foreground font-mono">
                            Match: {e.matchId.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVE MATCHES TAB ────────────────────────────────────────────── */}
          {tab === 'active' && (
            <div className="space-y-4">
              {activeMatches.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl px-6 py-12 text-center">
                  <Swords className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground text-sm">No active matches right now.</p>
                </div>
              ) : (
                activeMatches.map(match => {
                  const p1Total = (match.round1Scores?.[match.player1.userId] || 0) + (match.round2Scores?.[match.player1.userId] || 0);
                  const p2Total = (match.round1Scores?.[match.player2.userId] || 0) + (match.round2Scores?.[match.player2.userId] || 0);

                  const currentDeadline = match.status === 'ROUND2'
                    ? match.round2DeadlineAt
                    : match.status === 'ROUND1'
                    ? match.round1DeadlineAt
                    : undefined;

                  return (
                    <div key={match.matchId} className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/20">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            match.status === 'ROUND1' || match.status === 'ROUND2' ? 'bg-green-400 animate-pulse' :
                            match.status === 'INTRO' ? 'bg-yellow-400 animate-pulse' : 'bg-muted-foreground'
                          }`} />
                          <span className="font-mono text-xs text-muted-foreground">
                            {match.matchId.slice(0, 8)}...
                          </span>
                          {match.groupLabel && (
                            <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5">
                              Group {match.groupLabel}
                            </span>
                          )}
                          <span className={`text-xs border rounded-full px-2 py-0.5 ${
                            match.status === 'ROUND1' || match.status === 'ROUND2'
                              ? 'text-green-400 border-green-400/30 bg-green-400/10'
                              : match.status === 'INTRO'
                              ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                              : 'text-muted-foreground border-border'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {currentDeadline && (
                            <div className="flex items-center gap-1 text-sm font-mono text-foreground">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {getMatchCountdown(currentDeadline)}
                            </div>
                          )}
                          {match.status === 'PENDING' && (
                            <button
                              onClick={() => handleStartMatch(match.matchId)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:scale-105 transition-all btn-glow disabled:opacity-50"
                            >
                              <Zap className="h-3.5 w-3.5" />
                              {actionLoading === match.matchId ? 'Starting...' : 'Start Match'}
                            </button>
                          )}
                          {['PENDING', 'INTRO', 'ROUND1', 'ROUND2'].includes(match.status) && (
                            <button
                              onClick={() => setConfirmModal({ type: 'cancel-match', id: match.matchId, name: `${match.player1.username} vs ${match.player2.username}` })}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Players */}
                      <div className="grid grid-cols-3 divide-x divide-border">
                        {[
                          { p: match.player1, score: p1Total, r1: match.round1Scores?.[match.player1.userId] || 0, r2: match.round2Scores?.[match.player1.userId] || 0 },
                          null,
                          { p: match.player2, score: p2Total, r1: match.round1Scores?.[match.player2.userId] || 0, r2: match.round2Scores?.[match.player2.userId] || 0 },
                        ].map((item, i) => {
                          if (item === null) {
                            return (
                              <div key="vs" className="flex items-center justify-center py-4">
                                <span className="text-xl font-bold text-primary">VS</span>
                              </div>
                            );
                          }
                          return (
                            <div key={i} className="p-5 text-center">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-2 text-primary-foreground font-bold">
                                {item.p.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="font-medium text-foreground text-sm">{item.p.username}</div>
                              <div className="text-xs text-muted-foreground">{item.p.email}</div>
                              <div className="text-xs text-primary font-mono mt-0.5">{item.p.language || '?'}</div>
                              <div className="mt-3 grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                                <div><div className="font-mono text-foreground">{item.r1}</div><div>R1</div></div>
                                <div><div className="font-mono text-foreground">{item.r2}</div><div>R2</div></div>
                                <div><div className="font-mono font-bold text-primary">{item.score}</div><div>Total</div></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── HISTORY TAB ───────────────────────────────────────────────────── */}
          {tab === 'history' && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-secondary/20">
                <div className="grid grid-cols-[1fr_1fr_80px_80px_100px_80px] gap-3 text-xs text-muted-foreground font-medium uppercase">
                  <div>Player 1</div>
                  <div>Player 2</div>
                  <div>R1 Scores</div>
                  <div>R2 Scores</div>
                  <div>Status</div>
                  <div>Ended</div>
                </div>
              </div>

              {recentMatches.length === 0 ? (
                <div className="px-5 py-12 text-center text-muted-foreground text-sm">
                  No completed matches yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentMatches.map(match => {
                    const p1r1 = match.round1Scores?.[match.player1.userId] || 0;
                    const p2r1 = match.round1Scores?.[match.player2.userId] || 0;
                    const p1r2 = match.round2Scores?.[match.player1.userId] || 0;
                    const p2r2 = match.round2Scores?.[match.player2.userId] || 0;

                    return (
                      <div key={match.matchId}
                        className="px-5 py-3 grid grid-cols-[1fr_1fr_80px_80px_100px_80px] gap-3 items-center hover:bg-secondary/20 cursor-pointer transition-colors"
                        onClick={() => router.push(`/dashboard/battle/results/${match.matchId}`)}
                      >
                        <div className="flex items-center gap-2">
                          {match.winnerId === match.player1.userId && <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                          <div>
                            <div className="text-sm font-medium text-foreground">{match.player1.username}</div>
                            <div className="text-xs text-muted-foreground font-mono uppercase">{match.player1.language || '?'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {match.winnerId === match.player2.userId && <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                          <div>
                            <div className="text-sm font-medium text-foreground">{match.player2.username}</div>
                            <div className="text-xs text-muted-foreground font-mono uppercase">{match.player2.language || '?'}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-center">
                          {p1r1} – {p2r1}
                        </div>
                        <div className="text-xs font-mono text-center">
                          {p1r2} – {p2r2}
                        </div>
                        <div>
                          <span className={`text-xs border rounded-full px-2 py-0.5 ${
                            match.status === 'COMPLETED'
                              ? 'text-primary border-primary/30 bg-primary/10'
                              : 'text-muted-foreground border-border'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatTime(match.endedAt)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <h3 className="font-bold text-foreground">Confirm Action</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              {confirmModal.type === 'cancel-match'
                ? `Cancel match "${confirmModal.name}"? Both players will be notified and removed from the match.`
                : `Remove "${confirmModal.name}" from the queue?`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmModal.type === 'cancel-match') handleCancelMatch(confirmModal.id);
                  else handleRemoveQueue(confirmModal.id);
                }}
                className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 border border-border text-muted-foreground py-2 rounded-lg text-sm hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
