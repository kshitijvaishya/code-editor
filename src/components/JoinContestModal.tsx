'use client';

import { useState } from 'react';
import { X, Lock } from 'lucide-react';

interface JoinContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinContestModal({ isOpen, onClose, onSuccess }: JoinContestModalProps) {
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const code = joinCode.trim().toUpperCase();

    if (!code) {
      setError('Join code is required');
      setIsLoading(false);
      return;
    }

    if (code.length !== 8) {
      setError('Join code must be 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/contests/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: code }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        setJoinCode('');
        onClose();
      } else {
        setError(data.message || 'Failed to join contest');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Join Private Contest</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Join Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-lg tracking-wider focus:outline-none focus:border-purple-500 transition-colors uppercase"
                placeholder="XXXXXXXX"
                maxLength={8}
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Enter the 8-character code provided by the contest creator
            </p>
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
              {isLoading ? 'Joining...' : 'Join Contest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
