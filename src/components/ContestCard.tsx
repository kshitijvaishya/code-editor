'use client';

import { Contest } from '@/lib/contest';
import { Calendar, Clock, Users, Copy, Check, Code2, Medal, CheckCircle, Trash2, Shield } from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/contest';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ContestCardProps {
  contest: Contest;
  isCreator: boolean;
  userRank?: number;
  userScore?: number;
  hasSubmitted?: boolean;
  onDelete?: () => void;
}

export default function ContestCard({ contest, isCreator, userRank, userScore, hasSubmitted, onDelete }: ContestCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const getStatusColor = () => {
    // If user has submitted (completed the contest), show completed status
    if (!isCreator && hasSubmitted && contest.status === 'live') {
      return 'bg-primary/10 border-primary/30 text-primary';
    }
    
    switch (contest.status) {
      case 'upcoming':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'live':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'ended':
        return 'bg-muted/50 border-border text-muted-foreground';
    }
  };

  const getStatusText = () => {
    // If user has submitted (completed the contest), show "Completed" instead of "Live"
    if (!isCreator && hasSubmitted && contest.status === 'live') {
      return 'Completed';
    }
    
    switch (contest.status) {
      case 'upcoming':
        return 'Upcoming';
      case 'live':
        return 'Live';
      case 'ended':
        return 'Ended';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(contest.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterContest = () => {
    router.push(`/contest/${contest.id}`);
  };

  const handleModerationPanel = () => {
    router.push(`/contest/${contest.id}/moderate`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contests/delete?id=${contest.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setShowDeleteConfirm(false);
        onDelete?.();
      } else {
        alert(data.message || 'Failed to delete contest');
      }
    } catch (error) {
      alert('Failed to delete contest');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all relative">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center p-6">
          <div className="text-center">
            <Trash2 className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Contest?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone. All submissions and data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-secondary hover:bg-muted text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-destructive hover:brightness-110 text-destructive-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-foreground mb-1">{contest.name}</h3>
            {isCreator && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 hover:bg-destructive/20 text-destructive rounded-lg transition-colors ml-2"
                title="Delete contest"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {contest.description && (
            <p className="text-sm text-muted-foreground mb-2">{contest.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {isCreator && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/20 text-primary border border-primary/30 rounded">
                Creator
              </span>
            )}
            {hasSubmitted && !isCreator && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-green-600/20 text-green-300 border border-green-500/30 rounded flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Submitted
              </span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/*  */}

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Starts: {formatDateTime(contest.startTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Duration: {formatDuration(contest.startTime, contest.endTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {contest.participants.length} participant{contest.participants.length !== 1 ? 's' : ''}
            {contest.participantLimit && ` / ${contest.participantLimit}`}
          </span>
        </div>
        {contest.problemIds && contest.problemIds.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2 className="h-4 w-4" />
            <span>{contest.problemIds.length} problems</span>
          </div>
        )}
      </div>

      {/* Join Code (Only for Creator and Upcoming/Live) */}
      {isCreator && contest.status !== 'ended' && (
        <div className="mt-4 p-3 bg-secondary/50 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Join Code</p>
              <p className="text-lg font-mono font-bold text-foreground tracking-wider">
                {contest.joinCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Copy join code"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      {contest.status === 'live' && !hasSubmitted && (
        <button 
          onClick={handleEnterContest}
          className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Enter Contest
        </button>
      )}
      {contest.status === 'live' && hasSubmitted && !isCreator && (
        <button 
          onClick={handleEnterContest}
          className="w-full mt-4 px-4 py-2 border border-primary bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors"
        >
          View Submissions & Leaderboard
        </button>
      )}
      {contest.status === 'upcoming' && (
        <button 
          onClick={handleEnterContest}
          className="w-full mt-4 px-4 py-2 border border-border hover:bg-secondary text-foreground rounded-lg font-medium transition-colors"
        >
          View Contest
        </button>
      )}
      {contest.status === 'ended' && isCreator && (
        <button
          onClick={handleModerationPanel}
          className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2 bg-primary hover:brightness-110 text-primary-foreground rounded-lg font-medium transition-all btn-glow"
          title="Moderation Panel"
        >
          <Shield className="h-4 w-4" />
          <span>Moderation Panel</span>
        </button>
      )}
    </div>
  );
}
