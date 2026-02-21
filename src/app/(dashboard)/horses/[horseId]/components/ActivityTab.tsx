'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Clock, Loader2, Pill, Stethoscope, Utensils, Weight } from 'lucide-react';

interface ActivityMetadata {
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  overallCondition?: string;
  appetite?: string;
  attitude?: string;
  notes?: string;
  givenBy?: string;
  fedBy?: string;
  checkedBy?: string;
}

interface ActivityItem {
  id: string;
  date: string;
  category: string;
  title: string;
  description?: string;
  metadata?: ActivityMetadata;
}

interface ActivityTabProps {
  horse: {
    id: string;
  };
  barnId: string;
  refreshKey?: number;
}

const filterOptions = [
  { value: 'all', label: 'All Activity' },
  { value: 'feed', label: 'Feeding' },
  { value: 'medication', label: 'Medications' },
  { value: 'health', label: 'Health' },
  { value: 'event', label: 'Events' },
  { value: 'training', label: 'Training' },
];

function getCategoryIcon(category: string) {
  switch (category) {
    case 'feed': return <Utensils className="w-4 h-4 text-green-600" />;
    case 'medication': return <Pill className="w-4 h-4 text-purple-600" />;
    case 'health': return <Stethoscope className="w-4 h-4 text-red-500" />;
    case 'event': return <Calendar className="w-4 h-4 text-blue-600" />;
    case 'training': return <Activity className="w-4 h-4 text-amber-600" />;
    case 'weight': return <Weight className="w-4 h-4 text-muted-foreground" />;
    default: return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'feed': return 'bg-green-50 border-green-200';
    case 'medication': return 'bg-purple-50 border-purple-200';
    case 'health': return 'bg-red-50 border-red-200';
    case 'event': return 'bg-blue-50 border-blue-200';
    case 'training': return 'bg-amber-50 border-amber-200';
    case 'weight': return 'bg-background border-border';
    default: return 'bg-background border-border';
  }
}

export function ActivityTab({ horse, barnId, refreshKey }: ActivityTabProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchActivity = async () => {
      if (!barnId || !horse?.id) return;

      try {
        const response = await fetch(`/api/barns/${barnId}/horses/${horse.id}/activity`);
        const data = await response.json();
        setActivities(data.data || []);
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [barnId, horse?.id, refreshKey]);

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.category === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  // Group activities by date
  const groupedActivities: Record<string, ActivityItem[]> = {};
  filteredActivities.forEach(activity => {
    const activityDate = activity.date ? new Date(activity.date) : null;
    const isValidDate = activityDate && !isNaN(activityDate.getTime());

    const dateKey = isValidDate
      ? activityDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Unknown Date';
    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }
    groupedActivities[dateKey].push(activity);
  });

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className="card p-8 text-center">
          <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-muted-foreground">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
              <div className="space-y-2">
                {dayActivities.map((activity) => {
                  const activityDate = activity.date ? new Date(activity.date) : null;
                  const isValidDate = activityDate && !isNaN(activityDate.getTime());

                  return (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-xl border ${getCategoryColor(activity.category)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getCategoryIcon(activity.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-foreground">{activity.title}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {isValidDate ? activityDate.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              }) : ''}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                          )}
                          {/* Health check details */}
                          {activity.category === 'health' && activity.metadata && (
                            <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                              {activity.metadata.temperature && (
                                <span>Temp: {activity.metadata.temperature}°F</span>
                              )}
                              {activity.metadata.heartRate && (
                                <span>HR: {activity.metadata.heartRate} bpm</span>
                              )}
                              {activity.metadata.respiratoryRate && (
                                <span>RR: {activity.metadata.respiratoryRate}</span>
                              )}
                              {activity.metadata.overallCondition && (
                                <span>Condition: {activity.metadata.overallCondition}</span>
                              )}
                              {activity.metadata.appetite && (
                                <span>Appetite: {activity.metadata.appetite}</span>
                              )}
                              {activity.metadata.attitude && (
                                <span>Attitude: {activity.metadata.attitude}</span>
                              )}
                            </div>
                          )}
                          {activity.metadata?.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{activity.metadata.notes}</p>
                          )}
                          {activity.metadata?.givenBy && (
                            <p className="text-xs text-muted-foreground mt-1">By {activity.metadata.givenBy}</p>
                          )}
                          {activity.metadata?.fedBy && (
                            <p className="text-xs text-muted-foreground mt-1">By {activity.metadata.fedBy}</p>
                          )}
                          {activity.metadata?.checkedBy && (
                            <p className="text-xs text-muted-foreground mt-1">Checked by {activity.metadata.checkedBy}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
