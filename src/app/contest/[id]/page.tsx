'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Contest } from '@/lib/contest';
import { Problem, getProblemById } from '@/lib/problems';
import { Play, Trophy, Users, Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

interface Submission {
  id: string;
  problemId: string;
  status: string;
  testsPassed: number;
  totalTests: number;
  submittedAt: string;
  points: number;
}

export default function ContestPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.id as string;

  const [contest, setContest] = useState<Contest | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard'>('problems');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [warningCount, setWarningCount] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  // Track submitted problems and their test results
  const [submittedProblems, setSubmittedProblems] = useState<Set<string>>(new Set());
  const [problemTestResults, setProblemTestResults] = useState<{[problemId: string]: any}>({});


  useEffect(() => {
    loadCurrentUser();
    loadContestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId]);

  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  // Update contest status every 5 seconds if contest is upcoming
  useEffect(() => {
    if (!contest || contest.status !== 'upcoming') return;

    const updateStatus = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);
      
      let newStatus: 'upcoming' | 'live' | 'ended' = 'upcoming';
      if (now < start) {
        newStatus = 'upcoming';
      } else if (now >= start && now <= end) {
        newStatus = 'live';
      } else {
        newStatus = 'ended';
      }

      if (newStatus !== contest.status) {
        setContest({ ...contest, status: newStatus });
      }
    };

    const interval = setInterval(updateStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [contest]);

  // Real-time countdown timer
  useEffect(() => {
    if (!contest || !hasStarted) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(contest.endTime);
      const diff = end.getTime() - now.getTime();
      setTimeRemaining(Math.max(0, diff));

      if (diff <= 0) {
        handleAutoSubmit('Contest time ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest, hasStarted]);

  // Fullscreen and tab switching detection
  useEffect(() => {
    if (!hasStarted || !contest) return;

    const handleVisibilityChange = () => {
      if (document.hidden && hasStarted) {
        handleViolation('Tab switching detected');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted) {
        handleViolation('Exited fullscreen mode');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, contest]);

  const loadContestData = async () => {
    try {
      const response = await fetch(`/api/contests/details?id=${contestId}`);
      const data = await response.json();

      if (data.success) {
        const contestData = data.contest;
        
        // Recalculate contest status on client side
        const now = new Date();
        const start = new Date(contestData.startTime);
        const end = new Date(contestData.endTime);
        
        if (now < start) {
          contestData.status = 'upcoming';
        } else if (now >= start && now <= end) {
          contestData.status = 'live';
        } else {
          contestData.status = 'ended';
        }
        
        setContest(contestData);
        setLeaderboard(data.leaderboard || []);
        setUserSubmissions(data.userSubmissions || []);

        // Check if user has already started this contest
        const startCheckResponse = await fetch(`/api/contests/start?contestId=${contestId}`);
        const startCheckData = await startCheckResponse.json();
        
        if (startCheckData.success && startCheckData.hasStarted) {
          // User has already started - check if they have submissions
          const hasUserSubmitted = (data.userSubmissions || []).length > 0;
          
          if (hasUserSubmitted) {
            // User already completed - allow viewing results but not re-entry
            // Don't redirect, just prevent starting again
            setShowInstructions(false);
            setActiveTab('leaderboard');
          } else if (contestData.status === 'live') {
            // User started but abandoned and contest is still live - prevent re-entry
            alert('You already started this contest!\n\nFor security reasons, you cannot re-enter. View your results on the dashboard.');
            router.push('/dashboard/contests/private');
            return;
          }
        }

        // Load problems
        const loadedProblems = contestData.problemIds
          .map((id: string) => getProblemById(id))
          .filter((p: Problem | undefined): p is Problem => p !== undefined);
        
        setProblems(loadedProblems);
        if (loadedProblems.length > 0 && !selectedProblem) {
          setSelectedProblem(loadedProblems[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load contest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProblem || !contest) return;

    // Check if already submitted for this problem
    if (submittedProblems.has(selectedProblem.id)) {
      alert('You have already submitted a solution for this problem. Only one submission is allowed per problem in contests.');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/contests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestId: contest.id,
          problemId: selectedProblem.id,
          code,
          language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show test results immediately (no redirect)
        setSubmitResult(data.submission);
        
        // Mark problem as submitted
        setSubmittedProblems(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.add(selectedProblem.id);
          return newSet;
        });
        
        loadContestData(); // Refresh data
      } else {
        setSubmitResult({ status: 'Error', message: data.message });
      }
    } catch (error) {
      setSubmitResult({ status: 'Error', message: 'Failed to submit solution' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    setOutput('');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          input: customInput,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput(data.output || 'Program completed successfully with no output.');
      } else {
        setOutput(`Error: ${data.error || 'Failed to execute code'}`);
      }
    } catch (error) {
      setOutput(`Error: Failed to run code. Please try again.`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleProblemSelect = (problem: Problem) => {
    // If switching to a different problem, clear the code editor and submit result
    if (selectedProblem && selectedProblem.id !== problem.id) {
      setCode('');
      setSubmitResult(null);
      setOutput('');
      setCustomInput('');
    }
    setSelectedProblem(problem);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case 'Wrong Answer':
      case 'Compilation Error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    }
  };

  const isProblemSolved = (problemId: string) => {
    return userSubmissions.some(s => s.problemId === problemId && s.status === 'Accepted');
  };

  const handleViolation = (reason: string) => {
    const newWarningCount = warningCount + 1;
    setWarningCount(newWarningCount);

    if (newWarningCount >= 1) {
      // Auto-submit on first violation
      handleAutoSubmit(reason);
    }
  };

  const handleAutoSubmit = async (reason: string) => {
    if (!contest) return;

    // Set flag to prevent multiple submissions
    setHasStarted(false);

    // Exit fullscreen if still in it
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }

    // Always submit to mark contest as completed (even if no code)
    const problemToSubmit = selectedProblem || problems[0];
    const codeToSubmit = code.trim() || '// Contest terminated - no submission';
    
    if (problemToSubmit) {
      try {
        await fetch('/api/contests/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contestId: contest.id,
            problemId: problemToSubmit.id,
            code: codeToSubmit,
            language,
          }),
        });
      } catch (error) {
        console.error('Auto-submit failed:', error);
      }
    }

    // Reload contest data to show updated results
    await loadContestData();
    
    // Show alert about termination
    alert(`Contest terminated!\n\n${reason}\n\nYour submission has been recorded. Check the leaderboard for your rank.`);
  };

  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const handleStartContest = () => {
    setShowFullscreenWarning(true);
  };

  const confirmStartContest = async () => {
    setShowFullscreenWarning(false);
    
    // Record that user has started the contest
    try {
      const response = await fetch('/api/contests/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestId: contest?.id }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        if (data.alreadyStarted) {
          alert('You have already started this contest!\n\nFor security reasons, you cannot re-enter.');
          router.push('/dashboard/contests/private');
          return;
        }
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to record contest start:', error);
      alert('Failed to start contest. Please try again.');
      return;
    }
    
    await enterFullscreen();
    setShowInstructions(false);
    setHasStarted(true);
  };

  const getTotalPoints = () => {
    return problems.reduce((sum, p) => sum + p.points, 0);
  };

  const getTimeRemaining = () => {
    if (!contest) return '';
    const now = new Date();
    const end = new Date(contest.endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Contest Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading contest...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400">Contest not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar - Only visible when contest hasn't started */}
      {!hasStarted && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header with Real-time Timer */}
        {hasStarted && (
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-xl font-bold text-white">{contest.name}</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold border rounded ${
                      contest.status === 'live' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                      'bg-gray-500/10 border-gray-500/30 text-gray-400'
                    }`}>
                      🔴 LIVE
                    </span>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {contest.participants.length} participants
                    </span>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {problems.length} problems
                    </span>
                  </div>
                </div>

                {/* Real-time Countdown Timer */}
                <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-xl px-6 py-3">
                  <Clock className={`h-5 w-5 ${timeRemaining < 300000 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Time Remaining</div>
                    <div className={`text-2xl font-mono font-bold ${
                      timeRemaining < 300000 ? 'text-red-400' : 'text-white'
                    }`}>
                      {formatTimeRemaining(timeRemaining)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Tab Navigation */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('problems')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'problems'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Problems
                  </button>
                  {/* Show leaderboard only if results are published */}
                  {contest?.resultsPublished && (
                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'leaderboard'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Leaderboard
                    </button>
                  )}
                </div>

                {/* Warning: Fullscreen Lock Indicator */}
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">Fullscreen Locked</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Warning Modal */}
        {showFullscreenWarning && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="bg-gray-900 border-2 border-red-500 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">⚠️ Important Notice</h2>
                <p className="text-gray-400 text-lg">Please read carefully before starting</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  Contest Security Rules
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">🔒</span>
                    <span><strong className="text-white">Fullscreen Mode Required:</strong> The contest will run in fullscreen mode</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">⛔</span>
                    <span><strong className="text-white">No Tab Switching:</strong> Switching to another tab/window is strictly prohibited</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">⚠️</span>
                    <span><strong className="text-white">Auto-Submission:</strong> Violating any rule will auto-submit your test and terminate the contest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">⏱️</span>
                    <span><strong className="text-white">Time Monitored:</strong> Real-time countdown timer will be displayed throughout</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">🚫</span>
                    <span><strong className="text-white">No Exits Allowed:</strong> Exiting fullscreen will terminate your contest immediately</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 font-bold">📋</span>
                    <span><strong className="text-white">Copy/Paste Disabled:</strong> Copy-paste operations are disabled for security but won&apos;t terminate the contest</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  <strong>⚠️ Warning:</strong> By clicking &ldquo;I Understand & Start&rdquo;, you agree to these terms. 
                  Any violation will result in immediate test termination and auto-submission of current progress.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowFullscreenWarning(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartContest}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  I Understand & Start Contest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions/Welcome Screen */}
        {showInstructions && !hasStarted && !showFullscreenWarning ? (
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
            <Sidebar />
            <div className="max-w-4xl w-full">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                {/* Contest Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-4">
                    <Trophy className="h-10 w-10 text-purple-400" />
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">{contest.name}</h1>
                  {contest.description && (
                    <p className="text-gray-400 text-lg">{contest.description}</p>
                  )}
                </div>

                {/* Contest Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">{problems.length}</div>
                    <div className="text-sm text-gray-400">Problems</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{getTotalPoints()}</div>
                    <div className="text-sm text-gray-400">Total Points</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">{contest.participants.length}</div>
                    <div className="text-sm text-gray-400">Participants</div>
                  </div>
                </div>

                {/* Contest Information */}
                <div className="space-y-6 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                      Contest Information
                    </h2>
                    <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Start Time:</span>
                        <span className="text-white font-medium">{new Date(contest.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">End Time:</span>
                        <span className="text-white font-medium">{new Date(contest.endTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white font-medium">
                          {Math.floor((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60))} minutes
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`font-semibold ${
                          contest.status === 'live' ? 'text-green-400' :
                          contest.status === 'upcoming' ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {contest.status === 'live' ? '🟢 Live Now' :
                           contest.status === 'upcoming' ? '🔵 Upcoming' :
                           '⚪ Ended'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">📋 Contest Rules</h2>
                    <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Solve {problems.length} DSA problems within the contest duration</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Each problem has test cases - pass all to get full points</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Supported languages: C, C++, Python, Java, JavaScript</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Your score is based on problems solved and points earned</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Check the leaderboard to see your ranking</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>Time limits and memory limits apply to each problem</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">💡 Tips for Success</h2>
                    <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                          <span className="text-yellow-400">✓</span>
                          <span>Read problem statements carefully and understand all constraints</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-yellow-400">✓</span>
                          <span>Start with easier problems to build momentum</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-yellow-400">✓</span>
                          <span>Test your code with sample inputs before submitting</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-yellow-400">✓</span>
                          <span>Consider edge cases and corner scenarios</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-yellow-400">✓</span>
                          <span>Optimize your solution if getting Time Limit Exceeded</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4">
                    {contest.status === 'live' ? (
                      <button
                        onClick={handleStartContest}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all transform hover:scale-105"
                      >
                        <Play className="h-6 w-6" />
                        Start Contest
                      </button>
                    ) : contest.status === 'upcoming' ? (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Contest hasn&apos;t started yet</span>
                        </div>
                        <p className="text-gray-400 mt-3">Come back at {new Date(contest.startTime).toLocaleString()}</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartContest}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold rounded-xl transition-all"
                      >
                        View Results & Solutions
                      </button>
                    )}
                    
                    {/* Moderation Button - Only visible to contest host */}
                    {currentUser && contest.creatorId === currentUser.userId && (
                      <button
                        onClick={() => router.push(`/contest/${contestId}/moderate`)}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:scale-105"
                      >
                        <Shield className="h-6 w-6" />
                        Moderation Panel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Contest Problem Solving Interface */
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'problems' ? (
              <div className="flex-1 flex">
                {/* Left Sidebar - Problem List */}
                <div className="w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Problems</h3>
                    <div className="space-y-2">
                      {problems.map((problem, index) => (
                        <button
                          key={problem.id}
                          onClick={() => handleProblemSelect(problem)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedProblem?.id === problem.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs font-semibold">Problem {index + 1}</span>
                            <div className="flex items-center gap-1">
                              {submittedProblems.has(problem.id) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                              )}
                              {isProblemSolved(problem.id) && (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-medium mb-1">{problem.title}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-1.5 py-0.5 rounded ${
                              problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                              problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {problem.difficulty}
                            </span>
                            <span className="text-gray-500">{problem.points} pts</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                {selectedProblem ? (
                  <div className="flex-1 flex">
                    {/* Problem Statement Panel */}
                    <div className="flex-1 flex flex-col border-r border-gray-800">
                      {/* Tabs */}
                      <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-800 bg-gray-900">
                        <button className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg">
                          Statement
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg">
                          Submissions
                        </button>
                      </div>

                      {/* Problem Content */}
                      <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
                        <div className="max-w-4xl">
                          <h1 className="text-3xl font-bold text-white mb-4">{selectedProblem.title}</h1>
                          
                          <div className="flex items-center gap-3 mb-6">
                            <span className={`px-3 py-1 text-sm font-medium rounded-lg ${
                              selectedProblem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                              selectedProblem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                              'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              {selectedProblem.difficulty}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">{selectedProblem.points} points</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">Time: {selectedProblem.timeLimit}s</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">Memory: {selectedProblem.memoryLimit}MB</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-blue-400 font-medium">{selectedProblem.testCases.length} Test Cases</span>
                          </div>

                          <div className="prose prose-invert max-w-none">
                            <div className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap mb-8">
                              {selectedProblem.description}
                            </div>

                            <div className="mb-8">
                              <h2 className="text-xl font-bold text-white mb-4">Input</h2>
                              <div className="text-gray-300 text-base">
                                See problem description for input format details.
                              </div>
                            </div>

                            <div className="mb-8">
                              <h2 className="text-xl font-bold text-white mb-4">Output</h2>
                              <div className="text-gray-300 text-base">
                                See problem description for output format details.
                              </div>
                            </div>

                            <div className="mb-8">
                              <h2 className="text-xl font-bold text-white mb-4">Example</h2>
                              {selectedProblem.examples.map((example, idx) => (
                                <div key={idx} className="mb-6">
                                  <div className="mb-3">
                                    <div className="text-sm font-semibold text-gray-400 mb-2">Input:</div>
                                    <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm overflow-x-auto">
                                      {example.input}
                                    </pre>
                                  </div>
                                  <div className="mb-3">
                                    <div className="text-sm font-semibold text-gray-400 mb-2">Output:</div>
                                    <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm overflow-x-auto">
                                      {example.output}
                                    </pre>
                                  </div>
                                  {example.explanation && (
                                    <div>
                                      <div className="text-sm font-semibold text-gray-400 mb-2">Explanation:</div>
                                      <div className="text-gray-300 text-base">{example.explanation}</div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="mb-8">
                              <h2 className="text-xl font-bold text-white mb-4">Constraints</h2>
                              <ul className="list-disc list-inside text-gray-300 space-y-2 text-base">
                                {selectedProblem.constraints.map((constraint, idx) => (
                                  <li key={idx} className="font-mono text-sm">{constraint}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Code Editor Panel */}
                    <div className="w-1/2 flex flex-col bg-gray-950">
                      {/* Editor Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
                        <div className="flex items-center gap-2">
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-medium focus:outline-none focus:border-purple-500"
                          >
                            <option value="python">Python3</option>
                            <option value="javascript">JavaScript</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="c">C</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRunCode}
                            disabled={isRunning || !code.trim()}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            {isRunning ? 'Running...' : 'Run Code'}
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !code.trim() || contest.status !== 'live' || (selectedProblem && submittedProblems.has(selectedProblem.id))}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {selectedProblem && submittedProblems.has(selectedProblem.id) ? 'Submitted' : (isSubmitting ? 'Submitting...' : 'Submit')}
                          </button>
                        </div>
                      </div>

                      {/* Submission Result */}
                      {submitResult && (
                        <div className={`border-b ${
                          submitResult.status === 'Accepted'
                            ? 'bg-green-500/10 border-green-500/30'
                            : submitResult.status === 'Error'
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-yellow-500/10 border-yellow-500/30'
                        }`}>
                          <div className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {submitResult.status === 'Accepted' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                              ) : submitResult.status === 'Error' ? (
                                <XCircle className="h-5 w-5 text-red-400" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                              )}
                              <div className="flex-1">
                                <p className={`font-semibold ${
                                  submitResult.status === 'Accepted' ? 'text-green-400' :
                                  submitResult.status === 'Error' ? 'text-red-400' :
                                  'text-yellow-400'
                                }`}>
                                  {submitResult.status}
                                </p>
                                {submitResult.testsPassed !== undefined && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-300">
                                      <span className="font-semibold">Test Cases: </span>
                                      <span className={submitResult.testsPassed === submitResult.totalTests ? 'text-green-400' : 'text-yellow-400'}>
                                        {submitResult.testsPassed}/{submitResult.totalTests} Passed
                                      </span>
                                    </p>
                                    {submitResult.points !== undefined && (
                                      <p className="text-sm text-gray-300">
                                        <span className="font-semibold">Points Earned: </span>
                                        <span className="text-blue-400">+{submitResult.points}</span>
                                      </p>
                                    )}
                                    {submitResult.executionTime !== undefined && (
                                      <p className="text-sm text-gray-300">
                                        <span className="font-semibold">Execution Time: </span>
                                        <span className="text-purple-400">{submitResult.executionTime.toFixed(2)}ms</span>
                                      </p>
                                    )}
                                  </div>
                                )}
                                {submitResult.message && (
                                  <p className="text-sm text-gray-400 mt-1">
                                    {submitResult.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Individual Test Case Results (Pass/Fail only) */}
                          {submitResult.testResults && submitResult.testResults.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-700/50 max-h-40 overflow-y-auto">
                              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Test Case Details:</p>
                              <div className="space-y-1.5">
                                {submitResult.testResults.map((testResult: any, index: number) => (
                                  <div 
                                    key={index}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    {testResult.passed ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                    )}
                                    <span className={testResult.passed ? 'text-green-400' : 'text-red-400'}>
                                      Test Case {index + 1}: {testResult.passed ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Code Editor and Panels */}
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Code Editor */}
                        <div className="flex-1 overflow-hidden">
                          <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full p-4 bg-gray-950 text-white font-mono text-sm resize-none focus:outline-none"
                            placeholder="// Write your code here..."
                            spellCheck={false}
                          />
                        </div>

                        {/* Input/Output Panels */}
                        <div className="h-48 flex border-t border-gray-800">
                          {/* Input Panel */}
                          <div className="flex-1 flex flex-col border-r border-gray-800">
                            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 text-sm font-semibold text-gray-400">
                              Input
                            </div>
                            <textarea
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              className="flex-1 p-3 bg-gray-950 text-white font-mono text-sm resize-none focus:outline-none"
                              placeholder="Enter custom input here..."
                              spellCheck={false}
                            />
                          </div>

                          {/* Output Panel */}
                          <div className="flex-1 flex flex-col">
                            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 text-sm font-semibold text-gray-400">
                              Output
                            </div>
                            <div className="flex-1 p-3 bg-gray-950 text-white font-mono text-sm overflow-y-auto whitespace-pre-wrap">
                              {isRunning ? (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                  Running...
                                </div>
                              ) : (
                                output || <span className="text-gray-600">Output will appear here...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="px-4 py-2 border-t border-gray-800 bg-gray-900 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Time Limit: {selectedProblem.timeLimit}s • Memory Limit: {selectedProblem.memoryLimit}MB</span>
                          <span>{contest.status === 'live' ? getTimeRemaining() : 'Contest Ended'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">Select a problem to start solving</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
                </div>

                {/* Show results only if published */}
                {!contest?.resultsPublished ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Results Pending</h3>
                    <p className="text-gray-400 mb-4">
                      The contest has ended. Results will be published by the moderator after reviewing all submissions.
                    </p>
                    <p className="text-sm text-gray-500">
                      Check back later to see your ranking and scores.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Test Cases</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time (ms)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Solved</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {leaderboard.map((participant, index) => (
                            <tr key={participant.userId} className={index < 3 ? 'bg-gray-800/50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`font-bold ${
                                  index === 0 ? 'text-yellow-400' :
                                  index === 1 ? 'text-gray-300' :
                                  index === 2 ? 'text-orange-400' :
                                  'text-gray-400'
                                }`}>
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''} #{index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                                {participant.username}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-green-400 font-semibold">
                                {participant.totalTestsPassed || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-mono text-sm">
                                {(participant.totalExecutionTime || 0).toFixed(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                {participant.problemsSolved || 0}/{problems.length}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {leaderboard.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                          No submissions yet
                        </div>
                      )}
                    </div>

                    {/* Ranking Explanation */}
                    <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-3">🏆 How Rankings Work</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400">1.</span>
                          <span><strong className="text-white">Test Cases Passed:</strong> More test cases = Higher rank (partial credit awarded)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">2.</span>
                          <span><strong className="text-white">Execution Time:</strong> If tied on test cases, faster solutions rank higher</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">3.</span>
                          <span><strong className="text-white">Problems Solved:</strong> If still tied, more fully solved problems rank higher</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
