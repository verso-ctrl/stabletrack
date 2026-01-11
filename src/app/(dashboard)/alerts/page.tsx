'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBarn } from '@/contexts/BarnContext';
import { useAlerts } from '@/hooks/useData';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronRight,
  Filter,
  Loader2,
  Bell,
  BellOff,
} from 'lucide-react';

const alertTypeConfig = {
  urgent: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-800',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800',
  },
};

export default function AlertsPage() {
  const { currentBarn } = useBarn();
  const { alerts, isLoading } = useAlerts();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const filteredAlerts = alerts.filter((alert) => {
    if (dismissedAlerts.includes(alert.id)) return false;
    if (typeFilter === 'all') return true;
    return alert.type === typeFilter;
  });

  const urgentCount = alerts.filter(a => a.type === 'urgent' && !dismissedAlerts.includes(a.id)).length;
  const warningCount = alerts.filter(a => a.type === 'warning' && !dismissedAlerts.includes(a.id)).length;
  const infoCount = alerts.filter(a => a.type === 'info' && !dismissedAlerts.includes(a.id)).length;

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const dismissAll = () => {
    setDismissedAlerts(alerts.map(a => a.id));
  };

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
          <h1 className="text-2xl font-bold text-stone-900">Alerts</h1>
          <p className="text-stone-500 mt-1">Stay on top of important notifications</p>
        </div>
        {filteredAlerts.length > 0 && (
          <button
            onClick={dismissAll}
            className="btn-secondary flex items-center gap-2"
          >
            <BellOff className="w-4 h-4" />
            Dismiss All
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setTypeFilter(typeFilter === 'urgent' ? 'all' : 'urgent')}
          className={`card p-4 text-left transition-all ${typeFilter === 'urgent' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{urgentCount}</p>
              <p className="text-sm text-stone-500">Urgent</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setTypeFilter(typeFilter === 'warning' ? 'all' : 'warning')}
          className={`card p-4 text-left transition-all ${typeFilter === 'warning' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{warningCount}</p>
              <p className="text-sm text-stone-500">Warnings</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setTypeFilter(typeFilter === 'info' ? 'all' : 'info')}
          className={`card p-4 text-left transition-all ${typeFilter === 'info' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{infoCount}</p>
              <p className="text-sm text-stone-500">Info</p>
            </div>
          </div>
        </button>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const config = alertTypeConfig[alert.type as keyof typeof alertTypeConfig] || alertTypeConfig.info;
            const Icon = config.icon;
            
            return (
              <div
                key={alert.id}
                className={`card p-4 ${config.bgColor} ${config.borderColor} border`}
              >
                <div className="flex items-start gap-4">
                  <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${config.textColor}`}>{alert.title}</h3>
                    <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>{alert.message}</p>
                    {alert.horseName && (
                      <p className="text-sm mt-2 text-stone-600">
                        Horse: <span className="font-medium">{alert.horseName}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.actionUrl && (
                      <Link
                        href={alert.actionUrl}
                        className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900"
                      >
                        View
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 rounded text-stone-400 hover:text-stone-600 hover:bg-white/50"
                      title="Dismiss"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Bell className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-medium text-stone-900 mb-2">All caught up!</h3>
          <p className="text-stone-500">
            {dismissedAlerts.length > 0 
              ? "You've dismissed all alerts" 
              : "No alerts at the moment"}
          </p>
          {dismissedAlerts.length > 0 && (
            <button
              onClick={() => setDismissedAlerts([])}
              className="btn-secondary mt-4"
            >
              Restore Dismissed Alerts
            </button>
          )}
        </div>
      )}
    </div>
  );
}
