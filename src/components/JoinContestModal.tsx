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
      <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Join Private Contest</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Enter Join Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground font-mono text-lg tracking-wider focus:outline-none focus:border-primary transition-colors uppercase"
                placeholder="XXXXXXXX"
                maxLength={8}
                required
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Enter the 8-character code provided by the contest creator
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border hover:bg-secondary text-foreground rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary hover:brightness-110 disabled:opacity-50 text-primary-foreground rounded-lg font-medium transition-all btn-glow"
            >
              {isLoading ? 'Joining...' : 'Join Contest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
