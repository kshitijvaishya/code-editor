'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">Loading Editor...</div>
});
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
  const [statementTab, setStatementTab] = useState<'statement' | 'submissions'>('statement');
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
  // Flag to track if contest has been terminated (prevents any further actions)
  const [isTerminated, setIsTerminated] = useState(false);
  const terminationInProgressRef = useRef(false);

  // Resizable panels
  const [splitPosition, setSplitPosition] = useState(50); // percentage for statement panel
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setSplitPosition(Math.min(Math.max(pct, 25), 75));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  useEffect(() => {
    loadCurrentUser();
    loadContestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId]);

  // Redirect immediately if contest is terminated
  useEffect(() => {
    if (isTerminated) {
      // Use replace to prevent going back
      router.replace('/dashboard/contests/private');
    }
  }, [isTerminated, router]);

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
        terminateContest('Contest time ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest, hasStarted]);

  // Fullscreen and tab switching detection
  useEffect(() => {
    if (!hasStarted || !contest || isTerminated) return;

    const handleVisibilityChange = () => {
      // IMMEDIATE TERMINATION - No exceptions, no delays
      // document.hidden is true when user switches tabs or minimizes window
      if (document.hidden && !terminationInProgressRef.current) {
        terminationInProgressRef.current = true;
        terminateContest('Tab switching or Alt+Tab detected');
      }
    };

    const handleFullscreenChange = () => {
      // Check multiple fullscreen properties for browser compatibility
      const isFullscreen = document.fullscreenElement || 
                          (document as any).webkitFullscreenElement || 
                          (document as any).mozFullScreenElement || 
                          (document as any).msFullscreenElement;
      
      // IMMEDIATE TERMINATION - Exiting fullscreen not allowed
      if (!isFullscreen && !terminationInProgressRef.current) {
        terminationInProgressRef.current = true;
        terminateContest('Exited fullscreen mode');
      }
    };

    // ESC key handler to detect and prevent fullscreen exit via ESC key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !terminationInProgressRef.current) {
        // Prevent default ESC behavior (would exit fullscreen)
        e.preventDefault();
        e.stopPropagation();
        
        // IMMEDIATE TERMINATION - ESC key pressed
        terminationInProgressRef.current = true;
        terminateContest('Pressed ESC key to exit fullscreen');
      }
    };

    // Using passive: false to ensure events are captured and can be prevented
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: false });
    document.addEventListener('fullscreenchange', handleFullscreenChange, { passive: false });
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange, { passive: false });
    document.addEventListener('mozfullscreenchange', handleFullscreenChange, { passive: false });
    document.addEventListener('MSFullscreenChange', handleFullscreenChange, { passive: false });
    document.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, contest, isTerminated]);

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
          // Check if contest was terminated
          if (startCheckData.terminated) {
            alert('This contest was previously terminated.\n\nYou cannot re-enter. Redirecting to dashboard.');
            router.push('/dashboard/contests/private');
            return;
          }
          
          // User has already started - check if they have submissions
          const hasUserSubmitted = (data.userSubmissions || []).length > 0;
          
          if (hasUserSubmitted) {
            // User already completed - allow viewing results but not re-entry
            // Don't redirect, just prevent starting again
            setShowInstructions(false);
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
    // Prevent submission if contest is terminated
    if (isTerminated || terminationInProgressRef.current) {
      alert('Contest has been terminated. No submissions allowed.');
      router.push('/dashboard/contests/private');
      return;
    }

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
        const currentProblemId = selectedProblem.id;
        setSubmittedProblems(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.add(currentProblemId);
          return newSet;
        });
        
        await loadContestData(); // Refresh data
        
        // Check if all problems have been submitted
        const newSubmittedSet = new Set(Array.from(submittedProblems));
        newSubmittedSet.add(currentProblemId);
        const allProblemsSubmitted = problems.every(p => newSubmittedSet.has(p.id));
        
        if (allProblemsSubmitted) {
          // All problems completed - exit fullscreen and redirect to dashboard
          setTimeout(async () => {
            if (document.fullscreenElement) {
              try {
                await document.exitFullscreen();
              } catch (error) {
                console.error('Failed to exit fullscreen:', error);
              }
            }
            alert('🎉 Congratulations! You have submitted all problems!\n\nYou will be redirected to the dashboard.');
            router.push('/dashboard/contests/private');
          }, 2000);
        }
        // Stay on current problem - user navigates manually
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
    // Prevent running code if contest is terminated
    if (isTerminated || terminationInProgressRef.current) {
      alert('Contest has been terminated. No actions allowed.');
      router.push('/dashboard/contests/private');
      return;
    }

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

  const getDifficultyColor = (_difficulty: string) => {
    return 'text-muted-foreground bg-muted/50 border-border';
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

    if (newWarningCount >= 3) {
      // Auto-submit after 3 violations
      handleAutoSubmit(reason);
    } else {
      // Show warning alert
      alert(`Warning ${newWarningCount}/3: ${reason}\n\nYou have ${3 - newWarningCount} warning(s) remaining before the contest is auto-submitted.`);
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
    alert(`Contest terminated!\n\n${reason}\n\nYour submission has been recorded.`);
  };

  const terminateContest = (reason: string) => {
    if (!contest || terminationInProgressRef.current) return;

    // Set termination flag IMMEDIATELY to block all interactions
    terminationInProgressRef.current = true;
    setIsTerminated(true);
    setHasStarted(false);

    // Exit fullscreen synchronously (don't await)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    // Record termination on the server to prevent re-entry
    fetch('/api/contests/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contestId: contest.id,
        terminated: true
      }),
    }).catch(() => {});

    // Show alert FIRST, then redirect after user acknowledges
    alert(`🚨 Your contest has been terminated!\n\nReason: ${reason}\n\nYou cannot re-enter this contest. You will be redirected to the dashboard.`);
    
    // Redirect after alert is closed
    router.replace('/dashboard/contests/private');
  };

  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      // Try different fullscreen APIs for browser compatibility
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        // Safari
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        // IE11
        await (elem as any).msRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        // Firefox
        await (elem as any).mozRequestFullScreen();
      } else {
        console.warn('Fullscreen API is not supported by this browser');
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      // Continue anyway - fullscreen is encouraged but not required
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
        if (data.terminated) {
          alert('This contest was previously terminated.\n\nYou cannot re-enter.');
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
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading contest...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Contest not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Block all interactions if terminated
  if (isTerminated) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-destructive border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-destructive text-xl font-semibold">Contest Terminated</p>
          <p className="text-muted-foreground mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Only visible when contest hasn't started */}
      {!hasStarted && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header with Real-time Timer */}
        {hasStarted && (
          <div className="bg-card border-b border-border p-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-xl font-bold text-foreground">{contest.name}</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold border rounded ${
                      contest.status === 'live' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                      'bg-muted/50 border-border text-muted-foreground'
                    }`}>
                      🔴 LIVE
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {contest.participants.length} participants
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {problems.length} problems
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Countdown Timer - Centered */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 bg-secondary/50 border border-border rounded-xl px-6 py-3">
                  <Clock className={`h-5 w-5 ${timeRemaining < 300000 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Time Remaining</div>
                    <div className={`text-2xl font-mono font-bold ${
                      timeRemaining < 300000 ? 'text-red-400' : 'text-foreground'
                    }`}>
                      {formatTimeRemaining(timeRemaining)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {/* Tab Navigation */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('problems')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'problems'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-muted'
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
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:bg-muted'
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border-2 border-red-500 rounded-2xl p-5 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-2">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground">⚠️ Important Notice</h2>
                <p className="text-muted-foreground text-sm">Please read carefully before starting</p>
              </div>

              <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-3">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  Contest Security Rules
                </h3>
                <ul className="space-y-1.5 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">🔒</span>
                    <span><strong className="text-foreground">Fullscreen Required</strong> — contest runs in fullscreen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">⛔</span>
                    <span><strong className="text-foreground">No Tab Switching</strong> — switching tabs is prohibited</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">⚠️</span>
                    <span><strong className="text-foreground">Auto-Submission</strong> — violations auto-submit & terminate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">⏱️</span>
                    <span><strong className="text-foreground">Timer Active</strong> — real-time countdown displayed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">🚫</span>
                    <span><strong className="text-foreground">No Exits</strong> — exiting fullscreen terminates contest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">📋</span>
                    <span><strong className="text-foreground">Copy/Paste Disabled</strong> — won&apos;t terminate contest</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-xs">
                  <strong>⚠️ Warning:</strong> By clicking &ldquo;I Understand & Start&rdquo;, you agree to these terms. 
                  Any violation will result in immediate termination and auto-submission.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFullscreenWarning(false)}
                  className="flex-1 px-4 py-2.5 bg-secondary hover:bg-muted text-foreground font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartContest}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  I Understand & Start
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions/Welcome Screen */}
        {showInstructions && !hasStarted && !showFullscreenWarning ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-2xl">
                {/* Contest Header */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-full mb-3">
                    <Trophy className="h-7 w-7 text-primary" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{contest.name}</h1>
                  {contest.description && (
                    <p className="text-muted-foreground text-sm">{contest.description}</p>
                  )}
                </div>

                {/* Contest Stats - Compact row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-secondary/50 border border-border rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{problems.length}</div>
                    <div className="text-xs text-muted-foreground">Problems</div>
                  </div>
                  <div className="bg-secondary/50 border border-border rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{contest.participants.length}</div>
                    <div className="text-xs text-muted-foreground">Participants</div>
                  </div>
                </div>

                {/* Contest Information & Rules - Two column layout */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Contest Information */}
                  <div>
                    <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-400" />
                      Contest Information
                    </h2>
                    <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Start Time:</span>
                        <span className="text-foreground font-medium">{new Date(contest.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">End Time:</span>
                        <span className="text-foreground font-medium">{new Date(contest.endTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="text-foreground font-medium">
                          {Math.floor((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60))} minutes
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`font-semibold ${
                          contest.status === 'live' ? 'text-green-400' :
                          contest.status === 'upcoming' ? 'text-blue-400' :
                          'text-muted-foreground'
                        }`}>
                          {contest.status === 'live' ? '🟢 Live Now' :
                           contest.status === 'upcoming' ? '🔵 Upcoming' :
                           '⚪ Ended'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contest Rules */}
                  <div>
                    <h2 className="text-base font-bold text-foreground mb-2">📋 Contest Rules</h2>
                    <div className="bg-secondary/30 border border-border rounded-lg p-4">
                      <ul className="space-y-1.5 text-sm text-foreground/80">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Solve {problems.length} DSA problems within the duration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Pass all test cases to get full points</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Languages: C, C++, Python, Java, JavaScript</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Score based on problems solved & points earned</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tips - Collapsible/compact */}
                <div className="mb-4">
                  <h2 className="text-base font-bold text-foreground mb-2">💡 Tips for Success</h2>
                  <div className="bg-secondary/30 border border-border rounded-lg p-4">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-sm text-foreground/80">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">✓</span>
                        <span>Read problem statements carefully</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">✓</span>
                        <span>Start with easier problems first</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">✓</span>
                        <span>Test with sample inputs before submitting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">✓</span>
                        <span>Consider edge cases and constraints</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Start Button */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    {contest.status === 'live' ? (
                      <button
                        onClick={handleStartContest}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:brightness-110 text-primary-foreground text-base font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:scale-105 btn-glow"
                      >
                        <Play className="h-5 w-5" />
                        Start Contest
                      </button>
                    ) : contest.status === 'upcoming' ? (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Contest hasn&apos;t started yet</span>
                        </div>
                        <p className="text-muted-foreground mt-3">Come back at {new Date(contest.startTime).toLocaleString()}</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartContest}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-secondary hover:bg-muted text-foreground text-base font-bold rounded-xl transition-all"
                      >
                        View Results & Solutions
                      </button>
                    )}
                    
                    {/* Moderation Button - Only visible to contest host */}
                    {currentUser && contest.creatorId === currentUser.userId && (
                      <button
                        onClick={() => router.push(`/contest/${contestId}/moderate`)}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:brightness-110 text-primary-foreground text-base font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all transform hover:scale-105 btn-glow"
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
                <div className="w-64 border-r border-border bg-card overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Problems</h3>
                    <div className="space-y-2">
                      {problems.map((problem, index) => (
                        <button
                          key={problem.id}
                          onClick={() => handleProblemSelect(problem)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedProblem?.id === problem.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary/50 text-foreground/80 hover:bg-secondary'
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
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                {selectedProblem ? (
                  <div className="flex-1 flex" ref={containerRef}>
                    {/* Problem Statement Panel */}
                    <div className="flex flex-col border-r border-border" style={{ width: `${splitPosition}%` }}>
                      {/* Tabs */}
                      <div className="flex items-center gap-1 px-4 py-3 border-b border-border bg-card">
                        <button
                          onClick={() => setStatementTab('statement')}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            statementTab === 'statement'
                              ? 'bg-secondary text-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          Statement
                        </button>
                        <button
                          onClick={() => setStatementTab('submissions')}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            statementTab === 'submissions'
                              ? 'bg-secondary text-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          Submissions
                          {userSubmissions.filter(s => s.problemId === selectedProblem.id).length > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                              {userSubmissions.filter(s => s.problemId === selectedProblem.id).length}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="flex-1 overflow-y-auto p-6 bg-card">
                        {statementTab === 'statement' ? (
                        <div className="max-w-4xl">
                          <h1 className="text-3xl font-bold text-foreground mb-4">{selectedProblem.title}</h1>
                          

                          <div className="prose prose-invert max-w-none">
                            <div className="text-foreground/80 text-base leading-relaxed whitespace-pre-wrap mb-8">
                              {selectedProblem.description}
                            </div>

                            {selectedProblem.inputFormat && (
                              <div className="mb-8">
                                <h2 className="text-xl font-bold text-foreground mb-4">Input</h2>
                                <div className="text-foreground/80 text-base leading-relaxed">
                                  {selectedProblem.inputFormat}
                                </div>
                              </div>
                            )}

                            {selectedProblem.outputFormat && (
                              <div className="mb-8">
                                <h2 className="text-xl font-bold text-foreground mb-4">Output</h2>
                                <div className="text-foreground/80 text-base leading-relaxed">
                                  {selectedProblem.outputFormat}
                                </div>
                              </div>
                            )}

                            <div className="mb-8">
                              <h2 className="text-xl font-bold text-foreground mb-4">Example</h2>
                              {selectedProblem.examples.map((example, idx) => (
                                <div key={idx} className="mb-6">
                                  <div className="mb-3">
                                    <div className="text-sm font-semibold text-muted-foreground mb-2">Input:</div>
                                    <pre className="bg-secondary border border-border rounded-lg p-4 text-foreground font-mono text-sm overflow-x-auto">
                                      {example.input}
                                    </pre>
                                  </div>
                                  <div className="mb-3">
                                    <div className="text-sm font-semibold text-muted-foreground mb-2">Output:</div>
                                    <pre className="bg-secondary border border-border rounded-lg p-4 text-foreground font-mono text-sm overflow-x-auto">
                                      {example.output}
                                    </pre>
                                  </div>
                                  {example.explanation && (
                                    <div>
                                      <div className="text-sm font-semibold text-muted-foreground mb-2">Explanation:</div>
                                      <div className="text-foreground/80 text-base">{example.explanation}</div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="mb-8">
                              <h2 className="text-xl font-bold text-foreground mb-4">Constraints</h2>
                              <ul className="list-disc list-inside text-foreground/80 space-y-2 text-base">
                                {selectedProblem.constraints.map((constraint, idx) => (
                                  <li key={idx} className="font-mono text-sm">{constraint}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        ) : (
                        /* Submissions Tab Content */
                        <div className="max-w-4xl">
                          <h2 className="text-xl font-bold text-foreground mb-4">Your Submissions</h2>
                          {userSubmissions.filter(s => s.problemId === selectedProblem.id).length === 0 ? (
                            <div className="text-center py-12">
                              <AlertCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                              <p className="text-muted-foreground">No submissions yet for this problem.</p>
                              <p className="text-muted-foreground/60 text-sm mt-1">Write your solution and click Submit to see results here.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {userSubmissions
                                .filter(s => s.problemId === selectedProblem.id)
                                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                                .map((submission, idx) => (
                                  <div key={submission.id || idx} className="bg-secondary/50 border border-border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        {submission.status === 'Accepted' ? (
                                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        ) : (
                                          <XCircle className="h-5 w-5 text-red-400" />
                                        )}
                                        <span className={`font-semibold ${
                                          submission.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                          {submission.status}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(submission.submittedAt).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className="text-foreground/70">
                                        Test Cases: <span className={submission.testsPassed === submission.totalTests ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                                          {submission.testsPassed}/{submission.totalTests}
                                        </span>
                                      </span>
                                      <span className="text-foreground/70">
                                        Points: <span className="text-blue-400 font-semibold">+{submission.points}</span>
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        )}
                      </div>
                    </div>

                    {/* Resizable Divider */}
                    <div
                      onMouseDown={handleMouseDown}
                      className="w-1.5 bg-border hover:bg-primary/60 cursor-col-resize transition-colors flex-shrink-0 relative group"
                    >
                      <div className="absolute inset-y-0 -left-1 -right-1" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-muted-foreground/40 group-hover:bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Code Editor Panel */}
                    <div className="flex flex-col bg-background" style={{ width: `${100 - splitPosition}%` }}>
                      {/* Editor Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                        <div className="flex items-center gap-2">
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium focus:outline-none focus:border-primary"
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
                            disabled={isTerminated || isRunning || !code.trim()}
                            className="px-4 py-2 bg-secondary hover:bg-muted disabled:bg-secondary disabled:text-muted-foreground text-foreground text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            {isRunning ? 'Running...' : 'Run Code'}
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={isTerminated || isSubmitting || !code.trim() || contest.status !== 'live' || (selectedProblem && submittedProblems.has(selectedProblem.id))}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-secondary disabled:text-muted-foreground text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
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
                                    <p className="text-sm text-foreground/80">
                                      <span className="font-semibold">Test Cases: </span>
                                      <span className={submitResult.testsPassed === submitResult.totalTests ? 'text-green-400' : 'text-yellow-400'}>
                                        {submitResult.testsPassed}/{submitResult.totalTests} Passed
                                      </span>
                                    </p>
                                    {submitResult.points !== undefined && (
                                      <p className="text-sm text-foreground/80">
                                        <span className="font-semibold">Points Earned: </span>
                                        <span className="text-blue-400">+{submitResult.points}</span>
                                      </p>
                                    )}
                                    {submitResult.executionTime !== undefined && (
                                      <p className="text-sm text-foreground/80">
                                        <span className="font-semibold">Execution Time: </span>
                                        <span className="text-primary">{submitResult.executionTime.toFixed(2)}ms</span>
                                      </p>
                                    )}
                                  </div>
                                )}
                                {submitResult.message && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {submitResult.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Individual Test Case Results (Pass/Fail only) */}
                          {submitResult.testResults && submitResult.testResults.length > 0 && (
                            <div className="px-4 py-3 border-t border-border/50 max-h-40 overflow-y-auto">
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Test Case Details:</p>
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
                          <MonacoEditor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              padding: { top: 10 },
                              wordWrap: 'on',
                              tabSize: 4,
                              renderLineHighlight: 'line',
                              cursorBlinking: 'smooth',
                              smoothScrolling: true,
                              contextmenu: false,
                              folding: true,
                              lineNumbersMinChars: 3,
                              glyphMargin: false,
                              overviewRulerBorder: false,
                            }}
                          />
                        </div>

                        {/* Input/Output Panels */}
                        <div className="h-48 flex border-t border-border">
                          {/* Input Panel */}
                          <div className="flex-1 flex flex-col border-r border-border">
                            <div className="px-4 py-2 bg-card border-b border-border text-sm font-semibold text-muted-foreground">
                              Input
                            </div>
                            <textarea
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              className="flex-1 p-3 bg-background text-foreground font-mono text-sm resize-none focus:outline-none"
                              placeholder="Enter custom input here..."
                              spellCheck={false}
                            />
                          </div>

                          {/* Output Panel */}
                          <div className="flex-1 flex flex-col">
                            <div className="px-4 py-2 bg-card border-b border-border text-sm font-semibold text-muted-foreground">
                              Output
                            </div>
                            <div className="flex-1 p-3 bg-background text-foreground font-mono text-sm overflow-y-auto whitespace-pre-wrap">
                              {isRunning ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                  Running...
                                </div>
                              ) : (
                                output || <span className="text-muted-foreground/50">Output will appear here...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-card">
                    <div className="text-center">
                      <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">Select a problem to start solving</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
                </div>

                {/* Show results only if published */}
                {!contest?.resultsPublished ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Results Pending</h3>
                    <p className="text-muted-foreground mb-4">
                      The contest has ended. Results will be published by the moderator after reviewing all submissions.
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Check back later to see your ranking and scores.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Test Cases</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Time (ms)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Solved</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {leaderboard.map((participant, index) => (
                            <tr key={participant.userId} className={index < 3 ? 'bg-secondary/50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`font-bold ${
                                  index === 0 ? 'text-yellow-400' :
                                  index === 1 ? 'text-foreground/80' :
                                  index === 2 ? 'text-orange-400' :
                                  'text-muted-foreground'
                                }`}>
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''} #{index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">
                                {participant.username}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-green-400 font-semibold">
                                {participant.totalTestsPassed || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-mono text-sm">
                                {(participant.totalExecutionTime || 0).toFixed(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                {participant.problemsSolved || 0}/{problems.length}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {leaderboard.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No submissions yet
                        </div>
                      )}
                    </div>

                    {/* Ranking Explanation */}
                    <div className="mt-6 bg-secondary/30 border border-border rounded-xl p-6">
                      <h3 className="text-lg font-bold text-foreground mb-3">🏆 How Rankings Work</h3>
                      <ul className="space-y-2 text-foreground/80 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400">1.</span>
                          <span><strong className="text-foreground">Test Cases Passed:</strong> More test cases = Higher rank (partial credit awarded)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">2.</span>
                          <span><strong className="text-foreground">Execution Time:</strong> If tied on test cases, faster solutions rank higher</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">3.</span>
                          <span><strong className="text-foreground">Problems Solved:</strong> If still tied, more fully solved problems rank higher</span>
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
