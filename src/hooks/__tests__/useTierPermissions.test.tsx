import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useTierPermissions, useTier } from '../useTierPermissions';

// Mock fetch for the subscription API
global.fetch = jest.fn();

describe('useTierPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns CORE tier defaults initially', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tier: 'CORE' }),
    });

    const { result } = renderHook(() =>
      useTierPermissions({ barnId: 'test-barn' })
    );

    // Initially defaults to CORE
    expect(result.current.tier).toBe('CORE');
    expect(result.current.loading).toBe(true);
  });

  it('fetches and sets CORE tier', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tier: 'CORE' }),
    });

    const { result } = renderHook(() =>
      useTierPermissions({ barnId: 'test-barn' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tier).toBe('CORE');
    expect(result.current.limits.maxHorses).toBe(10);
    expect(result.current.limits.maxTeamMembers).toBe(5);
    expect(result.current.features.canUploadPhotos).toBe(true);
    expect(result.current.nextTier).toBe('PRO');
    expect(result.current.tierDisplayName).toBe('Core');
  });

  it('fetches and sets PRO tier', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tier: 'PRO' }),
    });

    const { result } = renderHook(() =>
      useTierPermissions({ barnId: 'test-barn' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tier).toBe('PRO');
    expect(result.current.limits.maxHorses).toBe(-1); // unlimited
    expect(result.current.nextTier).toBeNull();
    expect(result.current.tierDisplayName).toBe('Pro');
  });

  it('checkPhotoLimit respects CORE tier limits', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tier: 'CORE' }),
    });

    const { result } = renderHook(() =>
      useTierPermissions({ barnId: 'test-barn' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.checkPhotoLimit(19)).toBe(false);
    expect(result.current.checkPhotoLimit(20)).toBe(true);
  });

  it('getRemainingPhotos returns correct count', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tier: 'CORE' }),
    });

    const { result } = renderHook(() =>
      useTierPermissions({ barnId: 'test-barn' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getRemainingPhotos(15)).toBe(5);
    expect(result.current.getRemainingPhotos(20)).toBe(0);
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useTierPermissions({ barnId: 'test-barn' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Falls back to CORE
    expect(result.current.tier).toBe('CORE');

    consoleSpy.mockRestore();
  });
});

describe('useTier (without provider)', () => {
  it('returns default CORE tier values when no provider', () => {
    const { result } = renderHook(() => useTier());

    expect(result.current.tier).toBe('CORE');
    expect(result.current.loading).toBe(false);
    expect(result.current.features.canUploadPhotos).toBe(true);
    expect(result.current.limits.maxHorses).toBe(10);
    expect(result.current.nextTier).toBe('PRO');
    expect(result.current.tierDisplayName).toBe('Core');
  });
});
