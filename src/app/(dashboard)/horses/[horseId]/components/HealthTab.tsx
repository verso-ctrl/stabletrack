'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Loader2, Plus, X } from 'lucide-react';

interface HealthRecord {
  id: string;
  type: string;
  date: string;
  provider?: string;
  diagnosis?: string;
  treatment?: string;
  findings?: string;
  followUpNotes?: string;
  followUpDate?: string;
  cost?: number;
  attachments?: Array<{ id: string; url: string; filename?: string }>;
}

interface Vaccination {
  id: string;
  type: string;
  dateGiven: string;
  nextDueDate?: string;
}

interface Weight {
  id: string;
  date: string;
  weight: number;
  bodyScore?: number;
}

interface CogginsRecord {
  id: string;
  testDate: string;
  expiryDate: string;
  veterinarian?: string;
  accessionNumber?: string;
  documentUrl?: string;
}

interface CogginsData {
  current?: CogginsRecord;
  isExpired?: boolean;
  expiresIn?: number;
  data?: CogginsRecord[];
}

interface HealthTabProps {
  horse: {
    id: string;
    vaccinations?: Vaccination[];
    weights?: Weight[];
  };
  onLogWeight: () => void;
  onLogVaccination: () => void;
  onLogCoggins: () => void;
  barnId: string;
  canEdit?: boolean;
}

