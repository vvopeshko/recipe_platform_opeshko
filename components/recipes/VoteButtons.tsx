'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  recipeId: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  onVote: (recipeId: string, voteType: 'like' | 'dislike') => void;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  recipeId,
  likes,
  dislikes,
  userVote,
  onVote,
}) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      // If clicking the same vote, remove it; otherwise, set the new vote
      if (userVote === voteType) {
        // This would remove the vote - for now just toggle
        onVote(recipeId, voteType);
      } else {
        onVote(recipeId, voteType);
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleVote('like')}
        disabled={isVoting}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors',
          userVote === 'like'
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm font-medium">{likes}</span>
      </button>
      
      <button
        onClick={() => handleVote('dislike')}
        disabled={isVoting}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors',
          userVote === 'dislike'
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        <ThumbsDown className="w-4 h-4" />
        <span className="text-sm font-medium">{dislikes}</span>
      </button>
    </div>
  );
};


