'use client';

import { cn } from '@/lib/cn';
import { getStatusLabel, statusColors, type Locale } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  locale: Locale;
  className?: string;
}

export function StatusBadge({ status, locale, className }: StatusBadgeProps) {
  const label = getStatusLabel(status, locale);
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        colorClass,
        className
      )}
    >
      <StatusIcon status={status} />
      {label}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  const iconMap: Record<string, string> = {
    received: '\u2B1C', // White square
    contactingHospital: '\uD83D\uDFE1', // Yellow circle
    proposedOptions: '\uD83D\uDD35', // Blue circle
    confirmed: '\u2705', // Check mark
    cancelled: '\u274C', // X mark
    needsMoreInfo: '\uD83D\uDFE0', // Orange circle
    noAvailability: '\u26D4', // No entry
  };

  return <span className="text-[10px]">{iconMap[status] || '\u2B1C'}</span>;
}