export function HealthTab({ horse, onLogWeight, onLogVaccination, onLogCoggins, barnId, canEdit = true }: HealthTabProps) {
  const [coggins, setCoggins] = useState<CogginsData | null>(null);
  const [cogginsLoading, setCogginsLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [healthRecordsLoading, setHealthRecordsLoading] = useState(true);
  const [selectedHealthRecord, setSelectedHealthRecord] = useState<HealthRecord | null>(null);
  const [showHealthRecordModal, setShowHealthRecordModal] = useState(false);

  useEffect(() => {
    const fetchHealthData = async () => {
      if (!barnId || !horse?.id) return;

      try {
        const [cogginsResponse, healthResponse] = await Promise.all([
          fetch(`/api/barns/${barnId}/horses/${horse.id}/coggins`),
          fetch(`/api/barns/${barnId}/horses/${horse.id}/health`),
        ]);

        const cogginsData = await cogginsResponse.json();
        setCoggins(cogginsData);

        const healthData = await healthResponse.json();
        setHealthRecords(healthData.data || []);
      } catch {
        // Errors handled silently
      } finally {
        setCogginsLoading(false);
        setHealthRecordsLoading(false);
      }
    };

    fetchHealthData();
  }, [barnId, horse?.id]);

  return (
    <div className="space-y-6">
      {/* Coggins Status */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Coggins Test</h3>
          {canEdit && (
            <button onClick={onLogCoggins} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Add Coggins
            </button>
          )}
        </div>
        {cogginsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : coggins?.current ? (
          <div className={`p-4 rounded-xl ${coggins.isExpired ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {coggins.isExpired ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="font-medium text-red-700">Expired</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-medium text-green-700">Valid</span>
                  {coggins.expiresIn && coggins.expiresIn <= 30 && (
                    <span className="badge-warning ml-2">Expires in {coggins.expiresIn} days</span>
                  )}
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Test Date</p>
                <p className="font-medium">{new Date(coggins.current.testDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expiry Date</p>
                <p className="font-medium">{new Date(coggins.current.expiryDate).toLocaleDateString()}</p>
              </div>
              {coggins.current.veterinarian && (
                <div>
                  <p className="text-muted-foreground">Veterinarian</p>
                  <p className="font-medium">{coggins.current.veterinarian}</p>
                </div>
              )}
              {coggins.current.accessionNumber && (
                <div>
                  <p className="text-muted-foreground">Accession #</p>
                  <p className="font-medium">{coggins.current.accessionNumber}</p>
                </div>
              )}
            </div>
            {coggins.current.documentUrl && (
              <a
                href={coggins.current.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
              >
                <FileText className="w-4 h-4" />
                View Document
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-background rounded-xl">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm mb-3">No Coggins on file</p>
            {canEdit && (
              <button onClick={onLogCoggins} className="btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                Add Coggins Record
              </button>
            )}
          </div>
        )}

        {/* Coggins History */}
        {coggins?.data && coggins.data.length > 1 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">History</p>
            <div className="space-y-2">
              {coggins.data.slice(1, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm p-2 rounded bg-background">
                  <span className="text-muted-foreground">{new Date(c.testDate).toLocaleDateString()}</span>
                  <span className={new Date(c.expiryDate) > new Date() ? 'text-green-600' : 'text-muted-foreground'}>
                    Exp: {new Date(c.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vaccinations */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Vaccinations</h3>
          {canEdit && (
            <button onClick={onLogVaccination} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Log Vaccination
            </button>
          )}
        </div>
        {horse.vaccinations && horse.vaccinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {horse.vaccinations.map((vax) => {
              const isExpiringSoon = vax.nextDueDate &&
                new Date(vax.nextDueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

              return (
                <div key={vax.id} className="p-3 rounded-xl bg-background">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">
                      {vax.type.replace(/_/g, ' ')}
                    </p>
                    {isExpiringSoon && <span className="badge-warning">Due Soon</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Given: {new Date(vax.dateGiven).toLocaleDateString()}
                  </p>
                  {vax.nextDueDate && (
                    <p className="text-sm text-muted-foreground">
                      Next due: {new Date(vax.nextDueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No vaccination records</p>
        )}
      </div>

      {/* Weight History */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Weight History</h3>
          {canEdit && (
            <button onClick={onLogWeight} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Log Weight
            </button>
          )}
        </div>
        {horse.weights && horse.weights.length > 0 ? (
          <div className="space-y-2">
            {horse.weights.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-background">
                <span className="text-muted-foreground">{new Date(w.date).toLocaleDateString()}</span>
                <span className="font-medium text-foreground">{w.weight} lbs</span>
                {w.bodyScore && (
                  <span className="text-sm text-muted-foreground">BCS: {w.bodyScore.toFixed(1)}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No weight records</p>
        )}
      </div>

      {/* All Health Records */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Health Records</h3>
          {canEdit && (
            <Link href={`/horses/${horse.id}/health/new`} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Add Record
            </Link>
          )}
        </div>
        {healthRecordsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : healthRecords.length > 0 ? (
          <div className="space-y-2">
            {healthRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => {
                  setSelectedHealthRecord(record);
                  setShowHealthRecordModal(true);
                }}
                className="w-full p-3 rounded-xl bg-background hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{record.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                    {record.provider && (
                      <p className="text-xs text-muted-foreground mt-1">Provider: {record.provider}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm mb-3">No health records</p>
            {canEdit && (
              <Link href={`/horses/${horse.id}/health/new`} className="btn-primary btn-sm inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add First Record
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Health Record Detail Modal */}
      {showHealthRecordModal && selectedHealthRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {selectedHealthRecord.type.replace(/_/g, ' ')}
              </h2>
              <button
                onClick={() => {
                  setShowHealthRecordModal(false);
                  setSelectedHealthRecord(null);
                }}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-foreground">{new Date(selectedHealthRecord.date).toLocaleDateString()}</p>
              </div>

              {selectedHealthRecord.provider && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Provider</label>
                  <p className="text-foreground">{selectedHealthRecord.provider}</p>
                </div>
              )}

              {selectedHealthRecord.diagnosis && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedHealthRecord.diagnosis}</p>
                </div>
              )}

              {selectedHealthRecord.treatment && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Treatment</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedHealthRecord.treatment}</p>
                </div>
              )}

              {selectedHealthRecord.findings && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Findings</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedHealthRecord.findings}</p>
                </div>
              )}

              {selectedHealthRecord.followUpNotes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedHealthRecord.followUpNotes}</p>
                </div>
              )}

              {selectedHealthRecord.followUpDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Follow-up Date</label>
                  <p className="text-foreground">{new Date(selectedHealthRecord.followUpDate).toLocaleDateString()}</p>
                </div>
              )}

              {selectedHealthRecord.cost && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cost</label>
                  <p className="text-foreground">${selectedHealthRecord.cost.toFixed(2)}</p>
                </div>
              )}

              {selectedHealthRecord.attachments && selectedHealthRecord.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Attachments</label>
                  <div className="space-y-2">
                    {selectedHealthRecord.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded bg-background hover:bg-accent text-amber-600 hover:text-amber-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{att.filename || 'View Document'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
