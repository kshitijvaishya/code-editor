'use client';

import { Copy, Check, X } from 'lucide-react';
import { useState } from 'react';

interface JoinCodeSuccessDialogProps {
  isOpen: boolean;
  joinCode: string;
  contestName: string;
  onClose: () => void;
}

export default function JoinCodeSuccessDialog({
  isOpen,
  joinCode,
  contestName,
  onClose,
}: JoinCodeSuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Contest Created!</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-foreground/80 mb-2">
              Your private contest <span className="font-semibold text-foreground">&ldquo;{contestName}&rdquo;</span> has been created successfully!
            </p>
            <p className="text-muted-foreground text-sm">
              Share the join code below with participants to allow them to join your contest.
            </p>
          </div>

          {/* Join Code Display */}
          <div className="p-6 bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 rounded-xl">
            <p className="text-sm text-foreground/70 mb-3 text-center">Join Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-mono font-bold text-foreground tracking-widest">
                {joinCode}
              </span>
              <button
                onClick={handleCopy}
                className="p-3 bg-primary hover:brightness-110 rounded-lg transition-all"
                title="Copy join code"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Copy className="h-5 w-5 text-primary-foreground" />
                )}
              </button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              {copied ? 'Copied to clipboard!' : 'Click to copy'}
            </p>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-secondary/50 border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-2">Important:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Keep this code secure and share only with intended participants</li>
              <li>• The code will remain valid until the contest ends</li>
              <li>• Participants can join anytime before the contest ends</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-primary hover:brightness-110 text-primary-foreground rounded-lg font-medium transition-all btn-glow"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
