import {
  normalizeTier,
  getNextTier,
  getTierLimits,
  getTierPricing,
  getTierFeatures,
  hasReachedPhotoLimit,
  hasReachedHorseLimit,
  hasReachedTeamMemberLimit,
  formatBytes,
  formatPrice,
  getTierDisplayName,
  wouldExceedStorageLimit,
} from '../tiers';

describe('normalizeTier', () => {
  it('maps FREE to CORE', () => {
    expect(normalizeTier('FREE')).toBe('CORE');
  });

  it('maps BASIC to CORE', () => {
    expect(normalizeTier('BASIC')).toBe('CORE');
  });

  it('maps CORE to CORE', () => {
    expect(normalizeTier('CORE')).toBe('CORE');
  });

  it('maps ADVANCED to PRO', () => {
    expect(normalizeTier('ADVANCED')).toBe('PRO');
  });

  it('maps ENTERPRISE to PRO', () => {
    expect(normalizeTier('ENTERPRISE')).toBe('PRO');
  });

  it('maps PRO to PRO', () => {
    expect(normalizeTier('PRO')).toBe('PRO');
  });

  it('maps garbage strings to CORE', () => {
    expect(normalizeTier('garbage')).toBe('CORE');
    expect(normalizeTier('UNKNOWN')).toBe('CORE');
    expect(normalizeTier('')).toBe('CORE');
  });

  it('is case-insensitive', () => {
    expect(normalizeTier('free')).toBe('CORE');
    expect(normalizeTier('pro')).toBe('PRO');
    expect(normalizeTier('Advanced')).toBe('PRO');
  });
});

describe('getNextTier', () => {
  it('returns PRO for CORE', () => {
    expect(getNextTier('CORE')).toBe('PRO');
  });

  it('returns null for PRO', () => {
    expect(getNextTier('PRO')).toBeNull();
  });

  it('handles legacy tier names', () => {
    expect(getNextTier('FREE')).toBe('PRO');
    expect(getNextTier('BASIC')).toBe('PRO');
    expect(getNextTier('ADVANCED')).toBeNull();
    expect(getNextTier('ENTERPRISE')).toBeNull();
  });
});

describe('getTierLimits', () => {
  it('returns correct limits for CORE', () => {
    const limits = getTierLimits('CORE');
    expect(limits.maxHorses).toBe(10);
    expect(limits.maxTeamMembers).toBe(5);
    expect(limits.maxStorageBytes).toBe(10 * 1024 * 1024 * 1024);
    expect(limits.maxPhotosPerHorse).toBe(20);
  });

  it('returns unlimited for PRO', () => {
    const limits = getTierLimits('PRO');
    expect(limits.maxHorses).toBe(-1);
    expect(limits.maxTeamMembers).toBe(-1);
    expect(limits.maxStorageBytes).toBe(50 * 1024 * 1024 * 1024);
    expect(limits.maxPhotosPerHorse).toBe(-1);
  });
});

describe('getTierPricing', () => {
  it('returns correct prices for CORE', () => {
    const pricing = getTierPricing('CORE');
    expect(pricing.monthlyPriceCents).toBe(2500);
    expect(pricing.annualPriceCents).toBe(25000);
    expect(pricing.displayName).toBe('Core');
    expect(pricing.popular).toBe(true);
  });

  it('returns correct prices for PRO', () => {
    const pricing = getTierPricing('PRO');
    expect(pricing.monthlyPriceCents).toBe(5000);
    expect(pricing.annualPriceCents).toBe(50000);
    expect(pricing.displayName).toBe('Pro');
  });
});

describe('getTierFeatures', () => {
  it('returns core features for CORE', () => {
    const features = getTierFeatures('CORE');
    expect(features.horseProfiles).toBe(true);
    expect(features.basicHealthRecords).toBe(true);
    expect(features.simpleCalendar).toBe(true);
    expect(features.canUploadPhotos).toBe(true);
    expect(features.taskManagement).toBe(true);
  });

  it('returns priority support for PRO', () => {
    const features = getTierFeatures('PRO');
    expect(features.prioritySupport).toBe(true);
  });

  it('CORE does not have priority support', () => {
    const features = getTierFeatures('CORE');
    expect(features.prioritySupport).toBe(false);
  });
});

describe('hasReachedPhotoLimit', () => {
  it('returns true when CORE horse has 20 photos', () => {
    expect(hasReachedPhotoLimit('CORE', 20)).toBe(true);
  });

  it('returns false when CORE horse has fewer than 20 photos', () => {
    expect(hasReachedPhotoLimit('CORE', 19)).toBe(false);
  });

  it('returns false for PRO regardless of count', () => {
    expect(hasReachedPhotoLimit('PRO', 100)).toBe(false);
    expect(hasReachedPhotoLimit('PRO', 10000)).toBe(false);
  });
});

describe('hasReachedHorseLimit', () => {
  it('returns true when CORE barn has 10 horses', () => {
    expect(hasReachedHorseLimit('CORE', 10)).toBe(true);
  });

  it('returns false when CORE barn has fewer than 10 horses', () => {
    expect(hasReachedHorseLimit('CORE', 9)).toBe(false);
  });

  it('returns false for PRO regardless of count', () => {
    expect(hasReachedHorseLimit('PRO', 100)).toBe(false);
  });
});

describe('hasReachedTeamMemberLimit', () => {
  it('returns true when CORE barn has 5 members', () => {
    expect(hasReachedTeamMemberLimit('CORE', 5)).toBe(true);
  });

  it('returns false when CORE barn has fewer than 5 members', () => {
    expect(hasReachedTeamMemberLimit('CORE', 4)).toBe(false);
  });

  it('returns false for PRO regardless of count', () => {
    expect(hasReachedTeamMemberLimit('PRO', 50)).toBe(false);
  });
});

describe('wouldExceedStorageLimit', () => {
  it('returns true when adding file would exceed CORE limit', () => {
    const tenGB = 10 * 1024 * 1024 * 1024;
    expect(wouldExceedStorageLimit('CORE', tenGB - 100, 200)).toBe(true);
  });

  it('returns false when within CORE limit', () => {
    expect(wouldExceedStorageLimit('CORE', 0, 1024)).toBe(false);
  });
});

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats bytes as KB', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats bytes as MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });

  it('formats bytes as GB', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('formats with decimal precision', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });
});

describe('formatPrice', () => {
  it('formats 0 as Free', () => {
    expect(formatPrice(0)).toBe('Free');
  });

  it('formats monthly price', () => {
    expect(formatPrice(2500)).toBe('$25/month');
  });

  it('formats annual price', () => {
    expect(formatPrice(25000, true)).toBe('$250/year');
  });
});

describe('getTierDisplayName', () => {
  it('returns Core for CORE', () => {
    expect(getTierDisplayName('CORE')).toBe('Core');
  });

  it('returns Pro for PRO', () => {
    expect(getTierDisplayName('PRO')).toBe('Pro');
  });

  it('handles legacy tier names', () => {
    expect(getTierDisplayName('FREE')).toBe('Core');
    expect(getTierDisplayName('ADVANCED')).toBe('Pro');
  });
});
