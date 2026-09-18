import React from 'react';
import { PriorityLevel } from '../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const styles: Record<PriorityLevel, { bg: string; text: string; border: string; label: string }> = {
    urgent: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      label: 'Urgent',
    },
    high: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'High Priority',
    },
    medium: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      label: 'Medium',
    },
    low: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      label: 'Low',
    },
  };

  const current = styles[priority] || styles.medium;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${current.bg} ${current.text} ${current.border} ${padding}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          priority === 'urgent'
            ? 'bg-rose-500 animate-pulse'
            : priority === 'high'
            ? 'bg-amber-500'
            : priority === 'medium'
            ? 'bg-indigo-500'
            : 'bg-slate-400'
        }`}
      />
      {current.label}
    </span>
  );
};
