'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Users, Code, CheckCircle2, XCircle, Clock, Trophy, FileCode, ChevronDown, ChevronUp } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  points: number;
}

interface Submission {
  id: string;
  userId: string;
  username: string;
  problemId: string;
  status: string;
  language: string;
  code: string;
  testsPassed: number;
  totalTests: number;
  submittedAt: string;
  executionTime?: number;
  points: number;
}

interface ProblemSubmissions {
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  submissions: Submission[];
  bestSubmission?: Submission;
}

interface Participant {
  userId: string;
  username: string;
  score: number;
  problemsSolved: number;
  totalSubmissions: number;
  submissionsByProblem: { [key: string]: ProblemSubmissions };
}

interface Contest {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  resultsPublished?: boolean;
}

interface ModerationData {
  contest: Contest;
  problems: Problem[];
  participants: Participant[];
  totalSubmissions: number;
}

export default function ModerationPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.id as string;

  const [data, setData] = useState<ModerationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [expandedParticipants, setExpandedParticipants] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'participants' | 'problems'>('participants');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadModerationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId]);

  const loadModerationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/contests/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contestId }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to load moderation data');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParticipant = (userId: string) => {
    const newExpanded = new Set(expandedParticipants);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedParticipants(newExpanded);
  };

  const viewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const closeSubmissionViewer = () => {
    setSelectedSubmission(null);
  };

  const handlePublishResults = async () => {
    if (!confirm('Are you sure you want to publish the results? Participants will be able to see their scores and the leaderboard.')) {
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch('/api/contests/publish-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestId }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Results published successfully! Participants can now view the leaderboard.');
        loadModerationData(); // Refresh data
      } else {
        alert(result.message || 'Failed to publish results');
      }
    } catch (error) {
      alert('An error occurred while publishing results');
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600';
      case 'Wrong Answer':
        return 'text-red-600';
      case 'Time Limit Exceeded':
        return 'text-orange-600';
      case 'Runtime Error':
        return 'text-purple-600';
      case 'Compilation Error':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Wrong Answer':
      case 'Compilation Error':
      case 'Runtime Error':
        return <XCircle className="w-4 h-4" />;
      case 'Time Limit Exceeded':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/contest/${contestId}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{data.contest.name}</h1>
                <p className="text-sm text-gray-600">Moderation Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium">Total Submissions</div>
                <div className="text-2xl font-bold text-indigo-900">{data.totalSubmissions}</div>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Participants</div>
                <div className="text-2xl font-bold text-green-900">{data.participants.length}</div>
              </div>
              {/* Publish Results Button */}
              {data.contest.status === 'ended' && !data.contest.resultsPublished && (
                <button
                  onClick={handlePublishResults}
                  disabled={isPublishing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  {isPublishing ? 'Publishing...' : 'Publish Results'}
                </button>
              )}
              {data.contest.resultsPublished && (
                <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Results Published</span>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => setViewMode('participants')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'participants'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              By Participants
            </button>
            <button
              onClick={() => setViewMode('problems')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'problems'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileCode className="w-4 h-4 inline mr-2" />
              By Problems
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {viewMode === 'participants' ? (
            /* Participants View */
            <div className="space-y-4">
              {data.participants.map((participant) => (
                <div key={participant.userId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Participant Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleParticipant(participant.userId)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 rounded-full p-3">
                        <Users className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{participant.username}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            <Trophy className="w-4 h-4 inline mr-1" />
                            Score: {participant.score}
                          </span>
                          <span className="text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 inline mr-1" />
                            Solved: {participant.problemsSolved}
                          </span>
                          <span className="text-sm text-gray-600">
                            <Code className="w-4 h-4 inline mr-1" />
                            Submissions: {participant.totalSubmissions}
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedParticipants.has(participant.userId) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Participant Submissions */}
                  {expandedParticipants.has(participant.userId) && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      {Object.values(participant.submissionsByProblem).map((problemData: any) => (
                        <div key={problemData.problemId} className="mb-4 last:mb-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {problemData.problemTitle}
                              <span className={`ml-2 text-xs px-2 py-1 rounded ${getDifficultyColor(problemData.problemDifficulty)}`}>
                                {problemData.problemDifficulty}
                              </span>
                            </h4>
                            <span className="text-sm text-gray-600">
                              {problemData.submissions.length} submission(s)
                            </span>
                          </div>

                          {problemData.submissions.length > 0 ? (
                            <div className="space-y-2">
                              {problemData.submissions.map((submission: Submission) => (
                                <div
                                  key={submission.id}
                                  className="bg-white border border-gray-200 rounded p-3 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <span className={`flex items-center space-x-1 font-medium ${getStatusColor(submission.status)}`}>
                                          {getStatusIcon(submission.status)}
                                          <span>{submission.status}</span>
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          {submission.testsPassed}/{submission.totalTests} tests
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          {submission.language}
                                        </span>
                                        {submission.executionTime && (
                                          <span className="text-xs text-gray-500">
                                            {submission.executionTime}ms
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {new Date(submission.submittedAt).toLocaleString()}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => viewSubmission(submission)}
                                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                                    >
                                      View Code
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No submissions yet</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {data.participants.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No participants yet</p>
                </div>
              )}
            </div>
          ) : (
            /* Problems View */
            <div className="space-y-6">
              {data.problems.map((problem) => {
                const allSubmissionsForProblem = data.participants
                  .flatMap(p => p.submissionsByProblem[problem.id]?.submissions || []);

                return (
                  <div key={problem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{problem.title}</h3>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-sm text-gray-600">
                            <Trophy className="w-4 h-4 inline mr-1" />
                            {problem.points} points
                          </span>
                          <span className="text-sm text-gray-600">
                            {allSubmissionsForProblem.length} submission(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    {allSubmissionsForProblem.length > 0 ? (
                      <div className="space-y-3">
                        {allSubmissionsForProblem.map((submission) => (
                          <div
                            key={submission.id}
                            className="border border-gray-200 rounded p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <span className="font-medium text-gray-900">{submission.username}</span>
                                  <span className={`flex items-center space-x-1 font-medium ${getStatusColor(submission.status)}`}>
                                    {getStatusIcon(submission.status)}
                                    <span>{submission.status}</span>
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {submission.testsPassed}/{submission.totalTests} tests
                                  </span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {submission.language}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(submission.submittedAt).toLocaleString()}
                                </div>
                              </div>
                              <button
                                onClick={() => viewSubmission(submission)}
                                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                              >
                                View Code
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-4">No submissions yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Code Viewer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedSubmission.username}&apos;s Submission
                </h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`flex items-center space-x-1 text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}>
                    {getStatusIcon(selectedSubmission.status)}
                    <span>{selectedSubmission.status}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedSubmission.testsPassed}/{selectedSubmission.totalTests} tests passed
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {selectedSubmission.language}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={closeSubmissionViewer}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-900">
              <pre className="text-sm text-gray-100 font-mono">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
