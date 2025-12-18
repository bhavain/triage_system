import React from 'react';

interface UrgencyBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ score, size = 'md' }) => {
  const getUrgencyColor = (score: number) => {
    if (score >= 90) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyLabel = (score: number) => {
    if (score >= 90) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    return 'LOW';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${getUrgencyColor(
        score
      )} ${sizeClasses[size]}`}
    >
      {getUrgencyLabel(score)} ({score})
    </span>
  );
};
