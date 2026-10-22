'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Swords, Zap, Shield, Trophy, Clock, ChevronRight, Users } from 'lucide-react';

export default function BattleHomePage() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
          {/* Hero */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              1-vs-1 Competitive Coding
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
              BATTLE{' '}
              <span className="text-primary">MODE</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Go head-to-head against another coder. Predict outputs, debug code, and prove
              who writes the cleanest solutions under pressure.
            </p>

            <button
              onClick={() => router.push('/dashboard/battle/queue')}
              className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-all duration-200 btn-glow"
            >
              <Swords className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              Enter Battle Queue
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-sm text-muted-foreground">
              Join the queue · An admin will match you with a live opponent
            </p>
          </div>

          {/* Format cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {[
              {
                icon: Zap,
                label: 'Round 1',
                title: 'Predict Output',
                desc: '15 MCQs — read code, pick the correct output. 45 seconds per question.',
                stat: '11 min 15 sec',
                points: '1,500 pts max',
              },
              {
                icon: Shield,
                label: 'Round 2',
                title: 'Debug the Code',
                desc: '5 tasks — fix bugs in real code. Full editor with run & test.',
                stat: '2 min 30 sec / task',
                points: '1,000 pts max',
              },
              {
                icon: Trophy,
                label: 'Result',
                title: 'Match Winner',
                desc: 'Combined score from both rounds determines the winner. Tie-breaking by round 2 then round 1 score.',
                stat: 'Server-evaluated',
                points: '2,500 pts max',
              },
            ].map((card, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{card.label}</div>
                    <div className="font-bold text-foreground">{card.title}</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{card.desc}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{card.stat}</span>
                  <span className="text-primary font-mono">{card.points}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Scoring */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { n: '100', label: 'pts per MCQ', sub: '×15 questions' },
              { n: '200', label: 'pts per task', sub: '×5 debug tasks' },
              { n: '2,500', label: 'max qualifier', sub: 'combined total' },
            ].map((s, i) => (
              <div key={i} className="bg-secondary/30 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{s.n}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* How matchmaking works */}
          <div className="bg-card border border-border rounded-2xl p-7 mb-10">
            <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              How Matchmaking Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Join Queue', desc: 'Select language, click Join' },
                { step: '2', title: 'Admin Matches', desc: 'Admin pairs you with an opponent' },
                { step: '3', title: 'Language Lock', desc: 'Confirm language, 10-second countdown' },
                { step: '4', title: 'Battle!', desc: 'Round 1 → Round 2 → Results' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/dashboard/battle/queue')}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all btn-glow"
            >
              <Swords className="h-5 w-5" />
              Join Battle Queue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
