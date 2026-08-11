import React from 'react';
import { Star } from 'lucide-react';

const RatingBadge = ({ rating, size = 'md' }) => {
  const numRating = Number(rating || 0).toFixed(1);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const getBadgeColor = (val) => {
    if (val >= 8.5) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (val >= 7.0) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
  };

  return (
    <div
      className={`inline-flex items-center rounded-full font-bold border backdrop-blur-md transition-all ${
        sizeClasses[size] || sizeClasses.md
      } ${getBadgeColor(numRating)}`}
    >
      <Star className="w-3.5 h-3.5 fill-current" />
      <span>{numRating}</span>
    </div>
  );
};

export default RatingBadge;
