'use client';

import { Edit, Plus, Utensils, Pill } from 'lucide-react';

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

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route?: string | null;
  giveWithFood: boolean;
}

interface CareTabProps {
  horse: {
    id: string;
    feedProgram?: FeedProgram | null;
    activeMedications?: Medication[];
  };
  onEditFeed: () => void;
  canEdit?: boolean;
}

export function CareTab({ horse, onEditFeed, canEdit = true }: CareTabProps) {
  const feedProgram = horse.feedProgram;
  const medsWithFood = (horse.activeMedications ?? []).filter(m => m.giveWithFood);

  return (
    <div className="space-y-6">
      {/* Feed Program */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Feed Program</h3>
          {canEdit && (
            <button onClick={onEditFeed} className="btn-secondary btn-sm">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
        {medsWithFood.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 flex gap-2">
            <Pill className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Give with feeding</p>
              <ul className="mt-0.5 space-y-0.5">
                {medsWithFood.map(m => (
                  <li key={m.id} className="text-xs text-amber-700">
                    {m.name} — {m.dosage}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {feedProgram ? (
          <div>
            {feedProgram.name && (
              <p className="text-amber-600 font-medium mb-3">{feedProgram.name}</p>
            )}
            <div className="space-y-3">
              {feedProgram.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-background">
                  <div>
                    <p className="font-medium text-foreground">
                      {item.feedType?.name || item.supplement?.name || item.customName}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.feedingTime}</p>
                  </div>
                  <p className="font-medium text-muted-foreground">
                    {item.amount} {item.unit}
                  </p>
                </div>
              ))}
            </div>
            {feedProgram.instructions && (
              <p className="text-sm text-muted-foreground mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                {feedProgram.instructions}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Utensils className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm mb-3">No feed program set up</p>
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
