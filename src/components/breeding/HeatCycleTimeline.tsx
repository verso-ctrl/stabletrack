'use client';

import { useMemo } from 'react';

interface HeatCycleData {
  id: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  intensity?: string | null;
  predictedNextDate?: string | Date | null;
  cycleLength: number;
}

interface HeatCycleTimelineProps {
  cycles: HeatCycleData[];
  daysToShow?: number;
  daysForward?: number;
}

const intensityColors: Record<string, string> = {
  MILD: 'bg-pink-300 dark:bg-pink-700',
  MODERATE: 'bg-pink-500 dark:bg-pink-600',
  STRONG: 'bg-red-500 dark:bg-red-600',
};

export function HeatCycleTimeline({ cycles, daysToShow = 90, daysForward = 30 }: HeatCycleTimelineProps) {
  const { timelineStart, timelineEnd, totalDays, bars, monthLabels } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - daysToShow);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setDate(end.getDate() + daysForward);
    end.setHours(23, 59, 59, 999);

    const total = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const dayToPercent = (date: Date) => {
      const diff = (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.min(100, (diff / total) * 100));
    };

    // Build bars from cycles
    const cycleBars = cycles.map(cycle => {
      const cycleStart = new Date(cycle.startDate);
      const cycleEnd = cycle.endDate
        ? new Date(cycle.endDate)
        : new Date(new Date(cycle.startDate).getTime() + 5 * 24 * 60 * 60 * 1000); // Default 5 days if no end

      return {
        id: cycle.id,
        left: dayToPercent(cycleStart),
        width: Math.max(1, dayToPercent(cycleEnd) - dayToPercent(cycleStart)),
        color: intensityColors[cycle.intensity || 'MODERATE'] || intensityColors.MODERATE,
        isPredicted: false,
        tooltip: `${cycleStart.toLocaleDateString()} - ${cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : 'ongoing'}`,
        cycleLength: cycle.cycleLength,
      };
    });

    // Add predicted next cycle from the most recent cycle
    if (cycles.length > 0) {
      const latest = cycles[0];
      if (latest.predictedNextDate) {
        const predStart = new Date(latest.predictedNextDate);
        const predEnd = new Date(predStart.getTime() + 5 * 24 * 60 * 60 * 1000);
        if (predStart <= end) {
          cycleBars.push({
            id: `predicted-${latest.id}`,
            left: dayToPercent(predStart),
            width: Math.max(1, dayToPercent(predEnd) - dayToPercent(predStart)),
            color: 'bg-pink-200 dark:bg-pink-800',
            isPredicted: true,
            tooltip: `Predicted: ${predStart.toLocaleDateString()}`,
            cycleLength: latest.cycleLength,
          });
        }
      }
    }

    // Month labels
    const months: { label: string; left: number }[] = [];
    const cursor = new Date(start);
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() + 1);
    while (cursor <= end) {
      months.push({
        label: cursor.toLocaleDateString('en-US', { month: 'short' }),
        left: dayToPercent(cursor),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return { timelineStart: start, timelineEnd: end, totalDays: total, bars: cycleBars, monthLabels: months };
  }, [cycles, daysToShow, daysForward]);

  // Today marker position
  const todayPercent = useMemo(() => {
    const now = new Date();
    const diff = (now.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (diff / totalDays) * 100));
  }, [timelineStart, totalDays]);

  if (cycles.length === 0) {
    return (
      <div className="card p-4 text-center text-sm text-muted-foreground">
        No heat cycles recorded yet. Log a heat cycle to see the timeline.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">Heat Cycle Timeline</h4>

      {/* Month labels */}
      <div className="relative h-5 mb-1">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="absolute text-[10px] text-muted-foreground"
            style={{ left: `${m.left}%`, transform: 'translateX(-50%)' }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Timeline track */}
      <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
        {/* Today marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-foreground/30 z-10"
          style={{ left: `${todayPercent}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground/50" />
        </div>

        {/* Cycle bars */}
        {bars.map(bar => (
          <div
            key={bar.id}
            className={`absolute top-1 bottom-1 rounded ${bar.color} ${bar.isPredicted ? 'border-2 border-dashed border-pink-400 dark:border-pink-500 opacity-60' : ''}`}
            style={{
              left: `${bar.left}%`,
              width: `${bar.width}%`,
              minWidth: '4px',
            }}
            title={bar.tooltip}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-pink-500 dark:bg-pink-600 inline-block" /> Recorded
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-pink-200 dark:bg-pink-800 border border-dashed border-pink-400 inline-block" /> Predicted
        </span>
        <span className="flex items-center gap-1">
          <span className="w-px h-3 bg-foreground/30 inline-block" /> Today
        </span>
        {cycles.length > 0 && (
          <span>Avg cycle: {cycles[0].cycleLength} days</span>
        )}
      </div>
    </div>
  );
}
