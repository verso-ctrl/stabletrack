'use client';

import { useState } from 'react';
import {
  Trees,
  Home,
  Plus,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Users,
  Maximize,
  ArrowRight,
} from 'lucide-react';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import {
  usePaddocks,
  useStalls,
  useCreatePaddock,
  useCreateStall,
  useDeletePaddock,
  useDeleteStall,
  useUpdatePaddock,
  useUpdateStall,
  useAssignHorseToPaddock,
  useAssignHorseToStall,
  type Paddock,
  type Stall,
  type FacilityHorse,
} from '@/hooks/useFacilities';

type ViewMode = 'pastures' | 'stalls';

export default function PasturesPage() {
  const { currentBarn } = useBarn();
  const [viewMode, setViewMode] = useState<ViewMode>('pastures');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<{
    type: 'paddock' | 'stall';
    id: string;
    name: string;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<Paddock | Stall | null>(null);

  const { paddocks, isLoading: paddocksLoading } = usePaddocks();
  const { stalls, isLoading: stallsLoading } = useStalls();
  const { horses } = useHorses({ status: 'ACTIVE' });

  const isLoading = paddocksLoading || stallsLoading;

  // Get unassigned horses
  const horsesInPastures = new Set(paddocks.flatMap((p) => p.horses.map((h) => h.id)));
  const horsesInStalls = new Set(stalls.filter((s) => s.horse).map((s) => s.horse!.id));
  const unassignedHorses = horses.filter(
    (h) =>
      (viewMode === 'pastures' && !horsesInPastures.has(h.id)) ||
      (viewMode === 'stalls' && !horsesInStalls.has(h.id))
  );

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Please select a barn first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Pastures & Stalls</h1>
          <p className="text-stone-500 mt-1">Manage where your horses live and graze</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-stone-200 p-1 bg-white">
            <button
              onClick={() => setViewMode('pastures')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'pastures'
                  ? 'bg-green-100 text-green-700'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Trees className="w-4 h-4" />
              Pastures
            </button>
            <button
              onClick={() => setViewMode('stalls')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'stalls'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Home className="w-4 h-4" />
              Stalls
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add {viewMode === 'pastures' ? 'Pasture' : 'Stall'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>
      ) : viewMode === 'pastures' ? (
        <PasturesView
          paddocks={paddocks}
          onAssign={(paddock) =>
            setShowAssignModal({ type: 'paddock', id: paddock.id, name: paddock.name })
          }
          onEdit={(paddock) => setEditingItem(paddock)}
        />
      ) : (
        <StallsView
          stalls={stalls}
          onAssign={(stall) =>
            setShowAssignModal({ type: 'stall', id: stall.id, name: stall.name })
          }
          onEdit={(stall) => setEditingItem(stall)}
        />
      )}

      {/* Unassigned Horses */}
      {unassignedHorses.length > 0 && (
        <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-500" />
            Unassigned Horses ({unassignedHorses.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {unassignedHorses.map((horse) => (
              <div
                key={horse.id}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 shadow-sm"
              >
                {horse.profilePhotoUrl ? (
                  <img
                    src={horse.profilePhotoUrl}
                    alt={horse.barnName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-stone-600">
                      {horse.barnName.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="font-medium text-stone-900">{horse.barnName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddFacilityModal
          type={viewMode === 'pastures' ? 'paddock' : 'stall'}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditFacilityModal
          type={viewMode === 'pastures' ? 'paddock' : 'stall'}
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Assign Horse Modal */}
      {showAssignModal && (
        <AssignHorseModal
          type={showAssignModal.type}
          facilityId={showAssignModal.id}
          facilityName={showAssignModal.name}
          horses={horses}
          assignedHorseIds={
            showAssignModal.type === 'paddock'
              ? paddocks.find((p) => p.id === showAssignModal.id)?.horses.map((h) => h.id) ?? []
              : stalls.find((s) => s.id === showAssignModal.id)?.horse
                ? [stalls.find((s) => s.id === showAssignModal.id)!.horse!.id]
                : []
          }
          onClose={() => setShowAssignModal(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Pastures View
// ============================================================================

function PasturesView({
  paddocks,
  onAssign,
  onEdit,
}: {
  paddocks: Paddock[];
  onAssign: (paddock: Paddock) => void;
  onEdit: (paddock: Paddock) => void;
}) {
  const deletePaddock = useDeletePaddock();
  const removeHorse = useAssignHorseToPaddock();

  if (paddocks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
        <Trees className="w-16 h-16 text-green-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-stone-900 mb-2">No pastures yet</h3>
        <p className="text-stone-500 mb-4">Create pastures to track where your horses graze</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paddocks.map((paddock) => (
        <div
          key={paddock.id}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{paddock.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-green-100 text-sm">
                  {paddock.acreage && (
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3.5 h-3.5" />
                      {paddock.acreage} acres
                    </span>
                  )}
                  {paddock.maxHorses && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Max {paddock.maxHorses}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu
                onEdit={() => onEdit(paddock)}
                onDelete={() => {
                  if (confirm(`Delete "${paddock.name}"? Horses will be unassigned.`)) {
                    deletePaddock.mutate(paddock.id);
                  }
                }}
              />
            </div>
          </div>

          {/* Horses */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-stone-500">
                {paddock.horseCount} horse{paddock.horseCount !== 1 ? 's' : ''}
                {paddock.maxHorses && ` / ${paddock.maxHorses}`}
              </span>
              <button
                onClick={() => onAssign(paddock)}
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {paddock.horses.length > 0 ? (
              <div className="space-y-2">
                {paddock.horses.map((horse) => (
                  <div
                    key={horse.id}
                    className="flex items-center justify-between bg-stone-50 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      {horse.profilePhotoUrl ? (
                        <img
                          src={horse.profilePhotoUrl}
                          alt={horse.barnName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-700">
                            {horse.barnName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-stone-900">{horse.barnName}</span>
                    </div>
                    <button
                      onClick={() => removeHorse.mutate({ horseId: horse.id, action: 'remove' })}
                      className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                      title="Remove from pasture"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400 text-center py-4">No horses assigned</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Stalls View
// ============================================================================

function StallsView({
  stalls,
  onAssign,
  onEdit,
}: {
  stalls: Stall[];
  onAssign: (stall: Stall) => void;
  onEdit: (stall: Stall) => void;
}) {
  const deleteStall = useDeleteStall();
  const removeHorse = useAssignHorseToStall();

  if (stalls.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
        <Home className="w-16 h-16 text-amber-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-stone-900 mb-2">No stalls yet</h3>
        <p className="text-stone-500 mb-4">Create stalls to track horse housing assignments</p>
      </div>
    );
  }

  // Group by section
  const sections = stalls.reduce(
    (acc, stall) => {
      const section = stall.section;
      if (!acc[section]) acc[section] = [];
      acc[section].push(stall);
      return acc;
    },
    {} as Record<string, Stall[]>
  );

  return (
    <div className="space-y-8">
      {Object.entries(sections).map(([section, sectionStalls]) => (
        <div key={section}>
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-500" />
            {section}
            <span className="text-stone-400 font-normal">({sectionStalls.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sectionStalls.map((stall) => (
              <div
                key={stall.id}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  stall.horse
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-stone-200 bg-white hover:border-amber-300'
                }`}
              >
                {/* Stall Header */}
                <div
                  className={`px-3 py-2 flex items-center justify-between ${
                    stall.horse ? 'bg-amber-100' : 'bg-stone-100'
                  }`}
                >
                  <span className="font-bold text-stone-900">{stall.name}</span>
                  <DropdownMenu
                    onEdit={() => onEdit(stall)}
                    onDelete={() => {
                      if (confirm(`Delete stall "${stall.name}"?`)) {
                        deleteStall.mutate(stall.id);
                      }
                    }}
                  />
                </div>

                {/* Horse or Empty */}
                <div className="p-3">
                  {stall.horse ? (
                    <div className="text-center">
                      {stall.horse.profilePhotoUrl ? (
                        <img
                          src={stall.horse.profilePhotoUrl}
                          alt={stall.horse.barnName}
                          className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-amber-700">
                            {stall.horse.barnName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <p className="font-medium text-stone-900 text-sm truncate">
                        {stall.horse.barnName}
                      </p>
                      <button
                        onClick={() =>
                          removeHorse.mutate({ horseId: stall.horse!.id, action: 'remove' })
                        }
                        className="mt-2 text-xs text-stone-500 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAssign(stall)}
                      className="w-full py-6 text-center text-stone-400 hover:text-amber-600 transition-colors"
                    >
                      <Plus className="w-8 h-8 mx-auto mb-1" />
                      <span className="text-sm">Assign Horse</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Dropdown Menu
// ============================================================================

function DropdownMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:bg-black/10 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-20 min-w-[120px]">
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Add Facility Modal
// ============================================================================

function AddFacilityModal({
  type,
  onClose,
}: {
  type: 'paddock' | 'stall';
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [acreage, setAcreage] = useState('');
  const [maxHorses, setMaxHorses] = useState('');

  const createPaddock = useCreatePaddock();
  const createStall = useCreateStall();

  const isLoading = createPaddock.isPending || createStall.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'paddock') {
      await createPaddock.mutateAsync({
        name,
        acreage: acreage ? parseFloat(acreage) : undefined,
        maxHorses: maxHorses ? parseInt(maxHorses) : undefined,
      });
    } else {
      await createStall.mutateAsync({
        name,
        section: section || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">
            Add {type === 'paddock' ? 'Pasture' : 'Stall'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'paddock' ? 'e.g., North Pasture' : 'e.g., Stall 1'}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {type === 'paddock' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Acreage (optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  placeholder="e.g., 2.5"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Max Horses (optional)
                </label>
                <input
                  type="number"
                  value={maxHorses}
                  onChange={(e) => setMaxHorses(e.target.value)}
                  placeholder="e.g., 4"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Barn / Section
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g., Main Barn, Barn 2, South Wing"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-stone-500 mt-1">
                You can use the same stall name in different sections
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Edit Facility Modal
// ============================================================================

function EditFacilityModal({
  type,
  item,
  onClose,
}: {
  type: 'paddock' | 'stall';
  item: Paddock | Stall;
  onClose: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [section, setSection] = useState((item as Stall).section || '');
  const [acreage, setAcreage] = useState((item as Paddock).acreage?.toString() || '');
  const [maxHorses, setMaxHorses] = useState((item as Paddock).maxHorses?.toString() || '');

  const updatePaddock = useUpdatePaddock();
  const updateStall = useUpdateStall();

  const isLoading = updatePaddock.isPending || updateStall.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'paddock') {
      await updatePaddock.mutateAsync({
        id: item.id,
        name,
        acreage: acreage ? parseFloat(acreage) : undefined,
        maxHorses: maxHorses ? parseInt(maxHorses) : undefined,
      });
    } else {
      await updateStall.mutateAsync({
        id: item.id,
        name,
        section: section || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">
            Edit {type === 'paddock' ? 'Pasture' : 'Stall'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {type === 'paddock' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Acreage</label>
                <input
                  type="number"
                  step="0.1"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Max Horses</label>
                <input
                  type="number"
                  value={maxHorses}
                  onChange={(e) => setMaxHorses(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Barn / Section</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g., Main Barn, Barn 2"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-stone-500 mt-1">
                You can use the same stall name in different sections
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Assign Horse Modal
// ============================================================================

function AssignHorseModal({
  type,
  facilityId,
  facilityName,
  horses,
  assignedHorseIds,
  onClose,
}: {
  type: 'paddock' | 'stall';
  facilityId: string;
  facilityName: string;
  horses: { id: string; barnName: string; profilePhotoUrl: string | null }[];
  assignedHorseIds: string[];
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const assignToPaddock = useAssignHorseToPaddock();
  const assignToStall = useAssignHorseToStall();

  const isLoading = assignToPaddock.isPending || assignToStall.isPending;

  const availableHorses = horses.filter(
    (h) => !assignedHorseIds.includes(h.id) && h.barnName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async (horseId: string) => {
    if (type === 'paddock') {
      await assignToPaddock.mutateAsync({ paddockId: facilityId, horseId });
    } else {
      await assignToStall.mutateAsync({ stallId: facilityId, horseId });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Assign Horse</h2>
            <p className="text-sm text-stone-500">
              to {facilityName}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-4 border-b border-stone-200">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search horses..."
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {availableHorses.length === 0 ? (
            <p className="text-center text-stone-500 py-8">
              {search ? 'No horses match your search' : 'All horses are already assigned'}
            </p>
          ) : (
            <div className="space-y-2">
              {availableHorses.map((horse) => (
                <button
                  key={horse.id}
                  onClick={() => handleAssign(horse.id)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-colors text-left disabled:opacity-50"
                >
                  {horse.profilePhotoUrl ? (
                    <img
                      src={horse.profilePhotoUrl}
                      alt={horse.barnName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                      <span className="text-lg font-medium text-stone-600">
                        {horse.barnName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-stone-900 flex-1">{horse.barnName}</span>
                  <ArrowRight className="w-5 h-5 text-stone-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
