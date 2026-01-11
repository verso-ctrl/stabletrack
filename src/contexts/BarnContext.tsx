'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Barn, BarnRole } from '@/types';

type AccessType = 'member' | 'client';

interface BarnWithAccess extends Barn {
  role: BarnRole;
  accessType: AccessType;
  clientId?: string;  // Only set when accessType is 'client'
  horses?: { id: string; barnName: string; profilePhotoUrl?: string }[];  // Client's horses
}

interface BarnContextType {
  barns: BarnWithAccess[];
  currentBarn: BarnWithAccess | null;
  setCurrentBarn: (barn: BarnWithAccess) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Helper properties
  isClient: boolean;  // True if current barn access is as client
  isMember: boolean;  // True if current barn access is as member
  memberBarns: BarnWithAccess[];  // Barns where user is a member
  clientBarns: BarnWithAccess[];  // Barns where user is a client
}

const BarnContext = createContext<BarnContextType | undefined>(undefined);

export function BarnProvider({ children }: { children: React.ReactNode }) {
  const [barns, setBarns] = useState<BarnWithAccess[]>([]);
  const [currentBarn, setCurrentBarnState] = useState<BarnWithAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBarns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/barns');
      const result = await response.json();
      
      if (!response.ok) {
        // If unauthorized, just set empty barns (user needs to sign in)
        if (response.status === 401) {
          setBarns([]);
          setIsLoading(false);
          return;
        }
        throw new Error(result.error || 'Failed to fetch barns');
      }
      
      // Add default accessType if not present (for backwards compatibility)
      const barnsWithAccess = (result.data || []).map((b: any) => ({
        ...b,
        accessType: b.accessType || 'member',
      }));
      
      setBarns(barnsWithAccess);
      
      // Set current barn from localStorage or first barn
      const savedBarnId = typeof window !== 'undefined' ? localStorage.getItem('currentBarnId') : null;
      const savedBarn = barnsWithAccess.find((b: BarnWithAccess) => b.id === savedBarnId);
      
      if (savedBarn) {
        setCurrentBarnState(savedBarn);
      } else if (barnsWithAccess.length > 0) {
        // Prefer member barns over client barns for default selection
        const memberBarn = barnsWithAccess.find((b: BarnWithAccess) => b.accessType === 'member');
        const defaultBarn = memberBarn || barnsWithAccess[0];
        setCurrentBarnState(defaultBarn);
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentBarnId', defaultBarn.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrentBarn = useCallback((barn: BarnWithAccess) => {
    setCurrentBarnState(barn);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentBarnId', barn.id);
    }
  }, []);

  useEffect(() => {
    fetchBarns();
  }, [fetchBarns]);

  // Computed values
  const isClient = currentBarn?.accessType === 'client';
  const isMember = currentBarn?.accessType === 'member';
  const memberBarns = barns.filter(b => b.accessType === 'member');
  const clientBarns = barns.filter(b => b.accessType === 'client');

  return (
    <BarnContext.Provider
      value={{
        barns,
        currentBarn,
        setCurrentBarn,
        isLoading,
        error,
        refetch: fetchBarns,
        isClient,
        isMember,
        memberBarns,
        clientBarns,
      }}
    >
      {children}
    </BarnContext.Provider>
  );
}

export function useBarn() {
  const context = useContext(BarnContext);
  
  if (context === undefined) {
    throw new Error('useBarn must be used within a BarnProvider');
  }
  
  return context;
}

export function useCurrentBarn() {
  const { currentBarn, isLoading, isClient, isMember } = useBarn();
  return { barn: currentBarn, isLoading, isClient, isMember };
}

export function useUserRole() {
  const { currentBarn } = useBarn();
  return currentBarn?.role ?? null;
}

export function useAccessType() {
  const { currentBarn } = useBarn();
  return currentBarn?.accessType ?? null;
}
