'use client';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  CONFIRMED_PREGNANT: { label: 'Pregnant', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  NOT_PREGNANT: { label: 'Open', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
  REBREED: { label: 'Rebreed', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  FOALED: { label: 'Foaled', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  LIVE: { label: 'Live Birth', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  STILLBORN: { label: 'Loss at Birth', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
  ABORTION: { label: 'Pregnancy Loss', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
  DYSTOCIA: { label: 'Difficult Birth', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  NATURAL: { label: 'Natural', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  AI_FRESH: { label: 'AI (Fresh)', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  AI_COOLED: { label: 'AI (Cooled)', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  AI_FROZEN: { label: 'AI (Frozen)', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
  EMBRYO_TRANSFER: { label: 'Embryo Transfer', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  MILD: { label: 'Mild', className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' },
  MODERATE: { label: 'Moderate', className: 'bg-pink-200 text-pink-900 dark:bg-pink-900/40 dark:text-pink-300' },
  STRONG: { label: 'Strong', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export function BreedingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
