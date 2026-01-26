'use client';

import { Contest } from '@/lib/contest';
import { Calendar, Clock, Users, Copy, Check } from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/contest';
import { useState } from 'react';

interface ContestCardProps {
  contest: Contest;
  isCreator: boolean;
}

export default function ContestCard({ contest, isCreator }: ContestCardProps) {
  const [copied, setCopied] = useState(false);

  const getStatusColor = () => {
    switch (contest.status) {
      case 'upcoming':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'live':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'ended':
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusText = () => {
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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-600/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{contest.name}</h3>
          {isCreator && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded">
              Creator
            </span>
          )}
        </div>
        <span className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Starts: {formatDateTime(contest.startTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Duration: {formatDuration(contest.startTime, contest.endTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>
            {contest.participants.length} participant{contest.participants.length !== 1 ? 's' : ''}
            {contest.participantLimit && ` / ${contest.participantLimit}`}
          </span>
        </div>
      </div>

      {/* Join Code (Only for Creator and Upcoming/Live) */}
      {isCreator && contest.status !== 'ended' && (
        <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Join Code</p>
              <p className="text-lg font-mono font-bold text-white tracking-wider">
                {contest.joinCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy join code"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      {contest.status === 'live' && (
        <button className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
          Enter Contest
        </button>
      )}
      {contest.status === 'upcoming' && !isCreator && (
        <button className="w-full mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium cursor-not-allowed">
          Waiting to Start
        </button>
      )}
      {contest.status === 'ended' && (
        <button className="w-full mt-4 px-4 py-2 border border-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors">
          View Results
        </button>
      )}
    </div>
  );
}
