'use client';

import { Edit, Plus, Utensils } from 'lucide-react';

interface FeedItem {
  id: string;
  feedType?: { name: string };
  supplement?: { name: string };
  customName?: string;
  feedingTime: string;
  amount: number;
  unit: string;
}

interface FeedProgram {
  name?: string;
  items?: FeedItem[];
  instructions?: string;
}

interface CareTabProps {
  horse: {
    id: string;
    feedProgram?: FeedProgram | null;
  };
  onEditFeed: () => void;
  canEdit?: boolean;
}

export function CareTab({ horse, onEditFeed, canEdit = true }: CareTabProps) {
  const feedProgram = horse.feedProgram;

  return (
    <div className="space-y-6">
      {/* Feed Program */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">Feed Program</h3>
          {canEdit && (
            <button onClick={onEditFeed} className="btn-secondary btn-sm">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
        {feedProgram ? (
          <div>
            {feedProgram.name && (
              <p className="text-amber-600 font-medium mb-3">{feedProgram.name}</p>
            )}
            <div className="space-y-3">
              {feedProgram.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                  <div>
                    <p className="font-medium text-stone-900">
                      {item.feedType?.name || item.supplement?.name || item.customName}
                    </p>
                    <p className="text-sm text-stone-500">{item.feedingTime}</p>
                  </div>
                  <p className="font-medium text-stone-700">
                    {item.amount} {item.unit}
                  </p>
                </div>
              ))}
            </div>
            {feedProgram.instructions && (
              <p className="text-sm text-stone-600 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                {feedProgram.instructions}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-sm mb-3">No feed program set up</p>
            {canEdit && (
              <button onClick={onEditFeed} className="btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                Create Feed Program
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
