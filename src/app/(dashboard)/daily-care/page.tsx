'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import {
  Stethoscope,
  Utensils,
  Pill,
  Check,
  AlertTriangle,
  Loader2,
  Sun,
  Moon,
  Printer,
} from 'lucide-react';

type TabId = 'overview' | 'health-checks' | 'feeding' | 'medications';

interface DailyStats {
  healthChecks: { completed: number; total: number };
  feeding: { am: number; pm: number; total: number };
  medications: { given: number; due: number; overdue: number };
}

interface FeedLog {
  id: string;
  horseId: string;
  feedingTime: string;
  amountEaten: string;
  loggedAt: string;
  horse?: { barnName: string };
}

interface HealthCheck {
  id: string;
  horseId: string;
  overallCondition: string;
  date: string;
  horse?: { barnName: string };
}

interface FeedChartHorse {
  id: string;
  barnName: string;
  stall: string;
  hasFeedProgram: boolean;
  feedSchedule: Record<string, {
    items: { name: string; amount: number | null; unit: string | null }[];
  }>;
}

function FeedChartGrid({
  feedChartData,
  chartTime,
  setChartTime,
  barnName,
}: {
  feedChartData: { feedingTimes: string[]; horses: FeedChartHorse[] };
  chartTime: string;
  setChartTime: (t: string) => void;
  barnName: string;
}) {
  const [showPrint, setShowPrint] = useState(false);

  const allFeedNames = Array.from(
    new Set(
      feedChartData.horses.flatMap(h =>
        (h.feedSchedule[chartTime]?.items || []).map(i => i.name)
      )
    )
  ).sort();

  const handlePrint = () => {
    setShowPrint(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setShowPrint(false);
      });
    });
  };

  const printDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <>
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Feed Plan Chart</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-secondary btn-sm flex items-center gap-1.5"
            title="Print feed chart"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <div className="flex gap-1">
          {feedChartData.feedingTimes.map(time => (
            <button
              key={time}
              onClick={() => setChartTime(time)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                chartTime === time
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {time}
            </button>
          ))}
          </div>
        </div>
      </div>

      {allFeedNames.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No feed plans set for {chartTime} feedings.</p>
          <Link href="/feed-chart" className="mt-2 inline-block text-sm text-amber-600 hover:underline">
            Set up feed programs
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm border-collapse min-w-max">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide min-w-[160px]">
                  Horse
                </th>
                {allFeedNames.map(name => (
                  <th key={name} className="text-center px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide min-w-[110px]">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feedChartData.horses.map((horse, i) => {
                const items = horse.feedSchedule[chartTime]?.items || [];
                const itemMap = new Map(items.map(item => [item.name, item]));
                return (
                  <tr
                    key={horse.id}
                    className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold flex-shrink-0">
                          {horse.barnName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm leading-tight">{horse.barnName}</p>
                          {horse.stall && horse.stall !== 'No stall' && (
                            <p className="text-xs text-muted-foreground">{horse.stall}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {allFeedNames.map(name => {
                      const item = itemMap.get(name);
                      return (
                        <td key={name} className="px-4 py-3 text-center">
                          {item ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                              {item.amount != null ? item.amount : ''}
                              {item.unit ? ` ${item.unit}` : ''}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Printable feed chart — hidden on screen, shown on print */}
    {showPrint && (
      <div className="printable-feed-chart-wrapper">
        <div style={{ padding: '0.5in', fontFamily: 'sans-serif', color: 'black', background: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #d4c5b5', paddingBottom: '12px' }}>
            <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: 0 }}>Feed Plan Chart</h1>
            <p style={{ fontSize: '10pt', color: '#666', margin: '4px 0 0' }}>{barnName} &mdash; {printDate}</p>
          </div>

          {feedChartData.feedingTimes.map(time => {
            const timeNames = Array.from(
              new Set(feedChartData.horses.flatMap(h => (h.feedSchedule[time]?.items || []).map(i => i.name)))
            ).sort();
            if (timeNames.length === 0) return null;
            return (
              <div key={time} style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 'bold', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7c5c2b' }}>{time} Feeding</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                  <thead>
                    <tr style={{ background: '#f5f0ea' }}>
                      <th style={{ textAlign: 'left', padding: '6px 10px', border: '1px solid #d4c5b5', fontWeight: 600, minWidth: '130px' }}>Horse</th>
                      {timeNames.map(name => (
                        <th key={name} style={{ textAlign: 'center', padding: '6px 10px', border: '1px solid #d4c5b5', fontWeight: 600 }}>{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feedChartData.horses.map((horse, i) => {
                      const items = horse.feedSchedule[time]?.items || [];
                      const itemMap = new Map(items.map(item => [item.name, item]));
                      return (
                        <tr key={horse.id} style={{ background: i % 2 === 0 ? '#fff' : '#faf8f5' }}>
                          <td style={{ padding: '6px 10px', border: '1px solid #d4c5b5', fontWeight: 500 }}>
                            {horse.barnName}
                            {horse.stall && horse.stall !== 'No stall' && (
                              <span style={{ fontSize: '7.5pt', color: '#888', marginLeft: '6px' }}>({horse.stall})</span>
                            )}
                          </td>
                          {timeNames.map(name => {
                            const item = itemMap.get(name);
                            return (
                              <td key={name} style={{ padding: '6px 10px', border: '1px solid #d4c5b5', textAlign: 'center' }}>
                                {item
                                  ? `${item.amount != null ? item.amount : ''}${item.unit ? ' ' + item.unit : ''}`
                                  : <span style={{ color: '#ccc' }}>—</span>
                                }
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '7.5pt', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            Printed from BarnKeep &mdash; {printDate}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default function DailyCarePage() {
  const { currentBarn } = useBarn();
  const { horses } = useHorses();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [checkedHorseIds, setCheckedHorseIds] = useState<Set<string>>(new Set());
  const [amFedHorseIds, setAmFedHorseIds] = useState<Set<string>>(new Set());
  const [pmFedHorseIds, setPmFedHorseIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintView, setShowPrintView] = useState(false);
  const [feedChartData, setFeedChartData] = useState<{ feedingTimes: string[]; horses: FeedChartHorse[] } | null>(null);
  const [chartTime, setChartTime] = useState<string>('AM');
  const [stats, setStats] = useState<DailyStats>({
    healthChecks: { completed: 0, total: 0 },
    feeding: { am: 0, pm: 0, total: 0 },
    medications: { given: 0, due: 0, overdue: 0 },
  });

  // Fetch all daily care data
  useEffect(() => {
    const fetchDailyCareData = async () => {
      if (!currentBarn?.id) return;

      const today = new Date().toISOString().split('T')[0];

      try {
        // Fetch all daily care data in parallel
        const [feedLogsRes, healthChecksRes, feedChartRes] = await Promise.all([
          fetch(`/api/barns/${currentBarn.id}/feed-logs?date=${today}`),
          fetch(`/api/barns/${currentBarn.id}/health-checks?date=${today}`),
          fetch(`/api/barns/${currentBarn.id}/feed-chart`),
        ]);

        const [feedLogsData, healthChecksData, feedChartRaw] = await Promise.all([
          feedLogsRes.json(),
          healthChecksRes.json(),
          feedChartRes.json(),
        ]);

        if (feedChartRaw?.data) {
          setFeedChartData(feedChartRaw.data);
          if (feedChartRaw.data.feedingTimes?.length > 0) {
            setChartTime(feedChartRaw.data.feedingTimes[0]);
          }
        }

        // Store and calculate feed logs stats (AM/PM feedings) - count unique horses fed
        const feedLogsArr: FeedLog[] = feedLogsData.data || [];
        setFeedLogs(feedLogsArr);

        const amFedSet = new Set(
          feedLogsArr
            .filter((log) => log.feedingTime === 'AM' || log.feedingTime === 'MORNING')
            .map((log) => log.horseId)
        );
        const pmFedSet = new Set(
          feedLogsArr
            .filter((log) => log.feedingTime === 'PM' || log.feedingTime === 'EVENING')
            .map((log) => log.horseId)
        );
        setAmFedHorseIds(amFedSet);
        setPmFedHorseIds(pmFedSet);

        // Store and calculate health check stats - unique horses checked today
        const healthChecksArr: HealthCheck[] = healthChecksData.data || [];
        setHealthChecks(healthChecksArr);

        const checkedSet = new Set(
          healthChecksArr.map((check) => check.horseId)
        );
        setCheckedHorseIds(checkedSet);

        // Fetch medication stats
        let medicationStats = { given: 0, due: 0, overdue: 0 };
        try {
          const horsesWithMeds = horses?.filter(h => (h.activeMedicationCount || 0) > 0) || [];
          let totalGiven = 0;
          let totalDue = 0;

          // Fetch medications for each horse with active medications
          for (const horse of horsesWithMeds) {
            const medsRes = await fetch(`/api/barns/${currentBarn.id}/horses/${horse.id}/medications`);
            const medsData = await medsRes.json();
            const activeMeds = (medsData.data || []).filter((m: { status: string }) => m.status === 'ACTIVE');

            for (const med of activeMeds) {
              totalDue++;
              // Check if medication was logged today by fetching medication details
              const medDetailRes = await fetch(`/api/barns/${currentBarn.id}/horses/${horse.id}/medications/${med.id}`);
              const medDetail = await medDetailRes.json();
              const todayLogs = (medDetail.data?.logs || []).filter((log: { givenAt: string }) => {
                const logDate = new Date(log.givenAt).toISOString().split('T')[0];
                return logDate === today;
              });
              if (todayLogs.length > 0) {
                totalGiven++;
              }
            }
          }

          medicationStats = {
            given: totalGiven,
            due: totalDue,
            overdue: Math.max(0, totalDue - totalGiven),
          };
        } catch (medError) {
          console.error('Failed to fetch medication stats:', medError);
        }

        setStats({
          healthChecks: { completed: checkedSet.size, total: horses?.length || 0 },
          feeding: { am: amFedSet.size, pm: pmFedSet.size, total: horses?.length || 0 },
          medications: medicationStats,
        });
      } catch (error) {
        console.error('Failed to fetch daily care data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyCareData();
  }, [currentBarn?.id, horses]);

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: Stethoscope },
    { id: 'health-checks' as TabId, label: 'Health Checks', icon: Stethoscope },
    { id: 'feeding' as TabId, label: 'Feeding', icon: Utensils },
    { id: 'medications' as TabId, label: 'Medications', icon: Pill, count: stats.medications.overdue > 0 ? stats.medications.overdue : undefined },
  ];

  const handlePrintCareSheet = () => {
    setShowPrintView(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setShowPrintView(false);
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Care</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handlePrintCareSheet}
          className="btn-secondary btn-md flex items-center gap-2"
          title="Print daily care sheet for all horses"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print Care Sheet</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border -mx-4 sm:mx-0">
        <nav className="flex gap-0.5 overflow-x-auto scrollbar-hide px-4 sm:px-0">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0
                ${activeTab === id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === id ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('health-checks')}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Stethoscope className="w-5 h-5 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  {stats.healthChecks.completed}/{stats.healthChecks.total}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.healthChecks.total > 0
                  ? Math.round((stats.healthChecks.completed / stats.healthChecks.total) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Health checks done</p>
            </button>

            <button
              onClick={() => setActiveTab('feeding')}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Utensils className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.feeding.am + stats.feeding.pm}/{stats.feeding.total * 2}
              </p>
              <p className="text-sm text-muted-foreground">Feedings logged</p>
            </button>

            <button
              onClick={() => setActiveTab('medications')}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Pill className="w-5 h-5 text-purple-500" />
                {stats.medications.overdue > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    {stats.medications.overdue} overdue
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.medications.given}</p>
              <p className="text-sm text-muted-foreground">Medications given</p>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/log/daily-check"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-center"
              >
                <Stethoscope className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-700">Log Health Check</span>
              </Link>
              <Link
                href="/log/feed"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors text-center"
              >
                <Utensils className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Log Feeding</span>
              </Link>
              <Link
                href="/log/medication"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-center"
              >
                <Pill className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Log Medication</span>
              </Link>
            </div>
          </div>

          {/* Overdue Medications Alert */}
          {stats.medications.overdue > 0 && (
            <div className="card p-5 border-red-200 bg-red-50/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-semibold text-red-900">Overdue Medications</h2>
              </div>
              <p className="text-sm text-red-700">
                {stats.medications.overdue} medication{stats.medications.overdue > 1 ? 's' : ''} still need to be given today.
              </p>
            </div>
          )}

          {/* Horse Overview */}
          <div className="card p-5">
            <h2 className="font-semibold text-foreground mb-4">Horse Status Today</h2>
            <div className="space-y-2">
              {horses?.map(horse => {
                const isChecked = checkedHorseIds.has(horse.id);
                const amFed = amFedHorseIds.has(horse.id);
                const pmFed = pmFedHorseIds.has(horse.id);
                return (
                  <div key={horse.id} className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {horse.profilePhotoUrl ? (
                        <Image src={horse.profilePhotoUrl} alt={horse.barnName} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                          {horse.barnName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{horse.barnName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${isChecked ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {isChecked ? <Check className="w-3 h-3 inline mr-0.5" /> : null}
                        Health
                      </span>
                      <span className={`px-2 py-1 rounded ${amFed ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                        AM
                      </span>
                      <span className={`px-2 py-1 rounded ${pmFed ? 'bg-indigo-100 text-indigo-700' : 'bg-muted text-muted-foreground'}`}>
                        PM
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'health-checks' && (
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Today's Health Checks</h2>
              <Link href="/log/daily-check" className="btn-primary btn-sm">
                <Stethoscope className="w-4 h-4" />
                Start Checks
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              {stats.healthChecks.completed} of {stats.healthChecks.total} horses checked today
            </p>
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${stats.healthChecks.total > 0
                    ? (stats.healthChecks.completed / stats.healthChecks.total) * 100
                    : 0}%`
                }}
              />
            </div>
            {/* Horse list */}
            <div className="mt-6 space-y-2">
              {horses?.map(horse => {
                const isChecked = checkedHorseIds.has(horse.id);
                const horseCheck = healthChecks.find(c => c.horseId === horse.id);
                return (
                  <div key={horse.id} className={`flex items-center gap-3 p-3 rounded-lg ${isChecked ? 'bg-green-50 border border-green-200' : 'bg-background'}`}>
                    <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden">
                      {horse.profilePhotoUrl ? (
                        <Image src={horse.profilePhotoUrl} alt={horse.barnName} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                          {horse.barnName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{horse.barnName}</p>
                      {isChecked && horseCheck?.overallCondition && (
                        <p className="text-xs text-green-600">Condition: {horseCheck.overallCondition}</p>
                      )}
                    </div>
                    {isChecked ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <Check className="w-4 h-4" />
                        Checked
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not checked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feeding' && (
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Today's Feedings</h2>
              <Link href="/log/feed" className="btn-primary btn-sm">
                <Utensils className="w-4 h-4" />
                Log Feeding
              </Link>
            </div>

            {/* Feeding times */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-amber-900">Morning</span>
                </div>
                <p className="text-2xl font-bold text-amber-900">{stats.feeding.am}/{stats.feeding.total}</p>
                <p className="text-sm text-amber-700">horses fed</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-indigo-900">Evening</span>
                </div>
                <p className="text-2xl font-bold text-indigo-900">{stats.feeding.pm}/{stats.feeding.total}</p>
                <p className="text-sm text-indigo-700">horses fed</p>
              </div>
            </div>

            {/* Horse feeding status */}
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Feeding Status by Horse</h3>
              {horses?.map(horse => {
                const amFed = amFedHorseIds.has(horse.id);
                const pmFed = pmFedHorseIds.has(horse.id);
                const amLog = feedLogs.find(l => l.horseId === horse.id && (l.feedingTime === 'AM' || l.feedingTime === 'MORNING'));
                const pmLog = feedLogs.find(l => l.horseId === horse.id && (l.feedingTime === 'PM' || l.feedingTime === 'EVENING'));
                return (
                  <div key={horse.id} className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <div className="relative w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {horse.profilePhotoUrl ? (
                        <Image src={horse.profilePhotoUrl} alt={horse.barnName} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                          {horse.barnName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{horse.barnName}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        amFed
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Sun className="w-3 h-3" />
                        AM {amFed && amLog?.amountEaten ? `(${amLog.amountEaten})` : ''}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        pmFed
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Moon className="w-3 h-3" />
                        PM {pmFed && pmLog?.amountEaten ? `(${pmLog.amountEaten})` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {feedChartData && (
            <FeedChartGrid
              feedChartData={feedChartData}
              chartTime={chartTime}
              setChartTime={setChartTime}
              barnName={currentBarn?.name ?? ''}
            />
          )}
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Today's Medications</h2>
              <Link href="/log/medication" className="btn-primary btn-sm">
                <Pill className="w-4 h-4" />
                Log Medication
              </Link>
            </div>

            {stats.medications.overdue > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-900">{stats.medications.overdue} overdue medications</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-background">
                <p className="text-2xl font-bold text-foreground">{stats.medications.given}</p>
                <p className="text-sm text-muted-foreground">Given</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-background">
                <p className="text-2xl font-bold text-foreground">{stats.medications.due}</p>
                <p className="text-sm text-muted-foreground">Due today</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50">
                <p className="text-2xl font-bold text-red-600">{stats.medications.overdue}</p>
                <p className="text-sm text-red-500">Overdue</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Care Sheet (hidden on screen, visible on print) */}
      {showPrintView && (
        <div className="printable-calendar-wrapper">
          <div className="printable-calendar">
            <div className="print-header">
              <h1 className="print-title">Daily Care Sheet</h1>
              <p className="print-barn-name">
                {currentBarn?.name} &mdash; {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <table className="print-table" style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th className="print-day-header" style={{ width: '18%', textAlign: 'left', padding: '8px' }}>Horse</th>
                  <th className="print-day-header" style={{ width: '22%', textAlign: 'left', padding: '8px' }}>Feed (AM/PM)</th>
                  <th className="print-day-header" style={{ width: '22%', textAlign: 'left', padding: '8px' }}>Medications</th>
                  <th className="print-day-header" style={{ width: '18%', textAlign: 'left', padding: '8px' }}>Turnout</th>
                  <th className="print-day-header" style={{ width: '20%', textAlign: 'left', padding: '8px' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {horses?.sort((a, b) => a.barnName.localeCompare(b.barnName)).map((horse) => {
                  const isChecked = checkedHorseIds.has(horse.id);
                  const amFed = amFedHorseIds.has(horse.id);
                  const pmFed = pmFedHorseIds.has(horse.id);
                  return (
                    <tr key={horse.id}>
                      <td style={{ border: '1px solid #d4c5b5', padding: '6px 8px', verticalAlign: 'top' }}>
                        <strong style={{ fontSize: '9pt' }}>{horse.barnName}</strong>
                        {horse.stallName && (
                          <div style={{ fontSize: '7pt', color: '#888' }}>Stall: {horse.stallName}</div>
                        )}
                      </td>
                      <td style={{ border: '1px solid #d4c5b5', padding: '6px 8px', verticalAlign: 'top', fontSize: '8pt' }}>
                        <div>AM: {amFed ? '✓' : '☐'}</div>
                        <div>PM: {pmFed ? '✓' : '☐'}</div>
                      </td>
                      <td style={{ border: '1px solid #d4c5b5', padding: '6px 8px', verticalAlign: 'top', fontSize: '8pt' }}>
                        {(horse.activeMedicationCount || 0) > 0
                          ? `${horse.activeMedicationCount} active`
                          : 'None'}
                      </td>
                      <td style={{ border: '1px solid #d4c5b5', padding: '6px 8px', verticalAlign: 'top', fontSize: '8pt' }}>
                        ☐ Out &nbsp;&nbsp; ☐ In
                      </td>
                      <td style={{ border: '1px solid #d4c5b5', padding: '6px 8px', verticalAlign: 'top', fontSize: '8pt' }}>
                        {horse.statusNote || (isChecked ? '✓ Checked' : '')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="print-footer">
              <p>Printed from BarnKeep &mdash; {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
