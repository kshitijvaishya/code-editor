'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CreateContestModal from '@/components/CreateContestModal';
import JoinContestModal from '@/components/JoinContestModal';
import JoinCodeSuccessDialog from '@/components/JoinCodeSuccessDialog';
import ContestCard from '@/components/ContestCard';
import { Contest } from '@/lib/contest';
import { Plus, UserPlus, Trophy, AlertCircle } from 'lucide-react';

export default function PrivateContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [createdContest, setCreatedContest] = useState<{ name: string; joinCode: string } | null>(null);
  const [contestStats, setContestStats] = useState<Record<string, { rank: number; score: number; hasSubmitted: boolean }>>({});

  useEffect(() => {
    const initializePage = async () => {
      await loadUser();
    };
    initializePage();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadContests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Refresh contests when page becomes visible (after returning from contest)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser) {
        loadContests();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadContests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contests/my-contests');
      const data = await response.json();
      console.log('Contests loaded:', data);
      if (data.success) {
        // Recalculate status for each contest on client side
        const contestsWithUpdatedStatus = (data.contests || []).map((contest: Contest) => {
          const now = new Date();
          const start = new Date(contest.startTime);
          const end = new Date(contest.endTime);
          
          let status: 'upcoming' | 'live' | 'ended' = 'upcoming';
          if (now < start) {
            status = 'upcoming';
          } else if (now >= start && now <= end) {
            status = 'live';
          } else {
            status = 'ended';
          }
          
          return { ...contest, status };
        });
        
        setContests(contestsWithUpdatedStatus);
        
        // Load stats for each contest
        const stats: Record<string, { rank: number; score: number; hasSubmitted: boolean }> = {};
        for (const contest of contestsWithUpdatedStatus) {
          try {
            const statsResponse = await fetch(`/api/contests/details?id=${contest.id}`);
            const statsData = await statsResponse.json();
            if (statsData.success) {
              const userSubmissions = statsData.userSubmissions || [];
              const leaderboard = statsData.leaderboard || [];
              const hasSubmitted = userSubmissions.length > 0;
              
              // Find user's rank
              const userIndex = leaderboard.findIndex((p: any) => p.userId === currentUser?.userId);
              const rank = userIndex >= 0 ? userIndex + 1 : 0;
              const score = userIndex >= 0 ? leaderboard[userIndex].score : 0;
              
              stats[contest.id] = { rank, score, hasSubmitted };
            }
          } catch (error) {
            console.error(`Failed to load stats for contest ${contest.id}:`, error);
          }
        }
        setContestStats(stats);
      }
    } catch (error) {
      console.error('Failed to load contests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (joinCode: string, contestName: string) => {
    setCreatedContest({ name: contestName, joinCode });
    setShowSuccessDialog(true);
    loadContests();
  };

  const handleJoinSuccess = () => {
    setSuccessMessage('Successfully joined the contest!');
    setTimeout(() => setSuccessMessage(''), 5000);
    loadContests();
  };

  const currentUserId = currentUser?.userId;
  const myContests = contests;
  const createdContests = contests.filter(c => c.creatorId === currentUserId);
  const joinedContests = contests.filter(c => c.creatorId !== currentUserId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="min-h-full p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Private Contests</h1>
            </div>
            <p className="text-muted-foreground">Create or join private contests with a unique join code</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-400 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex items-center justify-center gap-3 p-6 bg-primary hover:brightness-110 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 btn-glow"
            >
              <Plus className="h-6 w-6" />
              <span className="text-lg font-semibold">Create New Contest</span>
            </button>
            
            <button
              onClick={() => setShowJoinModal(true)}
              className="group flex items-center justify-center gap-3 p-6 border-2 border-border hover:bg-secondary text-foreground rounded-xl transition-all hover:border-primary/50"
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-lg font-semibold">Join with Code</span>
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Loading contests...</p>
            </div>
          )}

          {/* Contest Lists */}
          {!isLoading && contests.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Contests Yet</h3>
              <p className="text-muted-foreground/70">Create a new contest or join one with a code to get started</p>
            </div>
          )}

          {!isLoading && contests.length > 0 && (
            <>
              {createdContests.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    My Created Contests
                    <span className="text-sm font-normal text-muted-foreground">({createdContests.length})</span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {createdContests.map((contest) => (
                      <ContestCard 
                        key={contest.id} 
                        contest={contest} 
                        isCreator={true}
                        userRank={contestStats[contest.id]?.rank}
                        userScore={contestStats[contest.id]?.score}
                        hasSubmitted={contestStats[contest.id]?.hasSubmitted}
                        onDelete={loadContests}
                      />
                    ))}
                  </div>
                </div>
              )}

              {joinedContests.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    Joined Contests
                    <span className="text-sm font-normal text-muted-foreground">({joinedContests.length})</span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {joinedContests.map((contest) => (
                      <ContestCard 
                        key={contest.id} 
                        contest={contest} 
                        isCreator={false}
                        userRank={contestStats[contest.id]?.rank}
                        userScore={contestStats[contest.id]?.score}
                        hasSubmitted={contestStats[contest.id]?.hasSubmitted}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateContestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
      <JoinContestModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleJoinSuccess}
      />
      <JoinCodeSuccessDialog
        isOpen={showSuccessDialog}
        joinCode={createdContest?.joinCode || ''}
        contestName={createdContest?.name || ''}
        onClose={() => {
          setShowSuccessDialog(false);
          setCreatedContest(null);
        }}
      />
    </div>
  );
}
