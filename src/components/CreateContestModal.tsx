'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { DSA_PROBLEMS, Problem } from '@/lib/problems';

interface CreateContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (joinCode: string, contestName: string) => void;
}

export default function CreateContestModal({ isOpen, onClose, onSuccess }: CreateContestModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [showProblemSelector, setShowProblemSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleProblem = (problemId: string) => {
    setSelectedProblems(prev =>
      prev.includes(problemId)
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    );
  };

  const quickSelect = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    const problems = DSA_PROBLEMS.filter(p => p.difficulty === difficulty).map(p => p.id);
    setSelectedProblems(problems.slice(0, 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!name.trim()) {
      setError('Contest name is required');
      setIsLoading(false);
      return;
    }

    if (selectedProblems.length === 0) {
      setError('Please select at least one problem');
      setIsLoading(false);
      return;
    }

    // Convert local datetime-local input to UTC ISO format
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid date format');
      setIsLoading(false);
      return;
    }

    if (start < now) {
      setError('Start time cannot be in the past');
      setIsLoading(false);
      return;
    }

    if (end <= start) {
      setError('End time must be after start time');
      setIsLoading(false);
      return;
    }

    // Convert to UTC ISO format before sending to backend
    const startTimeUTC = start.toISOString();
    const endTimeUTC = end.toISOString();

    try {
      const response = await fetch('/api/contests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description, 
          startTime: startTimeUTC, 
          endTime: endTimeUTC,
          problemIds: selectedProblems
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.joinCode, name);
        setName('');
        setDescription('');
        setStartTime('');
        setEndTime('');
        setSelectedProblems([]);
        onClose();
      } else {
        setError(data.message || 'Failed to create contest');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white">Create DSA Contest</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contest Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="e.g., DSA Weekly Challenge #1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Optional description"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Problem Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">
                Problems * ({selectedProblems.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => quickSelect('Easy')}
                  className="px-3 py-1 text-xs bg-green-500/10 border border-green-500/30 text-green-400 rounded hover:bg-green-500/20 transition-colors"
                >
                  3 Easy
                </button>
                <button
                  type="button"
                  onClick={() => quickSelect('Medium')}
                  className="px-3 py-1 text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded hover:bg-yellow-500/20 transition-colors"
                >
                  3 Medium
                </button>
                <button
                  type="button"
                  onClick={() => quickSelect('Hard')}
                  className="px-3 py-1 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                >
                  3 Hard
                </button>
              </div>
            </div>

            {/* Problem Grid */}
            <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
              {DSA_PROBLEMS.map((problem) => (
                <div
                  key={problem.id}
                  onClick={() => toggleProblem(problem.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedProblems.includes(problem.id)
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-white text-sm">{problem.title}</h4>
                    <input
                      type="checkbox"
                      checked={selectedProblems.includes(problem.id)}
                      onChange={() => {}}
                      className="mt-0.5 accent-purple-600"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-gray-400">{problem.points} pts</span>
                    {problem.topics.slice(0, 2).map(topic => (
                      <span key={topic} className="text-xs text-gray-500">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Contest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
